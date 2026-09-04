// Carry One — canonical domain types.
// These are transport-agnostic: no Nimiq RPC shapes and no HTTP shapes live here.

export const ONE_NIM_IN_LUNA = 100_000; // 1 NIM = 100,000 Luna

/** Lifecycle of a single hop's underlying transaction. */
export type HopStatus = "PENDING" | "INCLUDED" | "FINAL" | "CANCELLED" | "INVALID";

/**
 * A committed, atomic intent to make the next canonical pass.
 * Created BEFORE any transaction is broadcast: the canonical hop is whichever
 * included transaction matches this intent, not "whichever transaction the
 * service happens to see first". This is what closes the race condition where
 * two devices for the same holder could otherwise both start a pass.
 */
export interface PassIntent {
  batonId: string;
  sequence: number; // expected next hop number
  currentHolder: string; // wallet authorized to make this pass
  recipient: string; // intended next holder
  nonce: string; // uniqueness guard against duplicate/replayed intents
  createdAt: number; // epoch ms
}

/** A confirmed or in-flight hop, once a transaction has been broadcast against an intent. */
export interface Hop {
  batonId: string;
  sequence: number;
  currentHolder: string;
  recipient: string;
  nonce: string;
  txHash: string | null; // null until a transaction is broadcast
  value: number | null; // Luna, filled in once we observe the tx
  status: HopStatus;
  createdAt: number;
  confirmedAt: number | null; // set when status transitions to FINAL
}

/** Display-only relay activity state. Never affects `status`. */
export type RelayActivity = "ACTIVE" | "DORMANT";

/** Minimal shape of what we need back from Nimiq RPC's getTransactionByHash. */
export interface NimiqTxLookup {
  hash: string;
  from: string; // human-readable address
  to: string; // human-readable address
  value: number; // Luna
  blockNumber: number | null; // null while still in mempool
  confirmations: number; // 0 while unconfirmed
  /**
   * Optional recipient-data payload read back off-chain. When the sender used
   * `sendBasicTransactionWithData`, this carries whatever tag was attached at
   * broadcast time (see `batonDataTag`). Absent for plain transfers.
   */
  recipientData?: string;
}

/**
 * Compact, self-describing tag embedded in a transaction's recipient data via
 * the Nimiq Provider's `sendBasicTransactionWithData` — the PRD's "optional
 * compact baton/sequence data". Gives the relay a second, on-chain-anchored
 * way to confirm a transaction belongs to this baton/hop, independent of our
 * own off-chain intent store.
 */
export function batonDataTag(batonId: string, sequence: number): string {
  return `carryone:${batonId}:${sequence}`;
}
