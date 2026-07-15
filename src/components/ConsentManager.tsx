'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
/** Ties the mobile expand toggle to the detail copy it reveals. */
const CONSENT_DETAIL_ID = 'lf-consent-detail';

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
 *
 * Layout note (below 640px): the bar is a compact single-line strip pinned flush
 * to the bottom edge, with the detail copy behind a toggle. It has to stay short
 * — every v3 hero puts its primary CTA in the bottom band, and a tall bar there
 * turns the site's main conversion path into a dead tap on a first visit. Both
 * consent choices stay visible and one-tap in the collapsed state; only the
 * explanatory copy collapses. See the bottom-band contract below and the
 * matching rules in globals.css.
 */
export function ConsentManager({ requiresConsent }: ConsentManagerProps) {
  const [choice, setChoice] = useState<ConsentValue | null>(null);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

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

  /**
   * Fixed-bottom-chrome contract.
   *
   * While the bar is up it owns the bottom band of the viewport, so it publishes
   * that fact on <html>:
   *   data-lf-consent-open="1"  — the bar is up
   *   --lf-consent-h: <px>      — how much of the bottom band it occupies
   *
   * Other fixed bottom-anchored chrome reacts via globals.css (search
   * "consent bottom-band contract"): decorative chrome yields, conversion
   * chrome lifts above the bar. Before this existed, the Webflow badge and the
   * banner were both z-50 and their stacking was decided by DOM order alone —
   * nothing declared who owned the space, so they silently overlapped.
   */
  useEffect(() => {
    const root = document.documentElement;
    const el = bannerRef.current;
    if (!showBanner || !el) return;

    root.setAttribute('data-lf-consent-open', '1');
    const publish = () =>
      root.style.setProperty('--lf-consent-h', `${Math.round(el.getBoundingClientRect().height)}px`);
    publish();
    // Height changes when the detail copy expands or the bar reflows on rotate.
    const observer = new ResizeObserver(publish);
    observer.observe(el);

    return () => {
      observer.disconnect();
      root.removeAttribute('data-lf-consent-open');
      root.style.removeProperty('--lf-consent-h');
    };
  }, [showBanner]);

  if (!showBanner) return null;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Cookie consent"
      className="fixed z-50 bottom-0 left-0 right-0 border-t border-white/10 bg-surface-900 px-3 py-2.5 shadow-xl sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md sm:rounded-2xl sm:border-0 sm:p-5 motion-safe:animate-fade-in"
    >
      {/* Detail copy. Always present on >=sm; below sm it is the second layer of
          a layered notice — the collapsed bar names the purpose, this carries
          the vendors and the policy link. */}
      <p
        id={CONSENT_DETAIL_ID}
        className={`text-sm text-surface-300 leading-relaxed sm:block ${
          expanded ? 'mb-3 sm:mb-0' : 'hidden'
        }`}
      >
        We use cookies for analytics and to see which companies visit this site
        (PostHog, Google Tag Manager, RB2B). Essential cookies stay on either way.
        Details in the{' '}
        <Link href="/cookies" className="text-white underline underline-offset-2 hover:text-surface-300 transition-colors">
          Cookie Policy
        </Link>
        {hasGPCSignal() ? ' — we also honor your browser’s Global Privacy Control signal.' : '.'}
      </p>
      <div className="flex items-center gap-2 sm:mt-4 sm:flex-wrap sm:gap-3">
        {/* Below sm only: names the purpose and reveals the detail copy above.
            Keeps the collapsed bar to one line without hiding what it is for. */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={CONSENT_DETAIL_ID}
          className="sm:hidden flex min-h-11 min-w-0 flex-1 items-center gap-1 text-left text-2xs text-surface-300 hover:text-white transition-colors"
        >
          <span className="truncate">Cookies &amp; analytics</span>
          <svg
            className={`w-3 h-3 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />
          </svg>
        </button>
        {/* min-h-11 = the 44px house tap-target floor, applied locally: the
            global Button `sm` variant is 38px and is used broadly elsewhere. */}
        <Button
          variant="secondary"
          size="sm"
          onClick={accept}
          className="min-h-11 shrink-0 max-sm:px-3 max-sm:text-2xs"
        >
          Accept all
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={decline}
          className="min-h-11 shrink-0 max-sm:px-3 max-sm:text-2xs border border-white/20 text-white hover:bg-white/[0.08] hover:text-white"
        >
          Essential only
        </Button>
      </div>
    </div>
  );
}
