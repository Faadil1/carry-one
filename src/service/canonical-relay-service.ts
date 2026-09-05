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

  getActiveIntent(batonId: string): PassIntent | null {
    return this.store.getActiveIntent(batonId) ?? null;
  }

  hasRecordedBroadcast(batonId: string): boolean {
    const intent = this.store.getActiveIntent(batonId);
    if (!intent) return false;
    const hop = this.store.getHop(batonId, intent.sequence);
    return Boolean(hop?.txHash);
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
      this.store.cancelIntent(batonId);
      throw new RelayValidationError(
        "STALE_INTENT",
        `Intent for baton ${batonId} at sequence ${intent.sequence} has expired`
      );
    }
    const existingHop = this.store.findHopByTxHash(txHash);
    if (existingHop && (existingHop.batonId !== batonId || existingHop.sequence !== intent.sequence)) {
      throw new RelayValidationError(
        "DUPLICATE_TX_HASH",
        `Transaction hash ${txHash} has already been recorded for baton ${existingHop.batonId} at sequence ${existingHop.sequence}`
      );
    }
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
   * Call this when the client observes the user dismissing the native
   * Nimiq Pay approval dialog before any hash was ever returned.
   *
   * Fails closed: once a broadcast transaction hash has been recorded for
   * this intent, cancellation is rejected because the transaction may still
   * finalize on-chain even if we stop tracking it locally.
   */
  cancelPass(batonId: string): void {
    const intent = this.store.getActiveIntent(batonId);
    if (!intent) {
      return;
    }
    const hop = this.store.getHop(batonId, intent.sequence);
    if (hop && hop.txHash !== null) {
      throw new RelayValidationError(
        "CANNOT_CANCEL_BROADCAST",
        `Cannot cancel pass for baton ${batonId}: transaction ${hop.txHash} has already been broadcast`
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
        if (hop) {
          const invalidHop = this.store.updateHop(batonId, intent.sequence, { status: "INVALID" });
          this.store.cancelIntent(batonId);
          return invalidHop;
        }
        const invalidHop: Hop = {
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
        this.store.cancelIntent(batonId);
        return invalidHop;
      }
      return hop ?? null; // intent committed, but no broadcast reported yet
    }

    const tx = await this.rpc.getTransactionByHash(hop.txHash);
    if (!tx) {
      // Not observed on-chain yet. Only give up once the intent itself is
      // stale — a transaction can legitimately sit unconfirmed for a while.
      if (isIntentStale(intent)) {
        const invalidHop = this.store.updateHop(batonId, intent.sequence, { status: "INVALID" });
        this.store.cancelIntent(batonId);
        return invalidHop;
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
