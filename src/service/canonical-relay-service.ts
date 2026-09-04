import type { Hop, HopStatus, PassIntent } from "../core/types.js";
import { RelayStore, RelayValidationError, isDormant, isIntentStale, validateTransactionAgainstIntent } from "../core/relay.js";
import type { NimiqRpcClient } from "../nimiq/rpc-client.js";
import { hasReachedFinality, isIncluded } from "../nimiq/rpc-client.js";

/**
 * The PRD's public status vocabulary for the "Minimal canonical data" table.
 * Distinct from `HopStatus`, which tracks the underlying transaction's exact
 * chain lifecycle (PENDING/INCLUDED/FINAL). This is the coarser view exposed
 * at the service boundary.
 */
export type PublicStatus = "READY" | "PENDING" | "CONFIRMED" | "CANCELLED" | "INVALID";

function toPublicStatus(status: HopStatus): PublicStatus {
  switch (status) {
    case "PENDING":
    case "INCLUDED":
      return "PENDING";
    case "FINAL":
      return "CONFIRMED";
    case "CANCELLED":
      return "CANCELLED";
    case "INVALID":
      return "INVALID";
  }
}

export interface PublicHop {
  baton_id: string;
  sequence: number;
  current_holder: string;
  recipient: string;
  tx_hash: string | null;
  status: PublicStatus;
  created_at: string; // ISO 8601
  confirmed_at: string | null; // ISO 8601
}

export interface PublicRelayView {
  baton_id: string;
  sequence: number;
  current_holder: string;
  status: PublicStatus;
  hop_count: number;
  activity: "ACTIVE" | "DORMANT";
}

function toPublicHop(hop: Hop): PublicHop {
  return {
    baton_id: hop.batonId,
    sequence: hop.sequence,
    current_holder: hop.currentHolder,
    recipient: hop.recipient,
    tx_hash: hop.txHash,
    status: toPublicStatus(hop.status),
    created_at: new Date(hop.createdAt).toISOString(),
    confirmed_at: hop.confirmedAt === null ? null : new Date(hop.confirmedAt).toISOString(),
  };
}

/**
 * Server-side only. Owns relay state and independently verifies every hop
 * against the Nimiq network via `NimiqRpcClient` (read-only JSON-RPC). Never
 * talks to a wallet or a Nimiq Pay provider — that only exists client-side,
 * inside the Mini App's webview (see `nimiq/pay-provider.ts`). The client
 * reports a broadcast's tx hash via `recordBroadcast`; this service treats
 * that as a claim to verify, not a fact to trust, and only advances the
 * canonical relay once its own RPC lookup confirms it.
 */
export class CanonicalRelayService {
  constructor(
    private store: RelayStore,
    private rpc: NimiqRpcClient
  ) {}

  /** Step 2 CHOOSE: commit the atomic intent before the client ever opens the wallet prompt. */
  initiatePass(batonId: string, currentHolder: string, recipient: string): PassIntent {
    return this.store.createIntent(batonId, currentHolder, recipient);
  }

  /**
   * Expire an intent deterministically and release the baton for a fresh
   * sequence-unchanged attempt. Any already-recorded broadcast remains in
   * history as INVALID; an unbroadcast intent gets an INVALID audit record.
   */
  private expireIntent(intent: PassIntent): Hop {
    const existingHop = this.store.getHop(intent.batonId, intent.sequence);
    let invalidHop: Hop;

    if (existingHop) {
      invalidHop = this.store.updateHop(intent.batonId, intent.sequence, { status: "INVALID" });
    } else {
      invalidHop = {
        batonId: intent.batonId,
        sequence: intent.sequence,
        currentHolder: intent.currentHolder,
        recipient: intent.recipient,
        nonce: intent.nonce,
        txHash: null,
        value: null,
        status: "INVALID",
        createdAt: intent.createdAt,
        confirmedAt: null,
      };
      this.store.recordHop(invalidHop);
    }

    this.store.cancelIntent(intent.batonId);
    return invalidHop;
  }

  /**
   * Step 3 PASS (server side of it): the client already drove the native
   * approval and got a tx hash back from the Nimiq Provider. Record it as a
   * PENDING hop under the currently active intent — this does not yet trust
   * the hash belongs to this intent; `reconcile` does that independently.
   */
  recordBroadcast(batonId: string, txHash: string): Hop {
    const intent = this.store.getActiveIntent(batonId);
    if (!intent) {
      throw new RelayValidationError("NO_ACTIVE_INTENT", `No active intent for baton ${batonId} to attach a broadcast to`);
    }
    if (isIntentStale(intent)) {
      this.expireIntent(intent);
      throw new RelayValidationError("STALE_INTENT", `Intent for baton ${batonId} expired before this broadcast was recorded`);
    }

    // Claim first. A single on-chain transaction can never advance two
    // different baton/sequence pairs, even when recipient data is absent.
    this.store.claimTransactionHash(intent.batonId, intent.sequence, txHash);

    const hop: Hop = {
      batonId: intent.batonId,
      sequence: intent.sequence,
      currentHolder: intent.currentHolder,
      recipient: intent.recipient,
      nonce: intent.nonce,
      txHash,
      value: null,
      status: "PENDING",
      createdAt: intent.createdAt,
      confirmedAt: null,
    };
    this.store.recordHop(hop);
    return hop;
  }

  /**
   * Cancellation leaves the baton with the current holder (product law).
   * It is only safe before any tx hash exists. Once a hash is returned, that
   * transaction may still land on-chain after the client disappears, so the
   * intent must remain available for reconciliation until it finalizes,
   * becomes invalid, or expires.
   */
  cancelPass(batonId: string): void {
    const intent = this.store.getActiveIntent(batonId);
    if (!intent) return;

    const hop = this.store.getHop(batonId, intent.sequence);
    if (hop?.txHash) {
      throw new RelayValidationError(
        "BROADCAST_ALREADY_RECORDED",
        `Cannot cancel baton ${batonId} after a transaction hash has been recorded; reconcile it instead`
      );
    }

    this.store.cancelIntent(batonId);
  }

  /**
   * Step 4 VERIFY: independently confirm a pending hop against the network.
   * Idempotent and safe to call repeatedly — this is exactly what makes
   * "app closed and reopened mid-transaction" reconcile correctly: there is
   * nothing to re-decide, only state to re-read and re-check.
   *
   * Fails closed per the PRD's product laws: any mismatch marks the hop
   * INVALID and throws, and the canonical sequence never advances.
   */
  async reconcile(batonId: string): Promise<Hop | null> {
    const intent = this.store.getActiveIntent(batonId);
    if (!intent) return null; // nothing in flight for this baton

    const hop = this.store.getHop(batonId, intent.sequence);
    if (!hop || hop.txHash === null) {
      if (isIntentStale(intent)) {
        return this.expireIntent(intent);
      }
      return hop ?? null; // intent committed, but no broadcast reported yet
    }

    const tx = await this.rpc.getTransactionByHash(hop.txHash);
    if (!tx) {
      // Not observed on-chain yet. Only give up once the intent itself is
      // stale — a transaction can legitimately sit unconfirmed for a while.
      if (isIntentStale(intent)) {
        return this.expireIntent(intent);
      }
      return hop;
    }

    // Never advance on a mismatched observation — INVALID and rethrow.
    try {
      validateTransactionAgainstIntent(intent, tx);
    } catch (err) {
      this.store.updateHop(batonId, intent.sequence, { status: "INVALID" });
      throw err;
    }

    if (!isIncluded(tx)) return hop; // still PENDING in mempool

    const headBlockNumber = await this.rpc.getBlockNumber();
    const final = hasReachedFinality(tx, headBlockNumber);
    return this.store.updateHop(batonId, intent.sequence, {
      status: final ? "FINAL" : "INCLUDED",
      value: tx.value,
      confirmedAt: final ? Date.now() : null,
    });
  }

  getHistory(batonId: string): PublicHop[] {
    return this.store.getHops(batonId).map(toPublicHop);
  }

  getPublicView(batonId: string, now = Date.now()): PublicRelayView {
    const hops = this.store.getHops(batonId);
    const intent = this.store.getActiveIntent(batonId);
    const latest = hops[hops.length - 1];

    const status: PublicStatus = intent
      ? latest && latest.sequence === intent.sequence
        ? toPublicStatus(latest.status)
        : "READY" // intent committed, broadcast not yet reported
      : latest?.status === "INVALID"
        ? "INVALID"
        : "READY";

    const currentHolder = intent
      ? intent.currentHolder
      : (this.store.getCurrentHolder(batonId) ?? latest?.recipient ?? "unassigned");

    const lastActionAt = latest?.confirmedAt ?? latest?.createdAt ?? intent?.createdAt ?? now;

    return {
      baton_id: batonId,
      sequence: this.store.getCurrentSequence(batonId),
      current_holder: currentHolder,
      status,
      hop_count: hops.filter((h) => h.status === "FINAL").length,
      activity: isDormant(lastActionAt, now) ? "DORMANT" : "ACTIVE",
    };
  }
}
