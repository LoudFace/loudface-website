'use client';

import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui';
import {
  CONSENT_EVENT,
  type ConsentValue,
  getStoredConsent,
  hasGPCSignal,
  regionRequiresConsent,
  storeConsent,
} from '@/lib/consent';
import { ensurePostHog, isPostHogRequested } from '@/lib/posthog-client';

/**
 * Cookie names our trackers set — cleared best-effort when someone opts out.
 * `_reb2b`, `_ga`, `_gid` and `_gcl` belong to RB2B and Google tags, removed
 * from the site on 2026-11-12; returning visitors can still hold them.
 */
const TRACKER_COOKIE_PREFIXES = ['ph_', '_fbp', '_reb2b', '_ga', '_gid', '_gcl'];

function clearTrackerCookies() {
  const hostname = window.location.hostname;
  const domains = ['', hostname, `.${hostname}`, `.${hostname.split('.').slice(-2).join('.')}`];
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0]?.trim();
    if (!name || !TRACKER_COOKIE_PREFIXES.some((p) => name.startsWith(p))) return;
    domains.forEach((domain) => {
      const domainPart = domain ? `; Domain=${domain}` : '';
      document.cookie = `${name}=; Max-Age=0; Path=/${domainPart}`;
    });
  });
}

/**
 * Embedded on /cookies — shows the visitor's current analytics/tracking
 * state and lets them change it any time. This is the site's standing
 * opt-out mechanism (also the way US visitors, who see no banner, opt out).
 *
 * Opting out after trackers already loaded clears their cookies and reloads
 * the page — loaded scripts can't be unloaded, a fresh page can.
 */
function subscribeToConsent(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

export function CookiePreferences() {
  // 'loading' on the server and during hydration: the cookie is browser-only.
  const stored = useSyncExternalStore<ConsentValue | 'unset' | 'loading'>(
    subscribeToConsent,
    () => getStoredConsent() ?? 'unset',
    () => 'loading',
  );

  const enable = () => storeConsent('granted');
  const disable = async () => {
    storeConsent('denied');
    // Silence already-running SDKs BEFORE the reload, so unload-time beacons
    // (PostHog $pageleave) don't fire one last event after
    // the visitor said no.
    try {
      if (isPostHogRequested()) {
        const posthog = await ensurePostHog();
        posthog?.opt_out_capturing();
      }
    } catch {
      // Best-effort — the reload below is the hard stop either way.
    }
    clearTrackerCookies();
    window.location.reload();
  };

  if (stored === 'loading') {
    return (
      <div className="rounded-xl border border-surface-200 bg-white p-6" aria-hidden="true">
        <p className="text-sm text-surface-500">Loading your current setting…</p>
      </div>
    );
  }

  const choice = stored === 'unset' ? null : stored;
  const gpc = hasGPCSignal();
  const active = choice === 'granted' || (choice === null && !gpc && !regionRequiresConsent());
  const statusDetail =
    choice !== null
      ? 'your saved choice'
      : gpc
        ? 'your browser sends a Global Privacy Control signal, which we honor'
        : regionRequiresConsent()
          ? 'no choice made yet — nothing loads until you allow it'
          : 'the default for your region — you can turn it off here';

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6">
      <h3 className="text-lg font-medium text-surface-900">Your cookie settings</h3>
      <p className="mt-2 text-surface-600">
        Analytics &amp; ad measurement:{' '}
        <strong className="text-surface-900">{active ? 'on' : 'off'}</strong>{' '}
        <span className="text-surface-500">({statusDetail})</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {active ? (
          <Button variant="outline" size="sm" onClick={disable}>
            Turn off analytics &amp; tracking
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={enable}>
            Allow analytics &amp; tracking
          </Button>
        )}
      </div>
      <p className="mt-3 text-sm text-surface-500">
        Essential cookies (like the one that remembers this setting) stay on either way.
      </p>
    </div>
  );
}
