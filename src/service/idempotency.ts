import { createHash } from "node:crypto";

export interface StoredResponse {
  status: number;
  body: unknown;
  createdAt: number;
}

/**
 * Idempotency boundary for mutation endpoints. The store maps a request
 * fingerprint to the exact first response so a retried request replays the
 * original result instead of running the mutation twice. Production can back
 * this interface with Postgres; the in-memory implementation is process-local
 * and bounded, matching single-instance deployment for now.
 */
export interface IdempotencyStore {
  lookup(fingerprint: string): Promise<StoredResponse | undefined>;
  save(fingerprint: string, response: StoredResponse): Promise<void>;
}

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
export const IDEMPOTENCY_CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 10_000;

export function idempotencyFingerprint(method: string, path: string, key: string): string {
  return createHash("sha256").update(`${method}\n${path}\n${key}`, "utf8").digest("base64url");
}

export class MemoryIdempotencyStore implements IdempotencyStore {
  private entries = new Map<string, StoredResponse>();
  private lastCleanup = Date.now();

  private sweep(now: number): void {
    if (this.entries.size <= MAX_ENTRIES && now - this.lastCleanup < IDEMPOTENCY_CLEANUP_INTERVAL_MS) return;
    const cutoff = now - IDEMPOTENCY_TTL_MS;
    for (const [key, entry] of this.entries) {
      if (entry.createdAt < cutoff) this.entries.delete(key);
    }
    this.lastCleanup = now;
  }

  async lookup(fingerprint: string): Promise<StoredResponse | undefined> {
    this.sweep(Date.now());
    const entry = this.entries.get(fingerprint);
    if (!entry) return undefined;
    if (Date.now() - entry.createdAt > IDEMPOTENCY_TTL_MS) {
      this.entries.delete(fingerprint);
      return undefined;
    }
    return entry;
  }

  async save(fingerprint: string, response: StoredResponse): Promise<void> {
    this.sweep(Date.now());
    if (this.entries.size >= MAX_ENTRIES && !this.entries.has(fingerprint)) {
      const oldest = this.entries.keys().next().value as string | undefined;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(fingerprint, response);
  }
}