import { describe, expect, it } from "vitest";
import { CarryOneApiClient, type SignatureEnvelope } from "../../src/mini-app/api-client.js";

const auth: SignatureEnvelope = {
  challenge_id: "00000000-0000-4000-8000-000000000001",
  public_key: "ab".repeat(32),
  signature: "cd".repeat(64),
};

function okJson(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("CarryOneApiClient mutation transport", () => {
  it("automatically adds a fresh Idempotency-Key to canonical mutations", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    let counter = 0;
    const client = new CarryOneApiClient({
      baseUrl: "https://nimcarry.example",
      idempotencyKeyFactory: () => `idem-${++counter}`,
      fetchImpl: (async (input, init) => {
        calls.push({ url: String(input), init });
        return okJson({ ok: true });
      }) as typeof fetch,
    });

    await client.createMission({
      auth,
      target_label: "Target",
      target_wallet: "NQ00 TARGET",
      target_consent_confirmed: true,
      mission_note: "Reach the target through a trusted bridge.",
    });
    await client.declineInvitation("invite-token-12345678901234567890123456789012");

    expect(new Headers(calls[0].init?.headers).get("Idempotency-Key")).toBe("idem-1");
    expect(new Headers(calls[1].init?.headers).get("Idempotency-Key")).toBe("idem-2");
  });

  it("does not add an idempotency key to challenge issuance or reconcile polling", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new CarryOneApiClient({
      idempotencyKeyFactory: () => "should-not-be-used",
      fetchImpl: (async (input, init) => {
        calls.push({ url: String(input), init });
        return okJson({ challenge_id: "id", message: "msg" });
      }) as typeof fetch,
    });

    await client.issueChallenge({ wallet: "NQ00 TEST", action: "CREATE_MISSION" });
    await client.reconcile("00000000-0000-4000-8000-000000000001");

    expect(new Headers(calls[0].init?.headers).get("Idempotency-Key")).toBeNull();
    expect(new Headers(calls[1].init?.headers).get("Idempotency-Key")).toBeNull();
  });

  it("forwards the stored view token as Bearer authorization on reconcile", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new CarryOneApiClient({
      fetchImpl: (async (input, init) => {
        calls.push({ url: String(input), init });
        return okJson({ mission: { status: "ACTIVE" } });
      }) as typeof fetch,
    });

    const viewToken = "test-view-token-abcdefghijklmnopqrstuvwxyz01234567";
    await client.reconcile("00000000-0000-4000-8000-000000000001", viewToken);

    const headers = new Headers(calls[0].init?.headers);
    expect(headers.get("Authorization")).toBe(`Bearer ${viewToken}`);
  });

  it("transports the one-time broadcast capability and allows a stable retry key", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const client = new CarryOneApiClient({
      baseUrl: "https://nimcarry.example",
      idempotencyKeyFactory: () => "auto-key",
      fetchImpl: (async (input, init) => {
        calls.push({ url: String(input), init });
        return okJson({ tx_hash: "ef".repeat(32) });
      }) as typeof fetch,
    });

    await client.recordBroadcast(
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
      "ef".repeat(32),
      "capability_abcdefghijklmnopqrstuvwxyz012345",
      "broadcast-retry-1"
    );

    const headers = new Headers(calls[0].init?.headers);
    expect(headers.get("Idempotency-Key")).toBe("broadcast-retry-1");
    expect(JSON.parse(String(calls[0].init?.body))).toMatchObject({
      invitation_id: "00000000-0000-4000-8000-000000000002",
      tx_hash: "ef".repeat(32),
      broadcast_capability: "capability_abcdefghijklmnopqrstuvwxyz012345",
    });
  });
});
