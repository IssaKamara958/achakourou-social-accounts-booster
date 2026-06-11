const TODAY = () => new Date().toISOString().split("T")[0];

export const LIMITS = {
  ai: 20,
  posts: 10,
  seo: 5,
} as const;

export type QuotaKey = keyof typeof LIMITS;

export function getQuota(key: QuotaKey): { used: number; remaining: number; limit: number } {
  const today = TODAY();
  try {
    const raw = localStorage.getItem(`quota_${key}_${today}`);
    const used = raw ? parseInt(raw, 10) : 0;
    const limit = LIMITS[key];
    return { used, remaining: Math.max(0, limit - used), limit };
  } catch {
    return { used: 0, remaining: LIMITS[key], limit: LIMITS[key] };
  }
}

export function incrementQuota(key: QuotaKey): boolean {
  const { used, limit } = getQuota(key);
  if (used >= limit) return false;
  try {
    localStorage.setItem(`quota_${key}_${TODAY()}`, String(used + 1));
    return true;
  } catch {
    return true;
  }
}

export function canUse(key: QuotaKey): boolean {
  return getQuota(key).remaining > 0;
}
