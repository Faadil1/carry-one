import { createHash, randomBytes, randomUUID } from "node:crypto";
import { PublicKey, Signature } from "@nimiq/core";
import type { MissionRepository } from "./repository.js";
import {
  MissionValidationError,
  type AuthChallengeRecord,
  type MissionAction,
  type VerifiedWalletAction,
} from "./types.js";
import { normalizeNimiqAddress } from "./target-wallet-crypto.js";

export const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const NIMIQ_SIGNED_MESSAGE_PREFIX = "\x16Nimiq Signed Message:\n";

function sha256Base64url(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("base64url");
}

export function nimiqSignedMessageDigest(message: string): Uint8Array {
  const prefixed = `${NIMIQ_SIGNED_MESSAGE_PREFIX}${message.length}${message}`;
  return createHash("sha256").update(prefixed, "utf8").digest();
}

export interface ChallengeRequest {
  wallet: string;
  action: MissionAction;
  missionId?: string;
  invitationId?: string;
  sequence?: number;
  now?: number;
}

export interface ChallengeResponse {
  id: string;
  message: string;
  expiresAt: string;
}

export class NimiqWalletAuthorizer {
  constructor(
    private readonly repository: MissionRepository,
    private readonly canonicalOrigin: string
  ) {}

  async issue(request: ChallengeRequest): Promise<ChallengeResponse> {
    const now = request.now ?? Date.now();
    const wallet = normalizeNimiqAddress(request.wallet);
    const nonce = randomBytes(16).toString("base64url");
    const expiresAt = now + CHALLENGE_TTL_MS;
    const sequence = request.sequence ?? 0;
    const message = [
      "carry-one:v1",
      `origin=${this.canonicalOrigin}`,
      `action=${request.action}`,
      `wallet=${wallet}`,
      `mission=${request.missionId ?? "NONE"}`,
      `invitation=${request.invitationId ?? "NONE"}`,
      `sequence=${sequence}`,
      `nonce=${nonce}`,
      `expires_at=${new Date(expiresAt).toISOString()}`,
    ].join("\n");

    const record: AuthChallengeRecord = {
      id: randomUUID(),
      walletNormalized: wallet,
      action: request.action,
      missionId: request.missionId ?? null,
      invitationId: request.invitationId ?? null,
      sequence,
      nonceHash: sha256Base64url(nonce),
      canonicalMessage: message,
      status: "ISSUED",
      expiresAt,
      usedAt: null,
      createdAt: now,
    };
    await this.repository.createChallenge(record);
    return { id: record.id, message, expiresAt: new Date(expiresAt).toISOString() };
  }

  async verifyAndConsume(input: {
    challengeId: string;
    publicKeyHex: string;
    signatureHex: string;
    now?: number;
  }): Promise<VerifiedWalletAction> {
    const now = input.now ?? Date.now();
    const challenge = await this.repository.getChallenge(input.challengeId);
    if (!challenge) throw new MissionValidationError("CHALLENGE_NOT_FOUND", "Authorization challenge does not exist");
    if (challenge.status === "USED") throw new MissionValidationError("CHALLENGE_REPLAY", "Authorization challenge was already consumed");
    if (challenge.status === "EXPIRED" || now >= challenge.expiresAt) {
      await this.repository.consumeChallenge(challenge.id, now).catch(() => undefined);
      throw new MissionValidationError("CHALLENGE_EXPIRED", "Authorization challenge has expired");
    }

    let publicKey: PublicKey;
    let signature: Signature;
    try {
      publicKey = PublicKey.fromHex(input.publicKeyHex);
      signature = Signature.fromHex(input.signatureHex);
    } catch {
      throw new MissionValidationError("MALFORMED_SIGNATURE", "Public key or signature is not valid Nimiq hex data");
    }

    const signerAddress = normalizeNimiqAddress(publicKey.toAddress().toUserFriendlyAddress());
    if (signerAddress !== challenge.walletNormalized) {
      throw new MissionValidationError("SIGNER_WALLET_MISMATCH", "Signing public key does not derive to the challenged wallet");
    }

    const valid = publicKey.verify(signature, nimiqSignedMessageDigest(challenge.canonicalMessage));
    if (!valid) throw new MissionValidationError("INVALID_SIGNATURE", "Wallet signature does not authorize this challenge");

    // Atomic consume is deliberately last. If two requests verify concurrently,
    // only one can transition ISSUED -> USED; the other fails as a replay.
    await this.repository.consumeChallenge(challenge.id, now);
    return {
      wallet: challenge.walletNormalized,
      action: challenge.action,
      missionId: challenge.missionId ?? undefined,
      invitationId: challenge.invitationId ?? undefined,
      sequence: challenge.sequence,
      challengeId: challenge.id,
    };
  }
}
