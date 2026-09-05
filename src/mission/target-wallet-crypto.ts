import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { Address } from "@nimiq/core";
import { MissionValidationError } from "./types.js";

const VERSION = "v1";
const IV_BYTES = 12;
const KEY_BYTES = 32;

export function normalizeNimiqAddress(address: string): string {
  try {
    return Address.fromString(address).toUserFriendlyAddress();
  } catch {
    throw new MissionValidationError("INVALID_NIMIQ_ADDRESS", "Address is not a valid Nimiq address");
  }
}

export function walletFingerprint(address: string): string {
  const compact = normalizeNimiqAddress(address).replaceAll(" ", "");
  return `${compact.slice(0, 4)}…${compact.slice(-6)}`;
}

export function decodeKey(value: string, label: string): Buffer {
  let key: Buffer;
  try {
    key = Buffer.from(value, "base64url");
  } catch {
    throw new MissionValidationError("INVALID_CRYPTO_KEY", `${label} must be base64url encoded`);
  }
  if (key.length !== KEY_BYTES) {
    throw new MissionValidationError("INVALID_CRYPTO_KEY", `${label} must decode to exactly ${KEY_BYTES} bytes`);
  }
  return key;
}

export class TargetWalletProtector {
  constructor(
    private readonly encryptionKey: Uint8Array,
    private readonly hmacKey: Uint8Array
  ) {
    if (encryptionKey.byteLength !== KEY_BYTES || hmacKey.byteLength !== KEY_BYTES) {
      throw new MissionValidationError("INVALID_CRYPTO_KEY", "Target wallet encryption and HMAC keys must each be 32 bytes");
    }
  }

  protect(address: string): { normalized: string; ciphertext: string; hmac: string } {
    const normalized = normalizeNimiqAddress(address);
    return {
      normalized,
      ciphertext: this.encryptNormalized(normalized),
      hmac: this.hmacNormalized(normalized),
    };
  }

  encryptNormalized(normalized: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv("aes-256-gcm", this.encryptionKey, iv);
    const ciphertext = Buffer.concat([cipher.update(normalized, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
  }

  decrypt(ciphertext: string): string {
    const [version, ivText, tagText, bodyText, extra] = ciphertext.split(".");
    if (version !== VERSION || !ivText || !tagText || !bodyText || extra !== undefined) {
      throw new MissionValidationError("INVALID_TARGET_CIPHERTEXT", "Target wallet ciphertext has an invalid envelope");
    }
    try {
      const decipher = createDecipheriv("aes-256-gcm", this.encryptionKey, Buffer.from(ivText, "base64url"));
      decipher.setAuthTag(Buffer.from(tagText, "base64url"));
      return Buffer.concat([
        decipher.update(Buffer.from(bodyText, "base64url")),
        decipher.final(),
      ]).toString("utf8");
    } catch {
      throw new MissionValidationError("TARGET_DECRYPT_FAILED", "Target wallet ciphertext authentication failed");
    }
  }

  hmac(address: string): string {
    return this.hmacNormalized(normalizeNimiqAddress(address));
  }

  hmacNormalized(normalized: string): string {
    return createHmac("sha256", this.hmacKey).update(normalized, "utf8").digest("base64url");
  }

  matchesHmac(address: string, expectedHmac: string): boolean {
    const actual = Buffer.from(this.hmac(address), "utf8");
    const expected = Buffer.from(expectedHmac, "utf8");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
}
