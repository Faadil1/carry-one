import type { Hop, PassIntent } from "../core/types.js";
import type { CanonicalRelayService, PublicHop } from "../service/canonical-relay-service.js";
import type { MissionRepository } from "./repository.js";
import { ReachMissionService, toPublicMission } from "./service.js";
import { normalizeNimiqAddress, TargetWalletProtector } from "./target-wallet-crypto.js";
import { MissionValidationError, type PublicMission, type VerifiedWalletAction } from "./types.js";

export class ReachMissionCoordinator {
  constructor(
    private readonly missions: ReachMissionService,
    private readonly repository: MissionRepository,
    private readonly relay: CanonicalRelayService,
    private readonly protector: TargetWalletProtector
  ) {
    missions.setBroadcastGuard((missionId) => relay.hasRecordedBroadcast(missionId));
  }

  async authorizePass(input: {
    missionId: string;
    invitationId: string;
    auth: VerifiedWalletAction;
    now?: number;
  }): Promise<PassIntent> {
    const mission = await this.missions.getMissionRecord(input.missionId);
    const invitation = await this.missions.getInvitationRecord(input.invitationId);
    const now = input.now ?? Date.now();

    if (input.auth.action !== "AUTHORIZE_PASS") {
      throw new MissionValidationError("WRONG_AUTH_ACTION", "AUTHORIZE_PASS wallet authorization is required");
    }
    if (
      input.auth.missionId !== mission.id ||
      input.auth.invitationId !== invitation.id ||
      input.auth.sequence !== invitation.sequence
    ) {
      throw new MissionValidationError("AUTH_BINDING_MISMATCH", "Pass authorization is bound to different mission state");
    }
    if (mission.status !== "ACTIVE") throw new MissionValidationError("MISSION_NOT_ACTIVE", `Mission is ${mission.status}`);
    const signer = normalizeNimiqAddress(input.auth.wallet);
    if (signer !== mission.currentHolderWalletNormalized) {
      throw new MissionValidationError("WRONG_CURRENT_HOLDER", "Only the canonical holder can authorize this pass");
    }
    if (invitation.missionId !== mission.id || invitation.sequence !== mission.currentSequence + 1) {
      throw new MissionValidationError("INVITATION_SEQUENCE_MISMATCH", "Invitation is not the mission's next canonical hop");
    }
    if (invitation.status !== "ACCEPTED" || !invitation.candidateWalletNormalized) {
      throw new MissionValidationError("INVITATION_NOT_ACCEPTED", "Next bridge must accept before a pass can be authorized");
    }
    if (invitation.passDeadlineAt === null || now >= invitation.passDeadlineAt) {
      throw new MissionValidationError("PASS_DEADLINE_EXPIRED", "Accepted bridge pass deadline has expired");
    }

    const existing = this.relay.getActiveIntent(mission.id);
    if (existing) {
      if (
        existing.sequence === invitation.sequence &&
        existing.currentHolder === signer &&
        existing.recipient === invitation.candidateWalletNormalized
      ) return existing;
      throw new MissionValidationError("RELAY_INTENT_CONFLICT", "A different relay intent is already active for this mission");
    }

    return this.relay.initiatePass(mission.id, signer, invitation.candidateWalletNormalized);
  }

  async recordBroadcast(input: { missionId: string; invitationId: string; txHash: string }): Promise<Hop> {
    const invitation = await this.missions.getInvitationRecord(input.invitationId);
    const active = this.relay.getActiveIntent(input.missionId);
    if (!active) throw new MissionValidationError("NO_ACTIVE_PASS", "No authorized pass exists for this mission");
    if (invitation.missionId !== input.missionId || invitation.sequence !== active.sequence || invitation.status !== "ACCEPTED") {
      throw new MissionValidationError("INVITATION_PASS_MISMATCH", "Broadcast does not match the accepted invitation");
    }
    return this.relay.recordBroadcast(input.missionId, input.txHash);
  }

  /**
   * Reconcile chain state and atomically project a newly FINAL relay hop into
   * the durable Reach Mission record. The second phase also repairs the exact
   * crash window where relay finality was persisted but mission finalization
   * had not yet committed before restart.
   */
  async reconcile(missionId: string): Promise<{ mission: PublicMission; hop: Hop | PublicHop | null }> {
    const observed = await this.relay.reconcile(missionId);
    const applied = await this.applyNextFinalizedHop(missionId);
    return {
      mission: toPublicMission(await this.missions.getMissionRecord(missionId)),
      hop: observed ?? applied,
    };
  }

  private async applyNextFinalizedHop(missionId: string): Promise<PublicHop | null> {
    const mission = await this.missions.getMissionRecord(missionId);
    if (mission.status !== "ACTIVE") return null;
    const nextSequence = mission.currentSequence + 1;
    const finalHop = this.relay
      .getHistory(missionId)
      .find((hop) => hop.sequence === nextSequence && hop.status === "CONFIRMED");
    if (!finalHop) return null;

    const invitation = await this.repository.getOpenInvitation(missionId);
    if (!invitation || invitation.status !== "ACCEPTED" || invitation.sequence !== nextSequence) {
      throw new MissionValidationError(
        "FINAL_HOP_WITHOUT_ACCEPTED_INVITATION",
        "A finalized relay hop cannot be projected without its accepted invitation"
      );
    }
    const recipient = normalizeNimiqAddress(finalHop.recipient);
    await this.repository.completeFinalHop({
      missionId,
      invitationId: invitation.id,
      sequence: nextSequence,
      recipientWallet: recipient,
      recipientHmac: this.protector.hmac(recipient),
      now: finalHop.confirmed_at ? Date.parse(finalHop.confirmed_at) : Date.now(),
    });
    return finalHop;
  }
}
