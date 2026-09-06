import { normalizeNimiqAddress } from "../mission/target-wallet-crypto.js";

export interface FieldError {
  field: string;
  message: string;
}

export class RequestValidationError extends Error {
  constructor(
    public reason: string,
    message: string,
    public readonly details: FieldError[] = []
  ) {
    super(message);
    this.name = "RequestValidationError";
  }
}

function fail(reason: string, message: string, details: FieldError[] = []): never {
  throw new RequestValidationError(reason, message, details);
}

export function asObject(value: unknown, label = "body"): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail("INVALID_BODY", `${label} must be a JSON object`);
  }
  return value as Record<string, unknown>;
}

export function asString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    fail("INVALID_STRING", `${label} must be a non-empty string`, [{ field: label, message: "Expected a non-empty string" }]);
  }
  return value;
}

export function asOptionalString(value: unknown, label: string): string | null {
  if (value === undefined || value === null) return null;
  return asString(value, label);
}

export function boundedText(value: unknown, label: string, min: number, max: number): string {
  const text = asString(value, label).trim();
  if (text.length < min || text.length > max) {
    fail("INVALID_TEXT_LENGTH", `${label} must be between ${min} and ${max} characters`, [
      { field: label, message: `Length ${text.length} is outside ${min}..${max}` },
    ]);
  }
  return text;
}

export function asBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") {
    fail("INVALID_BOOLEAN", `${label} must be a boolean`, [{ field: label, message: "Expected a boolean" }]);
  }
  return value;
}

export function asInteger(value: unknown, label: string, min = 0): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min) {
    fail("INVALID_INTEGER", `${label} must be an integer greater than or equal to ${min}`, [
      { field: label, message: `Expected integer >= ${min}` },
    ]);
  }
  return value;
}

export function asEnum<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    fail("INVALID_ENUM", `${label} must be one of: ${allowed.join(", ")}`, [
      { field: label, message: `Expected one of ${allowed.join(", ")}` },
    ]);
  }
  return value as T;
}

export function asOptionalEnum<T extends string>(value: unknown, allowed: readonly T[], label: string): T | null {
  if (value === undefined || value === null) return null;
  return asEnum(value, allowed, label);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function asUuid(value: unknown, label: string): string {
  const text = asString(value, label);
  if (!UUID_RE.test(text)) {
    fail("INVALID_UUID", `${label} must be a UUID`, [{ field: label, message: "Expected a UUID" }]);
  }
  return text.toLowerCase();
}

export function asOptionalUuid(value: unknown, label: string): string | null {
  if (value === undefined || value === null) return null;
  return asUuid(value, label);
}

const HEX_RE = /^[0-9a-fA-F]+$/;

export function asHex(value: unknown, label: string, exactBytes?: number): string {
  const text = asString(value, label);
  if (!HEX_RE.test(text)) {
    fail("INVALID_HEX", `${label} must be hexadecimal`, [{ field: label, message: "Expected hex characters only" }]);
  }
  if (exactBytes !== undefined && text.length !== exactBytes * 2) {
    fail("INVALID_HEX_LENGTH", `${label} must be exactly ${exactBytes} bytes as hex`, [
      { field: label, message: `Expected ${exactBytes * 2} hex characters` },
    ]);
  }
  return text;
}

export function asTxHash(value: unknown, label = "tx_hash"): string {
  return asHex(value, label, 32);
}

const TOKEN_RE = /^[A-Za-z0-9_-]{32,}$/;

export function asOpaqueToken(value: unknown, label: string): string {
  const text = asString(value, label);
  if (!TOKEN_RE.test(text)) {
    fail("INVALID_OPAQUE_TOKEN", `${label} must be an opaque high-entropy value`, [
      { field: label, message: "Expected base64url token" },
    ]);
  }
  return text;
}

export function asAddress(value: unknown, label: string): string {
  const text = asString(value, label);
  try {
    return normalizeNimiqAddress(text);
  } catch {
    fail("INVALID_NIMIQ_ADDRESS", `${label} is not a valid Nimiq address`, [
      { field: label, message: "Expected a valid NQ address" },
    ]);
  }
}

export function rejectUnknownKeys(obj: Record<string, unknown>, allowed: readonly string[]): void {
  const extra = Object.keys(obj).filter((key) => !allowed.includes(key));
  if (extra.length > 0) {
    fail("UNKNOWN_FIELD", `Unexpected field${extra.length > 1 ? "s" : ""}: ${extra.join(", ")}`, extra.map((field) => ({
      field,
      message: `Unknown field: ${field}`,
    })));
  }
}

export interface SignedEnvelope {
  challenge_id: string;
  public_key: string;
  signature: string;
}

export function parseSignedEnvelope(obj: Record<string, unknown>): SignedEnvelope {
  return {
    challenge_id: asUuid(obj.challenge_id, "challenge_id"),
    public_key: asHex(obj.public_key, "public_key"),
    signature: asHex(obj.signature, "signature"),
  };
}