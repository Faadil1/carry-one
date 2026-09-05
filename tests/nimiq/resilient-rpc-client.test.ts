import { describe, expect, it } from "vitest";
import type { NimiqTxLookup } from "../../src/core/types.js";
import type { NimiqRpcClient } from "../../src/nimiq/rpc-client.js";
import { ResilientNimiqRpcClient, RpcVerificationDelayedError } from "../../src/nimiq/resilient-rpc-client.js";

class Stub implements NimiqRpcClient {
  constructor(
    private readonly txResult: NimiqTxLookup | null | Error,
    private readonly blockResult: number | Error
  ) {}
  async getTransactionByHash(): Promise<NimiqTxLookup | null> {
    if (this.txResult instanceof Error) throw this.txResult;
    return this.txResult;
  }
  async getBlockNumber(): Promise<number> {
    if (this.blockResult instanceof Error) throw this.blockResult;
    return this.blockResult;
  }
}

const tx: NimiqTxLookup = {
  hash: "a".repeat(64), from: "W0", to: "W1", value: 100_000,
  blockNumber: 3_032_020, confirmations: 1, recipientData: "co:v1:test",
};

describe("ResilientNimiqRpcClient", () => {
  it("falls back when the primary errors or has not indexed the tx yet", async () => {
    const client = new ResilientNimiqRpcClient([
      new Stub(new Error("primary down"), new Error("primary down")),
      new Stub(tx, 3_032_100),
    ]);
    await expect(client.getTransactionByHash(tx.hash)).resolves.toEqual(tx);
    await expect(client.getBlockNumber()).resolves.toBe(3_032_100);
  });

  it("returns null when at least one healthy endpoint confirms not-found", async () => {
    const client = new ResilientNimiqRpcClient([
      new Stub(new Error("down"), new Error("down")),
      new Stub(null, 3_032_100),
    ]);
    await expect(client.getTransactionByHash("missing")).resolves.toBeNull();
  });

  it("surfaces a verification-delay error only when every endpoint is unavailable", async () => {
    const client = new ResilientNimiqRpcClient([
      new Stub(new Error("a"), new Error("a")),
      new Stub(new Error("b"), new Error("b")),
    ]);
    await expect(client.getTransactionByHash("x")).rejects.toBeInstanceOf(RpcVerificationDelayedError);
    await expect(client.getBlockNumber()).rejects.toBeInstanceOf(RpcVerificationDelayedError);
  });
});
