/**
 * Simple in-memory rate limiter for login endpoints.
 *
 * NOTE: This is process-local — it works correctly on a single server or in
 * development. For production serverless deployments (Vercel, etc.) swap this
 * for a Redis-backed solution such as @upstash/ratelimit so the counter is
 * shared across all function instances.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Module-level map survives across requests in a single process/lambda warm start
const store = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

/**
 * Check and increment the rate-limit counter for the given key (usually an IP).
 *
 * @param key        Unique identifier (IP address, user-agent hash, etc.)
 * @param maxAttempts Maximum allowed attempts within the window. Default: 5
 * @param windowMs   Sliding window duration in milliseconds. Default: 15 min
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // No entry, or the previous window has expired → fresh start
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxAttempts - entry.count };
}

/**
 * Manually reset the rate-limit counter for a key (e.g. after a successful login).
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Extract the best available IP address from a Next.js request.
 * Checks common proxy headers before falling back to "unknown".
 */
export function getClientIp(request: Request): string {
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip", // Cloudflare
    "x-client-ip",
  ];
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can be a comma-separated list; take the first
      return value.split(",")[0].trim();
    }
  }
  return "unknown";
}
