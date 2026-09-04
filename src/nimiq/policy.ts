// Nimiq Albatross network policy constants and the pure math derived from them.

export interface NimiqNetworkPolicy {
  /** Micro blocks per batch. A batch closes with a Tendermint/PBFT macro block. */
  readonly blocksPerBatch: number;
  /** Target time between micro blocks. */
  readonly blockSeparationTimeMs: number;
  /** Election block at height 0 of the PoS chain. */
  readonly genesisBlockNumber: number;
  /** NetworkId::Test / NetworkId::Main. `null` where not independently confirmed — see per-network comments. */
  readonly networkId: number | null;
  /** How many blocks a broadcast transaction stays eligible for inclusion before it expires uncommitted. */
  readonly transactionValidityWindowBlocks: number;
}

/**
 * Verified against live testnet (https://rpc.testnet.nimiqwatch.com) via
 * `getPolicyConstants` AND real `getTransactionByHash` responses (which is
 * how `networkId: 5` was confirmed), 2026-08-31.
 */
export const NIMIQ_TESTNET_POLICY: NimiqNetworkPolicy = {
  blocksPerBatch: 60,
  blockSeparationTimeMs: 1_000,
  genesisBlockNumber: 3_032_010,
  networkId: 5, // Nimiq TestAlbatross / NetworkId::Test
  transactionValidityWindowBlocks: 7_200,
};

/**
 * Verified against live MAINNET (https://rpc.nimiqwatch.com — no `testnet.`
 * subdomain) via `getPolicyConstants`, 2026-09-01. `blocksPerBatch`,
 * `blockSeparationTimeMs` and `transactionValidityWindowBlocks` all came
 * back identical to testnet; `genesisBlockNumber` did not (3,456,000 vs
 * 3,032,010), confirming the PRD's warning that this constant is
 * network-specific and must be re-checked, not assumed.
 *
 * `networkId` is left `null`: no read-only RPC method on this node exposed
 * it without an actual mainnet transaction to read it off of, and nothing
 * in this codebase's finality/staleness math consumes it — it's informational
 * only. Fill it in from a real `getTransactionByHash` response (its
 * `networkId` field, the same way testnet's `5` was confirmed) before
 * relying on it for anything.
 */
export const NIMIQ_MAINNET_POLICY: NimiqNetworkPolicy = {
  blocksPerBatch: 60,
  blockSeparationTimeMs: 1_000,
  genesisBlockNumber: 3_456_000,
  networkId: null,
  transactionValidityWindowBlocks: 7_200,
};

/**
 * Which network this build's finality/staleness math targets. The service
 * and every test in this repo are still developed and run against testnet
 * (see `HttpNimiqRpcClient`'s default `rpcUrl`) — pointing this at
 * `NIMIQ_MAINNET_POLICY` is a deliberate production cutover to make
 * alongside switching the RPC endpoint, not something to flip on its own.
 */
export const NIMIQ_POLICY: NimiqNetworkPolicy = NIMIQ_TESTNET_POLICY;

/** Last macro (checkpoint/election) block number at or before `blockNumber`. */
export function lastMacroBlock(blockNumber: number, policy: NimiqNetworkPolicy = NIMIQ_POLICY): number {
  const rel = blockNumber - policy.genesisBlockNumber;
  if (rel < 0) return policy.genesisBlockNumber;
  return Math.floor(rel / policy.blocksPerBatch) * policy.blocksPerBatch + policy.genesisBlockNumber;
}

/**
 * How many blocks after `blockNumber` the head must be to have crossed the
 * macro block that finalizes `blockNumber`'s batch. Once the head is at or
 * past the macro at the end of the tx's batch, the tx is cryptographically FINAL.
 */
export function confirmationsToFinality(blockNumber: number, policy: NimiqNetworkPolicy = NIMIQ_POLICY): number {
  const nextMacro = lastMacroBlock(blockNumber, policy) + policy.blocksPerBatch; // macro closing this batch
  return Math.max(0, nextMacro - blockNumber);
}

/**
 * How long the relay should keep an uncommitted intent open before treating
 * it as stale. Must be AT LEAST as long as a broadcast transaction can
 * legally still land on-chain (`transactionValidityWindowBlocks` at
 * `blockSeparationTimeMs` each) — otherwise the app could mark an intent
 * stale and let the holder start a conflicting second pass while the first
 * transaction can still be included, racing two hops against each other.
 * The buffer absorbs clock skew and network propagation delay on top of that
 * floor; it is not the primary bound.
 */
export function computeIntentValidityWindowMs(
  safetyBufferMs = 5 * 60 * 1000,
  policy: NimiqNetworkPolicy = NIMIQ_POLICY
): number {
  return policy.transactionValidityWindowBlocks * policy.blockSeparationTimeMs + safetyBufferMs;
}

export const INTENT_VALIDITY_WINDOW_MS = computeIntentValidityWindowMs();
