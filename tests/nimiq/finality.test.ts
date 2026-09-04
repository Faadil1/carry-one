import { describe, expect, it } from "vitest";
import { hasReachedFinality } from "../../src/nimiq/rpc-client.js";
import {
  NIMIQ_MAINNET_POLICY,
  NIMIQ_POLICY,
  NIMIQ_TESTNET_POLICY,
  confirmationsToFinality,
  lastMacroBlock,
} from "../../src/nimiq/policy.js";
import type { NimiqTxLookup } from "../../src/core/types.js";

describe("Finality via batch-boundary macro blocks (Albatross)", () => {
  it("identifies macro (checkpoint) block heights at batch boundaries", () => {
    // genesis + 0 batches = genesis itself
    expect(lastMacroBlock(NIMIQ_POLICY.genesisBlockNumber)).toBe(NIMIQ_POLICY.genesisBlockNumber);
    // first batch (0) closes at genesis + 60
    expect(lastMacroBlock(NIMIQ_POLICY.genesisBlockNumber + 60)).toBe(NIMIQ_POLICY.genesisBlockNumber + 60);
    // just before the close of batch 5
    expect(lastMacroBlock(NIMIQ_POLICY.genesisBlockNumber + 5 * 60 + 59)).toBe(NIMIQ_POLICY.genesisBlockNumber + 5 * 60);
  });

  it("requires 60 or fewer confirmations to cross a batch's macro block", () => {
    // block at the very start of a batch needs all 59 blocks on top of it to cross the macro
    expect(confirmationsToFinality(NIMIQ_POLICY.genesisBlockNumber + 1)).toBe(59);
    // block right before the macro needs only 1
    expect(confirmationsToFinality(NIMIQ_POLICY.genesisBlockNumber + 59)).toBe(1);
  });

  it("is NOT final while in the mempool (no blockNumber)", () => {
    const pending: NimiqTxLookup = {
      hash: "0xpending",
      from: "W0",
      to: "W1",
      value: 100_000,
      blockNumber: null,
      confirmations: 0,
    };
    expect(hasReachedFinality(pending, 10_000_000)).toBe(false);
  });

  it("is NOT final until the chain head crosses the batch's closing macro", () => {
    const tx: NimiqTxLookup = {
      hash: "0x1",
      from: "W0",
      to: "W1",
      value: 100_000,
      blockNumber: NIMIQ_POLICY.genesisBlockNumber + 1, // start of a batch
      confirmations: 0,
    };
    // head still inside the same batch (not yet at the macro) -> not final
    expect(hasReachedFinality(tx, NIMIQ_POLICY.genesisBlockNumber + 30)).toBe(false);
    // head exactly at the closing macro -> final
    expect(hasReachedFinality(tx, NIMIQ_POLICY.genesisBlockNumber + 60)).toBe(true);
  });

  it("treats a transaction in the finalizing macro's own batch as final once head passes it", () => {
    const tx: NimiqTxLookup = {
      hash: "0x2",
      from: "W0",
      to: "W1",
      value: 100_000,
      blockNumber: NIMIQ_POLICY.genesisBlockNumber + 60 + 5, // 5 blocks into batch 1
      confirmations: 0,
    };
    // head at macro closing batch 1
    expect(hasReachedFinality(tx, NIMIQ_POLICY.genesisBlockNumber + 60 + 60)).toBe(true);
    // head before that macro
    expect(hasReachedFinality(tx, NIMIQ_POLICY.genesisBlockNumber + 60 + 59)).toBe(false);
  });
});

describe("Mainnet policy — confirmed live via getPolicyConstants against rpc.nimiqwatch.com", () => {
  it("shares batch shape with testnet but has its own genesis block", () => {
    expect(NIMIQ_MAINNET_POLICY.blocksPerBatch).toBe(NIMIQ_TESTNET_POLICY.blocksPerBatch);
    expect(NIMIQ_MAINNET_POLICY.blockSeparationTimeMs).toBe(NIMIQ_TESTNET_POLICY.blockSeparationTimeMs);
    expect(NIMIQ_MAINNET_POLICY.transactionValidityWindowBlocks).toBe(NIMIQ_TESTNET_POLICY.transactionValidityWindowBlocks);
    // The one constant the PRD specifically warned differs per network:
    expect(NIMIQ_MAINNET_POLICY.genesisBlockNumber).not.toBe(NIMIQ_TESTNET_POLICY.genesisBlockNumber);
    expect(NIMIQ_MAINNET_POLICY.genesisBlockNumber).toBe(3_456_000);
  });

  it("the active NIMIQ_POLICY is still testnet — mainnet is available but not switched on", () => {
    expect(NIMIQ_POLICY).toBe(NIMIQ_TESTNET_POLICY);
  });

  it("finality math works correctly against mainnet's genesis when passed explicitly", () => {
    expect(lastMacroBlock(NIMIQ_MAINNET_POLICY.genesisBlockNumber + 1, NIMIQ_MAINNET_POLICY)).toBe(
      NIMIQ_MAINNET_POLICY.genesisBlockNumber
    );
    expect(confirmationsToFinality(NIMIQ_MAINNET_POLICY.genesisBlockNumber + 1, NIMIQ_MAINNET_POLICY)).toBe(59);
  });
});
