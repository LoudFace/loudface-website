'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import {
  CONSENT_EVENT,
  type ConsentValue,
  getStoredConsent,
  hasGPCSignal,
  isTrackingAllowed,
  storeConsent,
} from '@/lib/consent';

const GTM_IDS = ['GTM-T53LKJXQ', 'GTM-PDCXVZX'];
const RB2B_KEY = '5NRP9H7R3PO1';
const INTERACTION_EVENTS = ['scroll', 'touchstart', 'mousemove', 'keydown'] as const;

// Module-level so a remount (route change) can't double-inject.
let trackersLoaded = false;

/**
 * Injects GTM (both containers) and the RB2B visitor-identification pixel.
 * Only ever called once tracking is allowed, so Google Consent Mode defaults
 * are signalled as granted before gtm.js evaluates. PostHog is not loaded
 * here — PostHogProvider owns it and reacts to the same consent event.
 */
function loadTrackers() {
  if (trackersLoaded || typeof window === 'undefined') return;
  // Re-check at fire time: an interaction listener armed minutes ago must not
  // inject anything if consent was withdrawn since (e.g. from another tab).
  if (!isTrackingAllowed()) return;
  trackersLoaded = true;

  const w = window as typeof window & { dataLayer?: unknown[]; reb2b?: { loaded: boolean } };

  // Google Tag Manager — deferred variant of the standard snippet.
  w.dataLayer = w.dataLayer || [];
  // GTM's consent API only understands a pushed `arguments` object (a plain
  // array is silently ignored), hence the classic function expression.
  const gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  } as (...args: unknown[]) => void;
  gtag('consent', 'default', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });
  const firstScript = document.getElementsByTagName('script')[0];
  GTM_IDS.forEach((id) => {
    w.dataLayer!.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const el = document.createElement('script');
    el.async = true;
    el.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
    firstScript.parentNode?.insertBefore(el, firstScript);
  });

  // RB2B — same guard as the official snippet (window.reb2b blocks re-init).
  if (!w.reb2b) {
    w.reb2b = { loaded: true };
    const el = document.createElement('script');
    el.async = true;
    el.src = `https://ddwl4m2hdecbv.cloudfront.net/b/${RB2B_KEY}/${RB2B_KEY}.js.gz`;
    firstScript.parentNode?.insertBefore(el, firstScript);
  }
}

/** Arm the perf deferral: trackers load on first interaction, not page load. */
function loadTrackersOnInteraction() {
  const load = () => loadTrackers();
  INTERACTION_EVENTS.forEach((e) =>
    window.addEventListener(e, load, { once: true, passive: true })
  );
}

interface ConsentManagerProps {
  /** Server-derived from the request's country header: EEA/UK/CH → true. */
  requiresConsent: boolean;
}

/**
 * Consent banner + consent-gated tracker bootstrap.
 *
 * - Opt-in regions (or unknown): banner shows until a choice is stored;
 *   nothing tracking-related loads before "Accept all".
 * - Opt-out regions: no banner; trackers load on first interaction unless
 *   a stored denial or a Global Privacy Control signal says otherwise.
 * - Listens for consent changes from anywhere (e.g. the /cookies preferences
 *   control) and starts trackers live on a grant.
 */
export function ConsentManager({ requiresConsent }: ConsentManagerProps) {
  const [choice, setChoice] = useState<ConsentValue | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setChoice(getStoredConsent());
    setMounted(true);

    if (isTrackingAllowed()) {
      loadTrackersOnInteraction();
    }

    const onConsentChange = (event: Event) => {
      const value = (event as CustomEvent<{ value: ConsentValue }>).detail?.value;
      setChoice(value ?? getStoredConsent());
      if (value === 'granted') loadTrackers();
    };
    window.addEventListener(CONSENT_EVENT, onConsentChange);

    // Cross-tab sync via the localStorage mirror (see storeConsent). A grant
    // elsewhere may start trackers here; a denial silences an already-running
    // PostHog and stops any armed loader from firing (loadTrackers re-checks).
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'lf_consent' || !event.newValue) return;
      const value = event.newValue as ConsentValue;
      setChoice(value);
      if (value === 'granted') {
        loadTrackers();
      } else {
        void import('@/lib/posthog-client').then(({ ensurePostHog, isPostHogRequested }) => {
          if (isPostHogRequested()) {
            void ensurePostHog().then((posthog) => posthog?.opt_out_capturing());
          }
        });
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(CONSENT_EVENT, onConsentChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const accept = useCallback(() => storeConsent('granted'), []);
  const decline = useCallback(() => storeConsent('denied'), []);

  // GPC visitors in opt-out regions get their signal honored silently;
  // in opt-in regions the banner still shows so they can grant if they want.
  const showBanner = mounted && requiresConsent && choice === null;
  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md z-50 rounded-2xl bg-surface-900 p-5 shadow-xl motion-safe:animate-fade-in"
    >
      <p className="text-sm text-surface-300 leading-relaxed">
        We use cookies for analytics and to see which companies visit this site
        (PostHog, Google Tag Manager, RB2B). Essential cookies stay on either way.
        Details in the{' '}
        <Link href="/cookies" className="text-white underline underline-offset-2 hover:text-surface-300 transition-colors">
          Cookie Policy
        </Link>
        {hasGPCSignal() ? ' — we also honor your browser’s Global Privacy Control signal.' : '.'}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={accept}>
          Accept all
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={decline}
          className="border border-white/20 text-white hover:bg-white/[0.08] hover:text-white"
        >
          Essential only
        </Button>
      </div>
    </div>
  );
}
