import { randomBytes } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { INTENT_VALIDITY_WINDOW_MS, RelayStore, RelayValidationError } from "../../src/core/relay.js";
import { ONE_NIM_IN_LUNA, type NimiqTxLookup } from "../../src/core/types.js";
import { NIMIQ_POLICY } from "../../src/nimiq/policy.js";
import type { NimiqRpcClient } from "../../src/nimiq/rpc-client.js";
import { CanonicalRelayService } from "../../src/service/canonical-relay-service.js";

class FakeRpcClient implements NimiqRpcClient {
  private txs = new Map<string, NimiqTxLookup>();
  private headBlockNumber = NIMIQ_POLICY.genesisBlockNumber + NIMIQ_POLICY.blocksPerBatch;

  seeTx(tx: NimiqTxLookup) {
    this.txs.set(tx.hash, tx);
  }

  async getTransactionByHash(hash: string): Promise<NimiqTxLookup | null> {
    return this.txs.get(hash) ?? null;
  }

  async getBlockNumber(): Promise<number> {
    return this.headBlockNumber;
  }
}

function randomHash(): string {
  return randomBytes(32).toString("hex");
}

function captureRelayError(fn: () => unknown): RelayValidationError {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(RelayValidationError);
    return error as RelayValidationError;
  }
  throw new Error("Expected RelayValidationError");
}

afterEach(() => {
  vi.useRealTimers();
});

describe("PR #1 audit remediation invariants", () => {
  it("rejects cancellation after a transaction hash is recorded and keeps the hop reconcilable", async () => {
    const rpc = new FakeRpcClient();
    const service = new CanonicalRelayService(new RelayStore(), rpc);
    const baton = "cancel-after-broadcast";

    service.initiatePass(baton, "W0", "W1");
    const txHash = randomHash();
    service.recordBroadcast(baton, txHash);

    const cancelError = captureRelayError(() => service.cancelPass(baton));
    expect(cancelError.reason).toBe("BROADCAST_ALREADY_RECORDED");

    rpc.seeTx({
      hash: txHash,
      from: "W0",
      to: "W1",
      value: ONE_NIM_IN_LUNA,
      blockNumber: NIMIQ_POLICY.genesisBlockNumber + 1,
      confirmations: NIMIQ_POLICY.blocksPerBatch,
    });

    await expect(service.reconcile(baton)).resolves.toMatchObject({ status: "FINAL" });
    expect(service.getPublicView(baton)).toMatchObject({ current_holder: "W1", hop_count: 1 });
  });

  it("expires a broadcast that never appears on-chain, closes the intent, and permits a clean retry", async () => {
    vi.useFakeTimers();
    const rpc = new FakeRpcClient();
    const service = new CanonicalRelayService(new RelayStore(), rpc);
    const baton = "stale-broadcast";

    const intent = service.initiatePass(baton, "W0", "W1");
    service.recordBroadcast(baton, randomHash());
    vi.setSystemTime(intent.createdAt + INTENT_VALIDITY_WINDOW_MS + 1);

    await expect(service.reconcile(baton)).resolves.toMatchObject({ status: "INVALID" });
    expect(service.getPublicView(baton)).toMatchObject({
      sequence: 0,
      current_holder: "W0",
      status: "INVALID",
      hop_count: 0,
    });

    expect(service.initiatePass(baton, "W0", "W2").sequence).toBe(1);
  });

  it("rejects a late broadcast against an already-stale intent and releases the baton for retry", () => {
    vi.useFakeTimers();
    const service = new CanonicalRelayService(new RelayStore(), new FakeRpcClient());
    const baton = "late-broadcast";

    const intent = service.initiatePass(baton, "W0", "W1");
    vi.setSystemTime(intent.createdAt + INTENT_VALIDITY_WINDOW_MS + 1);

    const staleError = captureRelayError(() => service.recordBroadcast(baton, randomHash()));
    expect(staleError.reason).toBe("STALE_INTENT");
    expect(service.initiatePass(baton, "W0", "W2").sequence).toBe(1);
  });

  it("rejects reusing one transaction hash for a different baton/sequence", () => {
    const store = new RelayStore();
    const service = new CanonicalRelayService(store, new FakeRpcClient());
    const txHash = randomHash();

    service.initiatePass("baton-a", "W0", "W1");
    service.recordBroadcast("baton-a", txHash);

    service.initiatePass("baton-b", "W0", "W1");
    const replayError = captureRelayError(() => service.recordBroadcast("baton-b", txHash));
    expect(replayError.reason).toBe("TX_HASH_REPLAY");

    expect(service.getPublicView("baton-a").hop_count).toBe(0);
    expect(service.getPublicView("baton-b").hop_count).toBe(0);
  });
});
