type Bucket = { count: number; resetTime: number };

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMs: number };

/**
 * Fixed-window rate limiter kept in process memory.
 *
 * NOTE: state is per server instance and lost on restart. With several
 * instances or serverless deployments each instance counts separately, so this
 * is only a basic anti-spam guard. Swap the store for Redis/Upstash when the
 * app is scaled horizontally.
 */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  maxKeys?: number;
}) {
  const buckets = new Map<string, Bucket>();
  const maxKeys = options.maxKeys ?? 1000;

  function prune(now: number) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetTime <= now) buckets.delete(key);
    }
  }

  return function check(key: string, now: number = Date.now()): RateLimitResult {
    const bucket = buckets.get(key);

    if (!bucket || now >= bucket.resetTime) {
      if (buckets.size >= maxKeys) prune(now);
      buckets.set(key, { count: 1, resetTime: now + options.windowMs });
      return { allowed: true };
    }

    if (bucket.count >= options.max) {
      return { allowed: false, retryAfterMs: bucket.resetTime - now };
    }

    bucket.count++;
    return { allowed: true };
  };
}

/**
 * x-forwarded-for may hold a chain ("client, proxy1, proxy2"); the first entry
 * is the original client. Using the whole header as a key lets clients dodge
 * the limit by appending arbitrary values.
 */
export function getClientIp(headers: Pick<Headers, "get">): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || headers.get("x-real-ip")?.trim() || "unknown-ip";
}
