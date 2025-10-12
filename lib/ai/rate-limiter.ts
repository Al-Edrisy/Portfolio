/**
 * Simple in-memory rate limiter for AI comment generation
 * Tracks requests per user to prevent abuse
 * 
 * ⚠️ IMPORTANT: In-memory storage doesn't persist across serverless invocations.
 * For production on Vercel/serverless, consider using:
 * - Vercel KV (Redis)
 * - Upstash Redis
 * - Database-based rate limiting
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Store rate limit data in memory
const rateLimitStore = new Map<string, RateLimitEntry>()

// Configuration - Export as constants for reuse
export const MAX_REQUESTS_PER_HOUR = 10
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

// Auto-cleanup interval (runs every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

// Schedule automatic cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupExpiredEntries()
  }, CLEANUP_INTERVAL_MS)
}

/**
 * Check if a user has exceeded rate limit
 * @param userId - User identifier
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(userId: string): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const entry = rateLimitStore.get(userId)

  // No previous entry, allow request
  if (!entry) {
    const resetTime = now + RATE_LIMIT_WINDOW_MS
    rateLimitStore.set(userId, { count: 1, resetTime })
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_HOUR - 1,
      resetTime
    }
  }

  // Check if rate limit window has expired
  if (now >= entry.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW_MS
    rateLimitStore.set(userId, { count: 1, resetTime })
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_HOUR - 1,
      resetTime
    }
  }

  // Check if user has exceeded limit
  if (entry.count >= MAX_REQUESTS_PER_HOUR) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }

  // Increment count and allow request
  entry.count += 1
  rateLimitStore.set(userId, entry)
  
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_HOUR - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [userId, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(userId)
    }
  }
}

/**
 * Get rate limit info for a user WITHOUT incrementing the counter
 * Use this for status checks that shouldn't count against the limit
 * @param userId - User identifier
 */
export function getRateLimitInfo(userId: string): {
  requestsRemaining: number
  resetTime: number
  totalRequests: number
} {
  const entry = rateLimitStore.get(userId)
  const now = Date.now()

  if (!entry || now >= entry.resetTime) {
    return {
      requestsRemaining: MAX_REQUESTS_PER_HOUR,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
      totalRequests: 0
    }
  }

  return {
    requestsRemaining: MAX_REQUESTS_PER_HOUR - entry.count,
    resetTime: entry.resetTime,
    totalRequests: entry.count
  }
}

/**
 * Reset rate limit for a specific user (useful for testing or admin actions)
 * @param userId - User identifier
 */
export function resetRateLimit(userId: string): void {
  rateLimitStore.delete(userId)
}

/**
 * Get all rate limit stats (useful for monitoring/debugging)
 */
export function getRateLimitStats(): {
  totalUsers: number
  totalRequests: number
  storeSize: number
} {
  let totalRequests = 0
  for (const entry of rateLimitStore.values()) {
    totalRequests += entry.count
  }
  
  return {
    totalUsers: rateLimitStore.size,
    totalRequests,
    storeSize: rateLimitStore.size
  }
}

