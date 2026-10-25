interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export const store = new Map<string, RateLimitEntry>();
const MAX_REQUESTS = 20;
const WINDOW_MS = 60_000; // 1 minute

export function rateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    const newEntry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(ip, newEntry);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}