import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PrivateKey, PublicKey, Signature } from "@nimiq/core";
import { afterEach, describe, expect, it } from "vitest";
import { FileMissionRepository } from "../../src/mission/file-repository.js";
import { TargetWalletProtector, normalizeNimiqAddress } from "../../src/mission/target-wallet-crypto.js";
import { NimiqWalletAuthorizer, nimiqSignedMessageDigest } from "../../src/mission/wallet-auth.js";
import { MissionValidationError } from "../../src/mission/types.js";

const dirs: string[] = [];

function tempFile(name: string): string {
  const dir = mkdtempSync(join(tmpdir(), "carry-one-"));
  dirs.push(dir);
  return join(dir, name);
}

function wallet() {
  const privateKey = PrivateKey.generate();
  const publicKey = PublicKey.derive(privateKey);
  return {
    privateKey,
    publicKey,
    address: publicKey.toAddress().toUserFriendlyAddress(),
  };
}

function sign(message: string, signer: ReturnType<typeof wallet>) {
  return Signature.create(signer.privateKey, signer.publicKey, nimiqSignedMessageDigest(message)).toHex();
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("Reach Mission target-wallet privacy", () => {
  it("encrypts target wallet and uses keyed equality without plaintext leakage", () => {
    const protector = new TargetWalletProtector(Buffer.alloc(32, 7), Buffer.alloc(32, 9));
    const target = wallet().address;
    const protectedTarget = protector.protect(target);

    expect(protectedTarget.normalized).toBe(normalizeNimiqAddress(target));
    expect(protectedTarget.ciphertext).not.toContain(protectedTarget.normalized);
    expect(protectedTarget.hmac).not.toContain(protectedTarget.normalized.replaceAll(" ", ""));
    expect(protector.decrypt(protectedTarget.ciphertext)).toBe(protectedTarget.normalized);
    expect(protector.matchesHmac(target, protectedTarget.hmac)).toBe(true);
    expect(protector.matchesHmac(wallet().address, protectedTarget.hmac)).toBe(false);
  });

  it("rejects ciphertext authentication with the wrong key", () => {
    const source = new TargetWalletProtector(Buffer.alloc(32, 1), Buffer.alloc(32, 2));
    const wrong = new TargetWalletProtector(Buffer.alloc(32, 3), Buffer.alloc(32, 2));
    const ciphertext = source.protect(wallet().address).ciphertext;
    expect(() => wrong.decrypt(ciphertext)).toThrowError(MissionValidationError);
  });
});

describe("Nimiq wallet action authorization", () => {
  it("verifies the Nimiq Pay signed-message format and consumes the challenge once", async () => {
    const repo = new FileMissionRepository(tempFile("mission.json"));
    const authorizer = new NimiqWalletAuthorizer(repo, "https://carry.one");
    const signer = wallet();
    const challenge = await authorizer.issue({
      wallet: signer.address,
      action: "CREATE_MISSION",
      now: 1_000,
    });
    const signatureHex = sign(challenge.message, signer);

    const verified = await authorizer.verifyAndConsume({
      challengeId: challenge.id,
      publicKeyHex: signer.publicKey.toHex(),
      signatureHex,
      now: 2_000,
    });
    expect(verified.wallet).toBe(normalizeNimiqAddress(signer.address));
    expect(verified.action).toBe("CREATE_MISSION");

    await expect(authorizer.verifyAndConsume({
      challengeId: challenge.id,
      publicKeyHex: signer.publicKey.toHex(),
      signatureHex,
      now: 2_001,
    })).rejects.toMatchObject({ reason: "CHALLENGE_REPLAY" });
  });

  it("rejects a signature whose public key does not derive to the challenged wallet", async () => {
    const repo = new FileMissionRepository(tempFile("mission.json"));
    const authorizer = new NimiqWalletAuthorizer(repo, "https://carry.one");
    const challenged = wallet();
    const attacker = wallet();
    const challenge = await authorizer.issue({ wallet: challenged.address, action: "CREATE_MISSION", now: 10_000 });

    await expect(authorizer.verifyAndConsume({
      challengeId: challenge.id,
      publicKeyHex: attacker.publicKey.toHex(),
      signatureHex: sign(challenge.message, attacker),
      now: 10_100,
    })).rejects.toMatchObject({ reason: "SIGNER_WALLET_MISMATCH" });
  });
});
