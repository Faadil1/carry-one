import { randomBytes } from "node:crypto";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { RelayStore } from "../../src/core/relay.js";
import { ONE_NIM_IN_LUNA, type NimiqTxLookup } from "../../src/core/types.js";
import { NIMIQ_POLICY } from "../../src/nimiq/policy.js";
import type { NimiqRpcClient } from "../../src/nimiq/rpc-client.js";
import { CanonicalRelayService } from "../../src/service/canonical-relay-service.js";
import { createHttpServer, legacyRelayEnabledFromEnv } from "../../src/service/http-server.js";

class FakeRpcClient implements NimiqRpcClient {
  private txs = new Map<string, NimiqTxLookup>();
  private headBlockNumber = NIMIQ_POLICY.genesisBlockNumber + 61;

  seeTx(tx: NimiqTxLookup) {
    this.txs.set(tx.hash, tx);
  }
  async getTransactionByHash(hash: string) {
    return this.txs.get(hash) ?? null;
  }
  async getBlockNumber() {
    return this.headBlockNumber;
  }
}

const BATON = "baton-http-spike";
let baseUrl: string;
let rpc: FakeRpcClient;
let close: () => Promise<void>;

beforeAll(async () => {
  rpc = new FakeRpcClient();
  const service = new CanonicalRelayService(new RelayStore(), rpc);
  const server = createHttpServer(service);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
  close = () => new Promise((resolve) => server.close(() => resolve()));
});

afterAll(() => close());

describe("HTTP surface over CanonicalRelayService", () => {
  it("runs one pass end-to-end: intent -> broadcast -> reconcile -> public view/history", async () => {
    const intentRes = await fetch(`${baseUrl}/relay/${BATON}/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentHolder: "W0", recipient: "W1" }),
    });
    expect(intentRes.status).toBe(201);
    const intent = await intentRes.json();
    expect(intent.sequence).toBe(1);

    const txHash = randomBytes(32).toString("hex");
    rpc.seeTx({
      hash: txHash,
      from: "W0",
      to: "W1",
      value: ONE_NIM_IN_LUNA,
      blockNumber: NIMIQ_POLICY.genesisBlockNumber + 1,
      confirmations: 1,
    });

    const broadcastRes = await fetch(`${baseUrl}/relay/${BATON}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txHash }),
    });
    expect(broadcastRes.status).toBe(201);

    const reconcileRes = await fetch(`${baseUrl}/relay/${BATON}/reconcile`, { method: "POST" });
    expect(reconcileRes.status).toBe(200);
    const hop = await reconcileRes.json();
    expect(hop.status).toBe("FINAL");

    const viewRes = await fetch(`${baseUrl}/relay/${BATON}`);
    const view = await viewRes.json();
    expect(view).toMatchObject({ baton_id: BATON, sequence: 1, current_holder: "W1", status: "READY" });

    const historyRes = await fetch(`${baseUrl}/relay/${BATON}/history`);
    const history = await historyRes.json();
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ tx_hash: txHash, status: "CONFIRMED" });
  });

  it("maps a duplicate-intent conflict to 409 with the reason code, not a 500", async () => {
    const baton = "baton-http-conflict";
    await fetch(`${baseUrl}/relay/${baton}/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentHolder: "W0", recipient: "W1" }),
    });

    const conflict = await fetch(`${baseUrl}/relay/${baton}/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentHolder: "W0", recipient: "W2" }),
    });
    expect(conflict.status).toBe(409);
    const body = await conflict.json();
    expect(body.error).toBe("DUPLICATE_INTENT");
  });

  it("cancel clears the active intent so a fresh pass can start", async () => {
    const baton = "baton-http-cancel";
    await fetch(`${baseUrl}/relay/${baton}/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentHolder: "W0", recipient: "W1" }),
    });

    const cancelRes = await fetch(`${baseUrl}/relay/${baton}/cancel`, { method: "POST" });
    expect(cancelRes.status).toBe(204);

    const retryRes = await fetch(`${baseUrl}/relay/${baton}/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentHolder: "W0", recipient: "W2" }),
    });
    expect(retryRes.status).toBe(201);
  });

  it("rejects cancel with 409 once broadcast has been recorded", async () => {
    const baton = "baton-http-cancel-rejected";
    await fetch(`${baseUrl}/relay/${baton}/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentHolder: "W0", recipient: "W1" }),
    });

    const txHash = randomBytes(32).toString("hex");
    await fetch(`${baseUrl}/relay/${baton}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txHash }),
    });

    const cancelRes = await fetch(`${baseUrl}/relay/${baton}/cancel`, { method: "POST" });
    expect(cancelRes.status).toBe(409);
    const body = await cancelRes.json();
    expect(body.error).toBe("CANNOT_CANCEL_BROADCAST");
  });
});

describe("legacyRelayEnabledFromEnv", () => {
  it("enables the legacy relay outside production unless explicitly disabled", () => {
    expect(legacyRelayEnabledFromEnv({})).toBe(true);
    expect(legacyRelayEnabledFromEnv({ NODE_ENV: "test" })).toBe(true);
    expect(legacyRelayEnabledFromEnv({ CARRY_ONE_LEGACY_RELAY_ENABLED: "true" })).toBe(true);
    expect(legacyRelayEnabledFromEnv({ CARRY_ONE_LEGACY_RELAY_ENABLED: "1", NODE_ENV: "production" })).toBe(true);
    expect(legacyRelayEnabledFromEnv({ CARRY_ONE_LEGACY_RELAY_ENABLED: "yes" })).toBe(true);
  });

  it("disables the legacy relay in production unless explicitly enabled", () => {
    expect(legacyRelayEnabledFromEnv({ NODE_ENV: "production" })).toBe(false);
    expect(legacyRelayEnabledFromEnv({ NODE_ENV: "production", CARRY_ONE_LEGACY_RELAY_ENABLED: "false" })).toBe(false);
    expect(legacyRelayEnabledFromEnv({ NODE_ENV: "production", CARRY_ONE_LEGACY_RELAY_ENABLED: "0" })).toBe(false);
    expect(legacyRelayEnabledFromEnv({ NODE_ENV: "production", CARRY_ONE_LEGACY_RELAY_ENABLED: "no" })).toBe(false);
  });
});

describe("gated legacy relay HTTP surface", () => {
  let baseUrlGate: string;
  let closeGate: () => Promise<void>;

  beforeAll(async () => {
    const service = new CanonicalRelayService(new RelayStore(), new FakeRpcClient());
    const server = createHttpServer(service, { legacyRelayEnabled: false });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    baseUrlGate = `http://127.0.0.1:${port}`;
    closeGate = () => new Promise((resolve) => server.close(() => resolve()));
  });

  afterAll(() => closeGate());

  it("rejects mutation endpoints with 403 LEGACY_RELAY_DISABLED and keeps reads working", async () => {
    for (const action of ["intent", "broadcast", "cancel", "reconcile"]) {
      const res = await fetch(`${baseUrlGate}/relay/gated/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentHolder: "W0", recipient: "W1" }),
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("LEGACY_RELAY_DISABLED");
    }

    const view = await fetch(`${baseUrlGate}/relay/gated`);
    expect(view.status).toBe(200);
    expect(await view.json()).toMatchObject({ baton_id: "gated", status: "READY" });
  });
});
