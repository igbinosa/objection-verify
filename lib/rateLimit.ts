// Fixed-window rate limiter, kept in memory.
//
// Limits: each serverless instance keeps its own counts, so the real ceiling is
// `limit` per window per warm instance, and counts reset on a cold start. That
// is enough to stop one person looping the endpoint and running up the Claude
// bill. It is not a substitute for a spend cap on the Anthropic key itself.

export interface RateLimiter {
  check(key: string, now?: number): { allowed: boolean; retryAfterSeconds: number }
}

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, { count: number; windowStart: number }>()

  return {
    check(key, now = Date.now()) {
      // Drop expired entries so the map can't grow without bound.
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (now - v.windowStart >= windowMs) hits.delete(k)
      }

      const entry = hits.get(key)
      if (!entry || now - entry.windowStart >= windowMs) {
        hits.set(key, { count: 1, windowStart: now })
        return { allowed: true, retryAfterSeconds: 0 }
      }

      if (entry.count >= limit) {
        const retryAfterSeconds = Math.ceil((entry.windowStart + windowMs - now) / 1000)
        return { allowed: false, retryAfterSeconds }
      }

      entry.count += 1
      return { allowed: true, retryAfterSeconds: 0 }
    },
  }
}

// Vercel sets x-forwarded-for itself; the first entry is the client.
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headers.get('x-real-ip') ?? 'unknown'
}
