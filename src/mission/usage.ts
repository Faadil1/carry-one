import type { PublicHop } from "../service/canonical-relay-service.js";
import type { MissionStoreSnapshot } from "./types.js";

export interface UsageEvidence {
  missions_created: number;
  missions_arrived: number;
  invitations_created: number;
  invitations_accepted_or_completed: number;
  invitations_completed: number;
  finalized_hops: number;
  unique_participating_wallets: number;
  invitation_acceptance_rate: number | null;
  arrival_rate: number | null;
}

/**
 * Aggregate only counts needed for competition evidence. No raw wallet list,
 * invite token, target wallet, why_you text or unique-human claim leaves this
 * function. "Unique wallet" deliberately means wallet address, not person.
 */
export function buildUsageEvidence(
  snapshot: MissionStoreSnapshot,
  routeHistories: PublicHop[][]
): UsageEvidence {
  const wallets = new Set<string>();
  for (const mission of snapshot.missions) wallets.add(mission.creatorWalletNormalized);

  let finalizedHops = 0;
  for (const history of routeHistories) {
    for (const hop of history) {
      if (hop.status !== "CONFIRMED") continue;
      finalizedHops += 1;
      wallets.add(hop.current_holder);
      wallets.add(hop.recipient);
    }
  }

  const acceptedOrCompleted = snapshot.invitations.filter((i) => i.status === "ACCEPTED" || i.status === "COMPLETED").length;
  const completed = snapshot.invitations.filter((i) => i.status === "COMPLETED").length;
  const arrived = snapshot.missions.filter((m) => m.status === "ARRIVED").length;

  return {
    missions_created: snapshot.missions.length,
    missions_arrived: arrived,
    invitations_created: snapshot.invitations.length,
    invitations_accepted_or_completed: acceptedOrCompleted,
    invitations_completed: completed,
    finalized_hops: finalizedHops,
    unique_participating_wallets: wallets.size,
    invitation_acceptance_rate: snapshot.invitations.length === 0 ? null : acceptedOrCompleted / snapshot.invitations.length,
    arrival_rate: snapshot.missions.length === 0 ? null : arrived / snapshot.missions.length,
  };
}
