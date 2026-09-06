import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import { PrivateKey, PublicKey, Signature } from "@nimiq/core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ONE_NIM_IN_LUNA, type NimiqTxLookup } from "../../src/core/types.js";
import type { NimiqRpcClient } from "../../src/nimiq/rpc-client.js";
import { FileMissionRepository } from "../../src/mission/file-repository.js";
import { ReachMissionCoordinator } from "../../src/mission/coordinator.js";
import { ReachMissionService } from "../../src/mission/service.js";
import { TargetWalletProtector } from "../../src/mission/target-wallet-crypto.js";
import { NimiqWalletAuthorizer, nimiqSignedMessageDigest } from "../../src/mission/wallet-auth.js";
import { FileRelayStore } from "../../src/persistence/file-relay-store.js";
import { CanonicalRelayService } from "../../src/service/canonical-relay-service.js";
import { MemoryIdempotencyStore } from "../../src/service/idempotency.js";
import { MemoryRateLimiter } from "../../src/service/rate-limiter.js";
import { createMissionHttpServer } from "../../src/service/mission-http-server.js";

class FakeRpcClient implements NimiqRpcClient {
  tx: NimiqTxLookup | null = null;
  async getTransactionByHash(): Promise<NimiqTxLookup | null> {
    return this.tx;
  }
  async getBlockNumber(): Promise<number> {
    return 3_032_100;
  }
}

interface Signer {
  privateKey: PrivateKey;
  publicKey: PublicKey;
  address: string;
}

function wallet(): Signer {
  const privateKey = PrivateKey.generate();
  const publicKey = PublicKey.derive(privateKey);
  return { privateKey, publicKey, address: publicKey.toAddress().toUserFriendlyAddress() };
}

function sign(message: string, signer: Signer): string {
  return Signature.create(signer.privateKey, signer.publicKey, nimiqSignedMessageDigest(message)).toHex();
}

const PROTECTOR = new TargetWalletProtector(Buffer.alloc(32, 11), Buffer.alloc(32, 12));

let dir: string;
let baseUrl: string;
let close: () => Promise<void>;
let rpc: FakeRpcClient;

type Response = { status: number; headers: Headers; body: any };

async function request(method: string, path: string, body?: unknown, extraHeaders: Record<string, string> = {}): Promise<Response> {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Non-JSON body (e.g. empty 204) stays null.
  }
  return { status: res.status, headers: res.headers, body: parsed };
}

async function challenge(walletAddress: string, action: string, bindings: Record<string, unknown> = {}): Promise<{ challenge_id: string; message: string }> {
  const res = await request("POST", "/auth/challenge", { wallet: walletAddress, action, ...bindings });
  expect(res.status).toBe(200);
  return res.body as { challenge_id: string; message: string; expires_at: string };
}

function envelope(ch: { challenge_id: string; message: string }, signer: Signer) {
  return { challenge_id: ch.challenge_id, public_key: signer.publicKey.toHex(), signature: sign(ch.message, signer) };
}

async function createMissionViaApi(signer: Signer, targetAddress: string, key: string) {
  const ch = await challenge(signer.address, "CREATE_MISSION");
  return request("POST", "/missions", {
    ...envelope(ch, signer),
    target_label: "Harley",
    target_wallet: targetAddress,
    target_consent_confirmed: true,
    mission_note: "I'd like this invitation to reach Harley through people who actually know him.",
    visibility: "UNLISTED",
    creator_display_label: "Faadil",
  }, { "Idempotency-Key": key });
}

async function listen(server: ReturnType<typeof createMissionHttpServer>): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

describe("Reach Mission HTTP bindings", () => {
  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), "carry-one-http-"));
    rpc = new FakeRpcClient();
    const missionPath = join(dir, "missions.json");
    const relayPath = join(dir, "relay.json");
    const repository = new FileMissionRepository(missionPath);
    const missions = new ReachMissionService(repository, PROTECTOR);
    const relay = new CanonicalRelayService(new FileRelayStore(relayPath), rpc);
    const coordinator = new ReachMissionCoordinator(missions, repository, relay, PROTECTOR);
    const authorizer = new NimiqWalletAuthorizer(repository, "https://carry.one");
    const server = createMissionHttpServer({
      coordinator,
      missions,
      repository,
      authorizer,
      relay,
      protector: PROTECTOR,
      canonicalOrigin: "https://carry.one",
      idempotency: new MemoryIdempotencyStore(),
      limiter: new MemoryRateLimiter(),
    });
    baseUrl = await listen(server);
    close = () => new Promise((resolve) => server.close(() => resolve()));
  });

  afterAll(async () => {
    await close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("runs a mission end-to-end over HTTP: create -> invite -> accept -> pass -> broadcast -> reconcile -> arrived", async () => {
    const creator = wallet();
    const target = wallet();

    const createRes = await createMissionViaApi(creator, target.address, "create-e2e");
    expect(createRes.status).toBe(201);
    const missionView = createRes.body;
    expect(missionView.viewer_role).toBe("CREATOR");
    expect(missionView.primary_action).toBe("CREATE_INVITATION");
    expect(missionView.status).toBe("ACTIVE");
    expect(JSON.stringify(missionView)).not.toContain(target.address.replaceAll(" ", ""));
    const missionId = missionView.mission_id;

    const viewRes = await request("GET", `/missions/${missionId}`, undefined, { "X-Wallet": creator.address });
    expect(viewRes.status).toBe(200);
    expect(viewRes.body.current_holder.is_viewer).toBe(true);

    const inviteCh = await challenge(creator.address, "CREATE_INVITATION", { mission_id: missionId, sequence: 1 });
    const inviteRes = await request("POST", `/missions/${missionId}/invitations`, {
      ...envelope(inviteCh, creator),
      candidate_label: "Bridge",
      candidate_wallet: target.address,
      why_you: "You know the destination.",
    }, { "Idempotency-Key": "invite-e2e" });
    expect(inviteRes.status).toBe(201);
    expect(inviteRes.body.invite_token).toBeTruthy();
    expect(inviteRes.body.web_invite_url).toMatch(new RegExp(`^https://carry\\.one/i/${inviteRes.body.invite_token}$`));
    expect(inviteRes.body.nimiq_pay_custom_scheme).toContain("nimiqpay://miniapp?url=");
    const token = inviteRes.body.invite_token;
    const invitationId = inviteRes.body.invitation.id;

    const inviteViewRes = await request("GET", `/i/${token}`);
    expect(inviteViewRes.status).toBe(200);
    expect(inviteViewRes.body.invitation.status).toBe("INVITED");

    const acceptCh = await challenge(target.address, "ACCEPT_INVITATION", {
      mission_id: missionId,
      invitation_id: invitationId,
      sequence: 1,
    });
    const acceptRes = await request("POST", `/i/${token}/accept`, {
      ...envelope(acceptCh, target),
      candidate_display_label: "Harley",
    }, { "Idempotency-Key": "accept-e2e" });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.status).toBe("ACCEPTED");

    const passCh = await challenge(creator.address, "AUTHORIZE_PASS", {
      mission_id: missionId,
      invitation_id: invitationId,
      sequence: 1,
    });
    const passRes = await request("POST", `/missions/${missionId}/pass-intent`, {
      ...envelope(passCh, creator),
      invitation_id: invitationId,
    }, { "Idempotency-Key": "pass-e2e" });
    expect(passRes.status).toBe(200);
    const intent = passRes.body;
    expect(intent.sequence).toBe(1);
    expect(intent.recipient).toBe(target.address);
    expect(intent.expected_sender).toBe(creator.address);
    expect(intent.value_luna).toBe(ONE_NIM_IN_LUNA);
    expect(intent.recipient_data).toMatch(/^co:v1:/);

    const txHash = randomBytes(32).toString("hex");
    const broadcastRes = await request("POST", `/missions/${missionId}/broadcast`, {
      invitation_id: invitationId,
      tx_hash: txHash,
    }, { "Idempotency-Key": "broadcast-e2e" });
    expect(broadcastRes.status).toBe(201);
    expect(broadcastRes.body.tx_hash).toBe(txHash);

    rpc.tx = {
      hash: txHash,
      from: creator.address,
      to: target.address,
      value: ONE_NIM_IN_LUNA,
      blockNumber: 3_032_020,
      confirmations: 999,
      recipientData: intent.recipient_data,
    };

    const reconcileRes = await request("POST", `/missions/${missionId}/reconcile`, {}, { "Idempotency-Key": "reconcile-e2e" });
    expect(reconcileRes.status).toBe(200);
    expect(reconcileRes.body.mission.status).toBe("ARRIVED");
    expect(reconcileRes.body.mission.sequence).toBe(1);
    expect(reconcileRes.body.mission.finalized_hop_count).toBe(1);

    const targetViewRes = await request("GET", `/missions/${missionId}`, undefined, { "X-Wallet": target.address });
    expect(targetViewRes.status).toBe(200);
    expect(targetViewRes.body.viewer_role).toBe("TARGET");
    expect(targetViewRes.body.primary_action).toBe("START_NEW_ROUTE");
    expect(targetViewRes.body.route).toHaveLength(1);
    expect(targetViewRes.body.route[0].recipient.is_viewer).toBe(true);
  });

  it("replays a mutation with the same Idempotency-Key instead of creating a second mission", async () => {
    const creator = wallet();
    const target = wallet();
    const ch = await challenge(creator.address, "CREATE_MISSION");
    const body = {
      ...envelope(ch, creator),
      target_label: "Idem",
      target_wallet: target.address,
      target_consent_confirmed: true,
      mission_note: "Same key must not create two missions.",
    };
    const first = await request("POST", "/missions", body, { "Idempotency-Key": "replay-create" });
    expect(first.status).toBe(201);
    const second = await request("POST", "/missions", body, { "Idempotency-Key": "replay-create" });
    expect(second.status).toBe(201);
    expect(second.headers.get("Idempotency-Replayed")).toBe("true");
    expect(second.body.mission_id).toBe(first.body.mission_id);
  });

  it("rejects replay of an already-consumed challenge with 401 CHALLENGE_REPLAY", async () => {
    const creator = wallet();
    const target = wallet();
    const ch = await challenge(creator.address, "CREATE_MISSION");
    const body = {
      ...envelope(ch, creator),
      target_label: "Replay",
      target_wallet: target.address,
      target_consent_confirmed: true,
      mission_note: "Consume the challenge once.",
    };
    expect((await request("POST", "/missions", body, { "Idempotency-Key": "challenge-1" })).status).toBe(201);
    const replay = await request("POST", "/missions", body, { "Idempotency-Key": "challenge-2" });
    expect(replay.status).toBe(401);
    expect(replay.body.error).toBe("CHALLENGE_REPLAY");
  });

  it("returns 400 with a details array when the body contains an unknown field", async () => {
    const creator = wallet();
    const ch = await challenge(creator.address, "CREATE_MISSION");
    const res = await request("POST", "/missions", {
      ...envelope(ch, creator),
      target_label: "Strict",
      target_wallet: creator.address,
      target_consent_confirmed: true,
      mission_note: "Unknown fields must be rejected.",
      bogus_field: "nope",
    }, { "Idempotency-Key": "strict-1" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("UNKNOWN_FIELD");
    expect(res.body.details).toEqual(expect.arrayContaining([expect.objectContaining({ field: "bogus_field" })]));
  });

  it("rejects mutation without Idempotency-Key header and unknown mission with 404", async () => {
    const creator = wallet();
    const ch = await challenge(creator.address, "CREATE_MISSION");
    const res = await request("POST", "/missions", {
      ...envelope(ch, creator),
      target_label: "NoKey",
      target_wallet: creator.address,
      target_consent_confirmed: true,
      mission_note: "Idempotency key is mandatory.",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("MISSING_IDEMPOTENCY_KEY");

    const missing = await request("GET", "/missions/00000000-0000-4000-8000-000000000000");
    expect(missing.status).toBe(404);
    expect(missing.body.error).toBe("MISSION_NOT_FOUND");
  });

  it("declines an invitation token-only without a wallet signature", async () => {
    const creator = wallet();
    const candidate = wallet();
    const missionRes = await createMissionViaApi(creator, wallet().address, "decline-mission");
    const missionId = missionRes.body.mission_id;
    const ch = await challenge(creator.address, "CREATE_INVITATION", { mission_id: missionId, sequence: 1 });
    const inviteRes = await request("POST", `/missions/${missionId}/invitations`, {
      ...envelope(ch, creator),
      candidate_wallet: candidate.address,
    }, { "Idempotency-Key": "decline-invite" });
    expect(inviteRes.status).toBe(201);

    const declineRes = await request("POST", `/i/${inviteRes.body.invite_token}/decline`, {}, { "Idempotency-Key": "decline-1" });
    expect(declineRes.status).toBe(200);
    expect(declineRes.body.status).toBe("DECLINED");
  });
});

describe("Reach Mission HTTP rate limiting", () => {
  it("returns 429 with Retry-After once the reads budget is exhausted", async () => {
    const dir = mkdtempSync(join(tmpdir(), "carry-one-rate-"));
    try {
      const repository = new FileMissionRepository(join(dir, "missions.json"));
      const missions = new ReachMissionService(repository, PROTECTOR);
      const rpcClient = new FakeRpcClient();
      const relay = new CanonicalRelayService(new FileRelayStore(join(dir, "relay.json")), rpcClient);
      const coordinator = new ReachMissionCoordinator(missions, repository, relay, PROTECTOR);
      const authorizer = new NimiqWalletAuthorizer(repository, "https://carry.one");
      const server = createMissionHttpServer({
        coordinator,
        missions,
        repository,
        authorizer,
        relay,
        protector: PROTECTOR,
        canonicalOrigin: "https://carry.one",
        idempotency: new MemoryIdempotencyStore(),
        limiter: new MemoryRateLimiter(),
        limits: { readsPerMinute: 1, mutationsPerMinute: 1, challengesPerMinute: 1 },
      });
      const base = await listen(server);
      try {
        const first = await fetch(`${base}/usage`);
        expect(first.status).toBe(200);
        const second = await fetch(`${base}/usage`);
        expect(second.status).toBe(429);
        expect(second.headers.get("Retry-After")).toBeTruthy();
        const body = await second.json();
        expect(body.error).toBe("RATE_LIMITED");
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});