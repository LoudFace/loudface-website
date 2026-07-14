/**
 * Cookie-consent state — single source of truth for whether non-essential
 * tracking (PostHog, GTM, RB2B) may run.
 *
 * Model:
 * - EEA/UK/CH visitors: opt-in. Nothing loads until they accept the banner.
 * - Everywhere else: opt-out. Tracking loads by default (US disclosure
 *   standard), but a stored "denied" choice or a Global Privacy Control
 *   signal is honored.
 * - Unknown region (no geo header, e.g. local dev): treated as opt-in.
 *
 * The region verdict is computed server-side in the route-group layouts
 * (cf-ipcountry / x-vercel-ip-country) and exposed to client code as a
 * `data-lf-cr` attribute ("1" = consent required, "0" = not required).
 * The choice itself lives in a first-party cookie so it survives reloads
 * and is shared by every reader (banner, PostHog loader, prefs control).
 */

export type ConsentValue = 'granted' | 'denied';

export const CONSENT_COOKIE = 'lf_consent';
/** Fired on window whenever the stored choice changes. detail: { value } */
export const CONSENT_EVENT = 'lf-consent-change';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 12 months, then we re-ask

/** EEA + UK + Switzerland — where opt-in consent applies. */
const CONSENT_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
]);

/** Server-safe. Unknown/missing country → true (block until told otherwise). */
export function countryRequiresConsent(country: string | null | undefined): boolean {
  if (!country || country.length !== 2) return true;
  const code = country.toUpperCase();
  // Cloudflare's special values: XX = unknown location, T1 = Tor network.
  // Either could be an EEA visitor, so both fail closed.
  if (code === 'XX' || code === 'T1') return true;
  return CONSENT_COUNTRIES.has(code);
}

export function getStoredConsent(): ConsentValue | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=(granted|denied)`));
  return match ? (match[1] as ConsentValue) : null;
}

export function storeConsent(value: ConsentValue): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  // localStorage mirror exists only to make other open tabs hear about the
  // change ("storage" events fire cross-tab; cookie writes don't). The cookie
  // stays the source of truth.
  try {
    window.localStorage.setItem(CONSENT_COOKIE, value);
  } catch {
    // Storage can be unavailable (private mode) — cross-tab sync degrades, that's all.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { value } }));
}

/** Global Privacy Control — a browser-level "don't sell/share" signal. */
export function hasGPCSignal(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

/** True when the visitor's region defaults to opt-in consent ("1") — read
 *  from the data-lf-cr attribute the layouts render. Missing attribute
 *  (route group without the flag) → true, the safe default. */
export function regionRequiresConsent(): boolean {
  if (typeof document === 'undefined') return true;
  return document.querySelector('[data-lf-cr]')?.getAttribute('data-lf-cr') !== '0';
}

/**
 * The one question every tracker asks before loading.
 * Explicit choice wins; otherwise GPC blocks; otherwise the region default.
 */
export function isTrackingAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = getStoredConsent();
  if (stored) return stored === 'granted';
  if (hasGPCSignal()) return false;
  return !regionRequiresConsent();
}
