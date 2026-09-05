import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PrivateKey, PublicKey } from "@nimiq/core";
import { afterEach, describe, expect, it } from "vitest";
import { FileMissionRepository } from "../../src/mission/file-repository.js";
import { ReachMissionService, INVITATION_TTL_MS } from "../../src/mission/service.js";
import { TargetWalletProtector, normalizeNimiqAddress } from "../../src/mission/target-wallet-crypto.js";
import type { MissionAction, VerifiedWalletAction } from "../../src/mission/types.js";

const dirs: string[] = [];
function tempFile(): string {
  const dir = mkdtempSync(join(tmpdir(), "carry-one-mission-"));
  dirs.push(dir);
  return join(dir, "state.json");
}
function wallet(): string {
  const privateKey = PrivateKey.generate();
  return PublicKey.derive(privateKey).toAddress().toUserFriendlyAddress();
}
function auth(walletAddress: string, action: MissionAction, missionId?: string, invitationId?: string, sequence = 0): VerifiedWalletAction {
  return { wallet: normalizeNimiqAddress(walletAddress), action, missionId, invitationId, sequence };
}
function fixture() {
  const repo = new FileMissionRepository(tempFile());
  const protector = new TargetWalletProtector(Buffer.alloc(32, 11), Buffer.alloc(32, 12));
  const service = new ReachMissionService(repo, protector);
  return { repo, protector, service };
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("Reach Mission foundation service", () => {
  it("creates a mission without exposing target wallet material in the public DTO", async () => {
    const { repo, service } = fixture();
    const creator = wallet();
    const target = wallet();
    const mission = await service.createMission({
      auth: auth(creator, "CREATE_MISSION"),
      targetLabel: "Nimiq builder",
      targetWallet: target,
      missionNote: "Please route this through people who actually know the target.",
      now: 1_000,
    });

    const publicJson = JSON.stringify(mission);
    expect(publicJson).not.toContain(normalizeNimiqAddress(target));
    expect(publicJson).not.toContain("targetWalletCiphertext");
    expect(publicJson).not.toContain("targetWalletHmac");

    const stored = (await repo.snapshot()).missions[0];
    expect(stored.targetWalletCiphertext).not.toContain(normalizeNimiqAddress(target));
    expect(stored.targetWalletHmac).not.toBe(normalizeNimiqAddress(target));
  });

  it("fails closed when two next-bridge invitations race", async () => {
    const { service } = fixture();
    const creator = wallet();
    const mission = await service.createMission({
      auth: auth(creator, "CREATE_MISSION"),
      targetLabel: "Target",
      targetWallet: wallet(),
      missionNote: "Route me",
      now: 10_000,
    });
    const createAuth = auth(creator, "CREATE_INVITATION", mission.id, undefined, 1);
    const results = await Promise.allSettled([
      service.createInvitation({ missionId: mission.id, auth: createAuth, candidateLabel: "A", now: 11_000 }),
      service.createInvitation({ missionId: mission.id, auth: createAuth, candidateLabel: "B", now: 11_000 }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected).toBeDefined();
    expect((rejected as PromiseRejectedResult).reason).toMatchObject({ reason: "OPEN_INVITATION_EXISTS" });
  });

  it("binds an unbound invitation to the accepting wallet and allows reroute after decline", async () => {
    const { service } = fixture();
    const creator = wallet();
    const candidate = wallet();
    const mission = await service.createMission({
      auth: auth(creator, "CREATE_MISSION"),
      targetLabel: "Target",
      targetWallet: wallet(),
      missionNote: "Route me",
      now: 20_000,
    });

    const first = await service.createInvitation({
      missionId: mission.id,
      auth: auth(creator, "CREATE_INVITATION", mission.id, undefined, 1),
      candidateLabel: "First bridge",
      whyYou: "You know this community.",
      now: 21_000,
    });
    const declined = await service.declineInvitation(first.inviteToken, 22_000);
    expect(declined.status).toBe("DECLINED");

    const second = await service.createInvitation({
      missionId: mission.id,
      auth: auth(creator, "CREATE_INVITATION", mission.id, undefined, 1),
      candidateLabel: "Second bridge",
      now: 23_000,
    });
    const accepted = await service.acceptInvitation({
      token: second.inviteToken,
      auth: auth(candidate, "ACCEPT_INVITATION", mission.id, second.invitation.id, 1),
      now: 24_000,
    });
    expect(accepted.status).toBe("ACCEPTED");
    expect(accepted.candidate_wallet_fingerprint).not.toBeNull();
  });

  it("expires untouched invitations without changing custody", async () => {
    const { service } = fixture();
    const creator = wallet();
    const mission = await service.createMission({
      auth: auth(creator, "CREATE_MISSION"),
      targetLabel: "Target",
      targetWallet: wallet(),
      missionNote: "Route me",
      now: 30_000,
    });
    const invitation = await service.createInvitation({
      missionId: mission.id,
      auth: auth(creator, "CREATE_INVITATION", mission.id, undefined, 1),
      now: 31_000,
    });

    expect(await service.expireDueInvitations(31_000 + INVITATION_TTL_MS + 1)).toBe(1);
    const expired = await service.getInvitationByToken(invitation.inviteToken);
    expect(expired.status).toBe("EXPIRED");
    const after = await service.getMission(mission.id);
    expect(after.current_sequence).toBe(0);
    expect(after.finalized_hop_count).toBe(0);
  });

  it("refuses mission cancellation while an invitation is open", async () => {
    const { service } = fixture();
    const creator = wallet();
    const mission = await service.createMission({
      auth: auth(creator, "CREATE_MISSION"),
      targetLabel: "Target",
      targetWallet: wallet(),
      missionNote: "Route me",
      now: 40_000,
    });
    await service.createInvitation({
      missionId: mission.id,
      auth: auth(creator, "CREATE_INVITATION", mission.id, undefined, 1),
      now: 41_000,
    });
    await expect(service.cancelMission(mission.id, auth(creator, "CANCEL_MISSION", mission.id), 42_000))
      .rejects.toMatchObject({ reason: "OPEN_INVITATION" });
  });
});
