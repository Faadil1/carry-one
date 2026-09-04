import { describe, expect, it, vi, beforeEach } from "vitest";

const sendBasicTransaction = vi.fn();
const sendBasicTransactionWithData = vi.fn();

vi.mock("@nimiq/mini-app-sdk", () => ({
  init: vi.fn(async () => ({
    sendBasicTransaction,
    sendBasicTransactionWithData,
  })),
}));

// Imported after the mock so MiniAppSdkPayProvider picks up the mocked `init`.
const { MiniAppSdkPayProvider } = await import("../../src/nimiq/pay-provider.js");
const { UserCancelledPaymentError } = await import("../../src/nimiq/pay-provider.js");

const VALID_HASH = "a".repeat(64);

describe("MiniAppSdkPayProvider (client-side Nimiq Pay wallet integration)", () => {
  beforeEach(() => {
    sendBasicTransaction.mockReset();
    sendBasicTransactionWithData.mockReset();
  });

  it("resolves with the tx hash on a successful send without data", async () => {
    sendBasicTransaction.mockResolvedValue(VALID_HASH);
    const provider = new MiniAppSdkPayProvider();

    const result = await provider.sendPass({ recipient: "NQ_R", amountLuna: 100_000 });

    expect(result.txHash).toBe(VALID_HASH);
    expect(sendBasicTransaction).toHaveBeenCalledWith({ recipient: "NQ_R", value: 100_000, validityStartHeight: undefined });
    expect(sendBasicTransactionWithData).not.toHaveBeenCalled();
  });

  it("uses sendBasicTransactionWithData when a baton tag is provided", async () => {
    sendBasicTransactionWithData.mockResolvedValue(VALID_HASH);
    const provider = new MiniAppSdkPayProvider();

    const result = await provider.sendPass({
      recipient: "NQ_R",
      amountLuna: 100_000,
      data: "carryone:baton-1:1",
    });

    expect(result.txHash).toBe(VALID_HASH);
    expect(sendBasicTransactionWithData).toHaveBeenCalledWith({
      recipient: "NQ_R",
      value: 100_000,
      data: "carryone:baton-1:1",
      validityStartHeight: undefined,
    });
  });

  it("surfaces a cancelled/rejected native approval as UserCancelledPaymentError, not a silent hash", async () => {
    sendBasicTransaction.mockResolvedValue({ error: { type: "USER_REJECTED", message: "dismissed" } });
    const provider = new MiniAppSdkPayProvider();

    await expect(provider.sendPass({ recipient: "NQ_R", amountLuna: 100_000 })).rejects.toBeInstanceOf(
      UserCancelledPaymentError
    );
  });

  it("refuses to silently treat a non-hash return value as a transaction hash", async () => {
    // Guards against the SDK's ambiguous "returns the serialized transaction"
    // doc comment actually meaning something other than a hash.
    sendBasicTransaction.mockResolvedValue("not-a-real-hash");
    const provider = new MiniAppSdkPayProvider();

    await expect(provider.sendPass({ recipient: "NQ_R", amountLuna: 100_000 })).rejects.toThrow(
      /doesn't look like a transaction hash/
    );
  });
});

describe("MockPayProvider (test/dev double, no Nimiq Pay runtime required)", () => {
  it("resolves the queued approval with a well-formed hash", async () => {
    const { MockPayProvider } = await import("../../src/nimiq/pay-provider.js");
    const provider = new MockPayProvider();
    provider.queueApproval();

    const result = await provider.sendPass({ recipient: "NQ_R", amountLuna: 100_000 });
    expect(result.txHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("rejects with UserCancelledPaymentError when a cancellation is queued", async () => {
    const { MockPayProvider } = await import("../../src/nimiq/pay-provider.js");
    const provider = new MockPayProvider();
    provider.queueCancellation();

    await expect(provider.sendPass({ recipient: "NQ_R", amountLuna: 100_000 })).rejects.toBeInstanceOf(
      UserCancelledPaymentError
    );
  });
});
