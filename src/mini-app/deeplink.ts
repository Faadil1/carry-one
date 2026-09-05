export interface CarryOneInviteLinks {
  webInviteUrl: string;
  nimiqPayCustomScheme: string;
}

/**
 * Build the private invitation URL plus the documented Nimiq Pay custom-scheme
 * launcher. The invite token remains inside Carry One's HTTPS URL; Nimiq Pay
 * receives that URL as the mini-app destination.
 */
export function buildCarryOneInviteLinks(appOrigin: string, inviteToken: string): CarryOneInviteLinks {
  if (!/^[A-Za-z0-9_-]{32,}$/.test(inviteToken)) {
    throw new Error("Invite token must be an opaque high-entropy base64url value");
  }
  const origin = new URL(appOrigin);
  if (origin.protocol !== "https:" && origin.hostname !== "localhost" && !origin.hostname.startsWith("192.168.")) {
    throw new Error("Carry One invite origin must use HTTPS outside local development");
  }
  const webInviteUrl = new URL(`/i/${inviteToken}`, origin).toString();
  const nimiqPayCustomScheme = `nimiqpay://miniapp?url=${encodeURIComponent(webInviteUrl)}`;
  return { webInviteUrl, nimiqPayCustomScheme };
}
