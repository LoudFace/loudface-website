/**
 * The /apply application (2026-10-31): the revenue bands and the answer checks, shared by the card in the browser and
 * POST /api/apply on the server. Arnel's rule: under $100K a month is turned away, politely, with no call and no
 * Lead event. The band labels people read live in apply.json (`card.revenue.options`, same order); the ids and the
 * rule stay here, because a value used in a comparison must never come from a content file (inline editor rule 6).
 * Tested by `npm run test:apply`.
 */

export const REVENUE_BANDS = [
  { id: 'under_50k', qualifies: false },
  { id: '50k_100k', qualifies: false },
  { id: '100k_250k', qualifies: true },
  { id: '250k_500k', qualifies: true },
  { id: '500k_1m', qualifies: true },
  { id: '1m_plus', qualifies: true },
] as const;

export type RevenueBandId = (typeof REVENUE_BANDS)[number]['id'];

export function isRevenueBand(value: unknown): value is RevenueBandId {
  return typeof value === 'string' && REVENUE_BANDS.some((b) => b.id === value);
}

/** True for $100K a month and up. An unknown band never qualifies. */
export function qualifies(band: unknown): boolean {
  return REVENUE_BANDS.some((b) => b.id === band && b.qualifies);
}

/** A website as typed ("yourcompany.com", "https://www.yourcompany.com/about") → "https://yourcompany.com/about", or null. */
export function normalizeWebsite(value: string): string | null {
  const raw = value.trim();
  if (!raw || raw.length > 200 || /\s/.test(raw)) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (!/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(host)) return null;
  const path = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
  return `https://${host}${path}`;
}

export function isValidName(value: string): boolean {
  const name = value.trim();
  return name.length >= 2 && name.length <= 100 && /\p{L}/u.test(name);
}

export function isValidEmail(value: string): boolean {
  const email = value.trim();
  return email.length <= 254 && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email);
}

/** A phone number with its country code: a leading +, then 8 to 15 digits (E.164), spaces, dashes and brackets allowed. */
export function normalizePhone(value: string): string | null {
  const raw = value.trim();
  if (!raw.startsWith('+')) return null;
  if (!/^\+[\d\s().-]+$/.test(raw)) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15 || digits.startsWith('0')) return null;
  return `+${digits}`;
}

/** The browser's event id for the Lead, shared with the Pixel so Meta counts one Lead, not two. */
export function isValidEventId(value: unknown): value is string {
  return typeof value === 'string' && /^apply_[a-z0-9-]{8,64}$/i.test(value);
}

export type ApplyAnswers = {
  revenue: RevenueBandId;
  website: string;
  name: string;
  email: string;
  phone: string;
};

export type CheckedApplication =
  | { ok: true; answers: ApplyAnswers }
  | { ok: false; reason: 'revenue' | 'not_qualified' | 'website' | 'name' | 'email' | 'phone' };

/** The server's check of a submitted application. Order matters: an unqualified band stops before anything else. */
export function checkApplication(input: Partial<Record<keyof ApplyAnswers, unknown>>): CheckedApplication {
  if (!isRevenueBand(input.revenue)) return { ok: false, reason: 'revenue' };
  if (!qualifies(input.revenue)) return { ok: false, reason: 'not_qualified' };
  const website = typeof input.website === 'string' ? normalizeWebsite(input.website) : null;
  if (!website) return { ok: false, reason: 'website' };
  const name = typeof input.name === 'string' && isValidName(input.name) ? input.name.trim() : null;
  if (!name) return { ok: false, reason: 'name' };
  const email = typeof input.email === 'string' && isValidEmail(input.email) ? input.email.trim().toLowerCase() : null;
  if (!email) return { ok: false, reason: 'email' };
  const phone = typeof input.phone === 'string' ? normalizePhone(input.phone) : null;
  if (!phone) return { ok: false, reason: 'phone' };
  return { ok: true, answers: { revenue: input.revenue, website, name, email, phone } };
}
