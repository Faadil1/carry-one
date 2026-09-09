import { describe, expect, it } from "vitest";
import {
  BroadcastCapabilityError,
  MemoryBroadcastCapabilityStore,
  type BroadcastCapabilityBinding,
} from "../../src/service/broadcast-capability.js";

const binding: BroadcastCapabilityBinding = {
  missionId: "00000000-0000-4000-8000-000000000001",
  invitationId: "00000000-0000-4000-8000-000000000002",
  sequence: 1,
  intentNonce: "nonce-1",
  holderWallet: "NQ00 HOLDER",
};

describe("MemoryBroadcastCapabilityStore", () => {
  it("consumes a correctly bound capability exactly once", () => {
    const store = new MemoryBroadcastCapabilityStore();
    const issued = store.issue(binding, { now: 1_000, ttlMs: 10_000 });

    expect(() => store.consume(issued.token, binding, 2_000)).not.toThrow();
    expect(() => store.consume(issued.token, binding, 2_001)).toThrowError(
      expect.objectContaining({ reason: "BROADCAST_CAPABILITY_REPLAY" })
    );
  });

  it("rejects a token bound to different mission state", () => {
    const store = new MemoryBroadcastCapabilityStore();
    const issued = store.issue(binding, { now: 1_000, ttlMs: 10_000 });

    expect(() => store.consume(issued.token, { ...binding, sequence: 2 }, 2_000)).toThrowError(
      expect.objectContaining({ reason: "BROADCAST_CAPABILITY_BINDING_MISMATCH" })
    );
  });

  it("rejects expired and unknown capabilities fail-closed", () => {
    const store = new MemoryBroadcastCapabilityStore();
    const issued = store.issue(binding, { now: 1_000, ttlMs: 100 });

    expect(() => store.consume(issued.token, binding, 1_100)).toThrowError(
      expect.objectContaining({ reason: "BROADCAST_CAPABILITY_EXPIRED" })
    );
    expect(() => store.consume("x".repeat(43), binding, 1_101)).toThrowError(BroadcastCapabilityError);
  });
});
