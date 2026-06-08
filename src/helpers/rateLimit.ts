// In-memory rate limiting (sufficient for single portfolio)
// For production: use Redis or upstash.com (free tier)

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute per IP

export function rateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const key = ip || "unknown";

  if (!store[key]) {
    store[key] = { count: 0, resetAt: now + WINDOW_MS };
  }

  const entry = store[key];

  // Reset window if expired
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }

  // Cleanup old entries every 10 minutes
  if (Math.random() < 0.01) {
    for (const k in store) {
      if (store[k].resetAt < now) delete store[k];
    }
  }

  entry.count++;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);

  return {
    success: entry.count <= MAX_REQUESTS,
    remaining,
  };
}
