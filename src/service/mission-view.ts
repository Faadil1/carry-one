import type { PublicHop, PublicStatus } from "./canonical-relay-service.js";
import { missionActivity } from "../mission/service.js";
import { TargetWalletProtector, normalizeNimiqAddress, walletFingerprint } from "../mission/target-wallet-crypto.js";
import type { InvitationRecord, InvitationStatus, MissionActivity, MissionRecord, MissionStatus } from "../mission/types.js";

export type ViewerRole = "CREATOR" | "HOLDER" | "PARTICIPANT" | "INVITEE" | "TARGET" | "UNLISTED_VIEWER";
export type PrimaryAction = "CREATE_INVITATION" | "WAIT" | "PASS_1_NIM" | "REROUTE" | "VIEW_ROUTE" | "START_NEW_ROUTE";

export interface RouteEntry {
  sequence: number;
  current_holder: { wallet_fingerprint: string; is_viewer: boolean };
  recipient: { wallet_fingerprint: string; is_viewer: boolean };
  status: PublicStatus;
  tx_hash: string | null;
  confirmed_at: string | null;
}

export interface InvitationSummary {
  invitation_id: string;
  sequence: number;
  candidate_label: string | null;
  candidate_wallet_fingerprint: string | null;
  why_you: string | null;
  status: InvitationStatus;
  expires_at: string;
  pass_deadline_at: string | null;
}

export interface MissionView {
  mission_id: string;
  status: MissionStatus;
  activity: MissionActivity;
  target_label: string;
  target_consent_confirmed: boolean;
  mission_note: string;
  sequence: number;
  finalized_hop_count: number;
  current_holder: { display_label: string | null; wallet_fingerprint: string; is_viewer: boolean };
  invitation: InvitationSummary | null;
  route: RouteEntry[];
  route_following_available: boolean;
  stalled_restart_available: boolean;
  viewer_role: ViewerRole;
  primary_action: PrimaryAction | null;
}

function sameWallet(left: string | null, right: string | null): boolean {
  if (left === null || right === null) return false;
  try {
    return normalizeNimiqAddress(left) === normalizeNimiqAddress(right);
  } catch {
    return left === right;
  }
}

function toRouteEntry(hop: PublicHop, viewer: string | null, now: number): RouteEntry {
  return {
    sequence: hop.sequence,
    current_holder: { wallet_fingerprint: walletFingerprint(hop.current_holder), is_viewer: sameWallet(viewer, hop.current_holder) },
    recipient: { wallet_fingerprint: walletFingerprint(hop.recipient), is_viewer: sameWallet(viewer, hop.recipient) },
    status: hop.status,
    tx_hash: hop.tx_hash,
    confirmed_at: hop.confirmed_at,
  };
}

function toInvitationSummary(invitation: InvitationRecord): InvitationSummary {
  return {
    invitation_id: invitation.id,
    sequence: invitation.sequence,
    candidate_label: invitation.candidateLabel,
    candidate_wallet_fingerprint: invitation.candidateWalletNormalized
      ? walletFingerprint(invitation.candidateWalletNormalized)
      : null,
    why_you: invitation.whyYou,
    status: invitation.status,
    expires_at: new Date(invitation.expiresAt).toISOString(),
    pass_deadline_at: invitation.passDeadlineAt === null ? null : new Date(invitation.passDeadlineAt).toISOString(),
  };
}

function currentHolderLabel(mission: MissionRecord): string | null {
  return mission.currentHolderWalletNormalized === mission.creatorWalletNormalized ? mission.creatorDisplayLabel : null;
}

function deriveViewerRole(
  mission: MissionRecord,
  invitation: InvitationRecord | null,
  route: PublicHop[],
  protector: TargetWalletProtector,
  viewer: string | null
): ViewerRole {
  if (viewer === null) return "UNLISTED_VIEWER";
  if (viewer === mission.creatorWalletNormalized) return "CREATOR";
  if (protector.matchesHmac(viewer, mission.targetWalletHmac)) return "TARGET";
  if (mission.status === "ACTIVE" && viewer === mission.currentHolderWalletNormalized) return "HOLDER";
  if (
    invitation &&
    (invitation.status === "INVITED" || invitation.status === "ACCEPTED") &&
    invitation.candidateWalletNormalized !== null &&
    sameWallet(viewer, invitation.candidateWalletNormalized)
  ) {
    return "INVITEE";
  }
  if (route.some((hop) => sameWallet(viewer, hop.current_holder) || sameWallet(viewer, hop.recipient))) {
    return "PARTICIPANT";
  }
  return "UNLISTED_VIEWER";
}

function derivePrimaryAction(
  status: MissionStatus,
  activity: MissionActivity,
  viewerRole: ViewerRole,
  invitation: InvitationSummary | null,
  viewerIsCurrentHolder: boolean,
  hasActiveIntent: boolean
): PrimaryAction | null {
  if (status === "CANCELLED") return null;
  if (status === "ARRIVED") {
    return ["CREATOR", "HOLDER", "PARTICIPANT", "TARGET"].includes(viewerRole) ? "START_NEW_ROUTE" : "VIEW_ROUTE";
  }
  if (activity === "STALLED") {
    return ["CREATOR", "HOLDER", "PARTICIPANT"].includes(viewerRole) ? "REROUTE" : "VIEW_ROUTE";
  }
  if (viewerIsCurrentHolder) {
    if (!invitation) return "CREATE_INVITATION";
    if (invitation.status === "ACCEPTED" && !hasActiveIntent) return "PASS_1_NIM";
    return "WAIT";
  }
  if (viewerRole === "INVITEE") {
    return invitation?.status === "ACCEPTED" ? "WAIT" : null;
  }
  return viewerRole === "UNLISTED_VIEWER" ? null : "VIEW_ROUTE";
}

export function composeMissionView(input: {
  mission: MissionRecord;
  invitation: InvitationRecord | null;
  route: PublicHop[];
  protector: TargetWalletProtector;
  viewer: string | null;
  hasActiveIntent: boolean;
  now?: number;
}): MissionView {
  const now = input.now ?? Date.now();
  const activity = missionActivity(input.mission, now);
  const invitation = input.invitation === null ? null : toInvitationSummary(input.invitation);
  const viewerRole = deriveViewerRole(input.mission, input.invitation, input.route, input.protector, input.viewer);
  const viewerIsCurrentHolder = sameWallet(input.viewer, input.mission.currentHolderWalletNormalized);
  const primaryAction = derivePrimaryAction(
    input.mission.status,
    activity,
    viewerRole,
    invitation,
    viewerIsCurrentHolder,
    input.hasActiveIntent
  );

  return {
    mission_id: input.mission.id,
    status: input.mission.status,
    activity,
    target_label: input.mission.targetLabel,
    target_consent_confirmed: input.mission.targetConsentConfirmed,
    mission_note: input.mission.missionNote,
    sequence: input.mission.currentSequence,
    finalized_hop_count: input.mission.finalizedHopCount,
    current_holder: {
      display_label: currentHolderLabel(input.mission),
      wallet_fingerprint: walletFingerprint(input.mission.currentHolderWalletNormalized),
      is_viewer: viewerIsCurrentHolder,
    },
    invitation,
    route: input.route.map((hop) => toRouteEntry(hop, input.viewer, now)),
    route_following_available: input.mission.status !== "CANCELLED",
    stalled_restart_available: activity === "STALLED",
    viewer_role: viewerRole,
    primary_action: primaryAction,
  };
}