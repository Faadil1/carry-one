import { randomUUID } from "node:crypto";
import type { Hop, HopStatus, NimiqTxLookup, PassIntent } from "./types.js";
import { batonDataTag, ONE_NIM_IN_LUNA } from "./types.js";
import { INTENT_VALIDITY_WINDOW_MS } from "../nimiq/policy.js";

/** Thrown for every rejection path — callers switch on `.reason` for tests/logging. */
export class RelayValidationError extends Error {
  constructor(public reason: string, message: string) {
    super(message);
  }
}

/** In-memory store standing in for the canonical relay service's persistence layer. */
export class RelayStore {
  private intents = new Map<string, PassIntent>(); // key: batonId
  private hops: Hop[] = [];
  private holders = new Map<string, string>(); // last canonical holder by baton
  private transactionClaims = new Map<string, { batonId: string; sequence: number }>();

  key(batonId: string) {
    return batonId;
  }

  getActiveIntent(batonId: string): PassIntent | undefined {
    return this.intents.get(this.key(batonId));
  }

  getHops(batonId: string): Hop[] {
    return this.hops.filter((h) => h.batonId === batonId).sort((a, b) => a.sequence - b.sequence);
  }

  getHop(batonId: string, sequence: number): Hop | undefined {
    return this.hops.find((h) => h.batonId === batonId && h.sequence === sequence);
  }

  getCurrentSequence(batonId: string): number {
    const hops = this.getHops(batonId).filter((hop) => hop.status === "FINAL");
    return hops.length === 0 ? 0 : hops[hops.length - 1].sequence;
  }

  getCurrentHolder(batonId: string): string | undefined {
    return this.holders.get(this.key(batonId));
  }

  /**
   * Commit an atomic intent BEFORE any transaction is broadcast. Only one
   * active intent per baton at a time — this is what closes the race
   * condition where two devices for the same holder could both start a pass.
   */
  createIntent(batonId: string, currentHolder: string, recipient: string): PassIntent {
    const existing = this.getActiveIntent(batonId);
    if (existing) {
      throw new RelayValidationError(
        "DUPLICATE_INTENT",
        `Baton ${batonId} already has an active intent at sequence ${existing.sequence}`
      );
    }
    if (currentHolder === recipient) {
      throw new RelayValidationError("SELF_PASS", "Cannot pass the baton to yourself");
    }
    const knownHolder = this.getCurrentHolder(batonId);
    if (knownHolder !== undefined && currentHolder !== knownHolder) {
      throw new RelayValidationError(
        "WRONG_CURRENT_HOLDER",
        `Baton ${batonId} is held by ${knownHolder}, not ${currentHolder}`
      );
    }

    const intent: PassIntent = {
      batonId,
      sequence: this.getCurrentSequence(batonId) + 1,
      currentHolder,
      recipient,
      nonce: randomUUID(),
      createdAt: Date.now(),
    };
    this.intents.set(this.key(batonId), intent);
    this.holders.set(this.key(batonId), currentHolder);
    return intent;
  }

  cancelIntent(batonId: string) {
    this.intents.delete(this.key(batonId));
  }

  /**
   * Bind a transaction hash to exactly one baton/sequence across the store.
   * The recipient-data tag remains optional for compatibility with all send
   * paths, so global hash uniqueness is the fail-closed replay boundary.
   */
  claimTransactionHash(batonId: string, sequence: number, txHash: string): void {
    const existing = this.transactionClaims.get(txHash);
    if (existing && (existing.batonId !== batonId || existing.sequence !== sequence)) {
      throw new RelayValidationError(
        "TX_HASH_REPLAY",
        `Transaction ${txHash} is already bound to ${existing.batonId} sequence ${existing.sequence}`
      );
    }
    if (!existing) {
      this.transactionClaims.set(txHash, { batonId, sequence });
    }
  }

  /**
   * Record a hop for (batonId, sequence), replacing any existing record at
   * that same slot rather than appending a duplicate. This matters for
   * recovery: if a first broadcast attempt is observed to be INVALID (wrong
   * recipient, forged, etc.) the active intent is deliberately left in place
   * so the holder can retry — and that retry must overwrite the stale
   * record, or `getHop`/reconciliation would keep finding the invalid one.
   */
  recordHop(hop: Hop) {
    const idx = this.hops.findIndex((h) => h.batonId === hop.batonId && h.sequence === hop.sequence);
    if (idx >= 0) {
      this.hops[idx] = hop;
    } else {
      this.hops.push(hop);
    }
    if (hop.status === "FINAL") {
      this.holders.set(this.key(hop.batonId), hop.recipient);
      this.intents.delete(this.key(hop.batonId));
    }
  }

  /** Mutates a recorded hop in place (reconciliation: PENDING -> INCLUDED -> FINAL, or -> INVALID). */
  updateHop(batonId: string, sequence: number, patch: Partial<Pick<Hop, "status" | "value" | "confirmedAt">>): Hop {
    const hop = this.getHop(batonId, sequence);
    if (!hop) {
      throw new RelayValidationError("HOP_NOT_FOUND", `No hop at sequence ${sequence} for baton ${batonId}`);
    }
    Object.assign(hop, patch);
    if (hop.status === "FINAL") {
      this.holders.set(this.key(batonId), hop.recipient);
      this.intents.delete(this.key(batonId));
    }
    return hop;
  }
}

/**
 * Validate an observed transaction against the committed intent. This is
 * where every negative test in the spike is actually enforced. Throws
 * RelayValidationError on any failure — the relay must NEVER advance on a
 * failed validation (per the PRD's "fail closed" law).
 */
export function validateTransactionAgainstIntent(intent: PassIntent, tx: NimiqTxLookup): void {
  if (tx.from !== intent.currentHolder) {
    throw new RelayValidationError(
      "WRONG_SENDER",
      `Transaction sender ${tx.from} does not match committed holder ${intent.currentHolder}`
    );
  }
  if (tx.to !== intent.recipient) {
    throw new RelayValidationError(
      "WRONG_RECIPIENT",
      `Transaction recipient ${tx.to} does not match committed recipient ${intent.recipient}`
    );
  }
  // Validate on transaction VALUE only — fee is separate and not part of this
  // check. Sender outflow may be 1 NIM + fee; that's fine.
  if (tx.value !== ONE_NIM_IN_LUNA) {
    throw new RelayValidationError(
      "WRONG_AMOUNT",
      `Transaction value ${tx.value} Luna does not equal exactly ${ONE_NIM_IN_LUNA} Luna (1 NIM)`
    );
  }
  // Optional second, on-chain-anchored check: only enforced when the sender's
  // wallet actually attached recipient data (not all send paths do).
  if (tx.recipientData !== undefined) {
    const expected = batonDataTag(intent.batonId, intent.sequence);
    if (tx.recipientData !== expected) {
      throw new RelayValidationError(
        "WRONG_BATON_TAG",
        `Transaction recipient data "${tx.recipientData}" does not match expected tag "${expected}"`
      );
    }
  }
}

export { INTENT_VALIDITY_WINDOW_MS };

export function isIntentStale(intent: PassIntent, now = Date.now()): boolean {
  return now - intent.createdAt > INTENT_VALIDITY_WINDOW_MS;
}

/** Dormancy is a pure display concern — never mutates status, never reassigns the baton. */
export const DORMANCY_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24h

export function isDormant(lastActionAt: number, now = Date.now()): boolean {
  return now - lastActionAt > DORMANCY_THRESHOLD_MS;
}

export type { HopStatus };
