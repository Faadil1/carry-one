export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Basic per-process fixed-window limiter. Buckets are keyed by client address
 * (plus wallet on challenge issuance). Production deployments that scale to
 * multiple instances should back this with a shared store; the single-instance
 * in-memory default keeps the boundary explicit and dependency-free.
 */
export interface RateLimiter {
  allow(key: string, limit: number, windowMs?: number): RateLimitDecision;
}

export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

interface Bucket {
  windowStart: number;
  count: number;
}

export class MemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, Bucket>();
  private readonly windowMs: number;
  private readonly maxBuckets: number;

  constructor(options: { windowMs?: number; maxBuckets?: number } = {}) {
    this.windowMs = options.windowMs ?? RATE_LIMIT_WINDOW_MS;
    this.maxBuckets = options.maxBuckets ?? 100_000;
  }

  allow(key: string, limit: number, windowMs = this.windowMs): RateLimitDecision {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket || now - bucket.windowStart >= windowMs) {
      bucket = { windowStart: now, count: 0 };
      this.buckets.set(key, bucket);
    } else if (this.buckets.size > this.maxBuckets) {
      const oldest = this.buckets.keys().next().value as string | undefined;
      if (oldest !== undefined) this.buckets.delete(oldest);
    }

    bucket.count += 1;
    if (!limit || bucket.count <= limit) {
      return { allowed: true, retryAfterSeconds: 0 };
    }
    const remaining = windowMs - (now - bucket.windowStart);
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(remaining / 1000)) };
  }
}