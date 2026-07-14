'use client';

import { useEffect, useState } from 'react';
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

/** Cookie names our trackers set — cleared best-effort when someone opts out. */
const TRACKER_COOKIE_PREFIXES = ['ph_', '_reb2b', '_ga', '_gid', '_gcl'];

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
export function CookiePreferences() {
  const [choice, setChoice] = useState<ConsentValue | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setChoice(getStoredConsent());
    setMounted(true);
    const onChange = (event: Event) => {
      const value = (event as CustomEvent<{ value: ConsentValue }>).detail?.value;
      setChoice(value ?? getStoredConsent());
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  const enable = () => storeConsent('granted');
  const disable = async () => {
    storeConsent('denied');
    // Silence already-running SDKs BEFORE the reload, so unload-time beacons
    // (PostHog $pageleave, GA tag flushes) don't fire one last event after
    // the visitor said no.
    try {
      if (isPostHogRequested()) {
        const posthog = await ensurePostHog();
        posthog?.opt_out_capturing();
      }
      const w = window as typeof window & { dataLayer?: unknown[] };
      if (w.dataLayer) {
        // Arguments object required — see ConsentManager.loadTrackers.
        const gtag = function () {
          // eslint-disable-next-line prefer-rest-params
          w.dataLayer!.push(arguments);
        } as (...args: unknown[]) => void;
        gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
        });
      }
    } catch {
      // Best-effort — the reload below is the hard stop either way.
    }
    clearTrackerCookies();
    window.location.reload();
  };

  if (!mounted) {
    return (
      <div className="rounded-xl border border-surface-200 bg-white p-6" aria-hidden="true">
        <p className="text-sm text-surface-500">Loading your current setting…</p>
      </div>
    );
  }

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
        Analytics &amp; visitor identification:{' '}
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
