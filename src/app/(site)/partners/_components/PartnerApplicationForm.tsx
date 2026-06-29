'use client';

import { useState, useRef, useSyncExternalStore, type FormEvent } from 'react';

const subscribeHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

/**
 * PartnerApplicationForm
 *
 * Fields are aligned 1:1 with the Notion "LoudFace Partner Applications" DB
 * (database_id c597d4c9-817a-458a-b5b0-92dc4c9db147). If you change a field
 * here, update the Notion property mapping in `/api/partner-apply/route.ts`
 * AND in the Notion DB schema — or submission will fail.
 *
 * PostHog events fired here:
 * - `partners_form_started`  — once, on first field focus
 * - `partner_application_submitted` — on successful POST
 */

// Notion: Industry (multi_select). Order matches the DB option order.
const INDUSTRIES = ['B2B Product', 'D2C'] as const;

// Notion: Avg ACV of Clients (select)
const ACV_BUCKETS = [
  '$100 - $1K',
  '$1K - $5K',
  '$5K - $10K',
  '$10K - $50K',
  '$50K+',
] as const;

// Notion: Open to Social Media Promotion? / Open to Speaking at Webinars? (select)
const YES_NO_MAYBE = ['Yes', 'No', 'Maybe'] as const;

export function PartnerApplicationForm() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState<string[]>([]);
  const [acv, setAcv] = useState('');
  const [socialPromo, setSocialPromo] = useState('');
  const [webinar, setWebinar] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Fire `partners_form_started` exactly once per page load, on first field focus.
  const formStartedRef = useRef(false);
  function handleFirstFocus() {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    void import('posthog-js').then(({ default: posthog }) => {
      if (!posthog.__loaded) return;
      posthog.capture('partners_form_started');
    });
  }

  function toggleIndustry(value: string) {
    setIndustry((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hydrated || status === 'loading') return;

    // Client-side guard: at least one industry must be selected.
    if (industry.length === 0) {
      setStatus('error');
      setErrorMsg('Please select at least one industry.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/partner-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: trimmedEmail,
          linkedin: linkedin.trim(),
          website: website.trim(),
          industry,
          acv,
          socialPromo: socialPromo || null,
          webinar: webinar || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus('error');
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        return;
      }

      // PostHog: track partner application submission.
      // Dynamic import matches the lazy-load pattern in PostHogProvider —
      // keeps posthog-js out of the form's initial bundle.
      const emailDomain = trimmedEmail.split('@')[1] ?? '';
      void import('posthog-js').then(({ default: posthog }) => {
        if (!posthog.__loaded) return;
        posthog.identify(trimmedEmail);
        posthog.capture('partner_application_submitted', {
          email_domain: emailDomain,
          industries: industry,
          acv_bucket: acv,
          has_website: website.trim().length > 0,
          open_to_social_promo: socialPromo || 'unanswered',
          open_to_webinars: webinar || 'unanswered',
        });
      });

      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Network error — please try again.');
    }
  }

  const inputClass =
    'w-full rounded-lg border border-surface-200 bg-white px-4 py-3 text-surface-900 placeholder:text-surface-400 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 transition-colors text-sm';

  const labelClass = 'block text-sm font-medium text-surface-900 mb-1.5';
  const helperClass = 'mt-1 text-xs text-surface-500';
  const requiredMark = <span className="text-error">*</span>;

  if (status === 'success') {
    return (
      <div className="rounded-lg bg-success-light text-success-dark p-6 text-center">
        <h3 className="text-lg font-medium">Application received.</h3>
        <p className="mt-2 text-sm">
          We review every application personally. You&apos;ll hear from us
          within 48 hours at <strong>{email.trim()}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onFocus={handleFirstFocus} className="space-y-5" noValidate>
      <div>
        <label htmlFor="partner-name" className={labelClass}>
          Full Name {requiredMark}
        </label>
        <input
          id="partner-name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="partner-email" className={labelClass}>
          Email Address {requiredMark}
        </label>
        <input
          id="partner-email"
          type="email"
          required
          maxLength={256}
          autoComplete="email"
          placeholder="you@yourpractice.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="partner-linkedin" className={labelClass}>
          LinkedIn Profile URL {requiredMark}
        </label>
        <input
          id="partner-linkedin"
          type="url"
          required
          maxLength={256}
          placeholder="https://www.linkedin.com/in/yourname"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          className={inputClass}
        />
        <p className={helperClass}>
          Your personal LinkedIn profile (e.g. linkedin.com/in/yourname).
        </p>
      </div>

      <div>
        <label htmlFor="partner-website" className={labelClass}>
          Website or Portfolio <span className="text-surface-400">(optional)</span>
        </label>
        <input
          id="partner-website"
          type="url"
          maxLength={256}
          placeholder="https://"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className={inputClass}
        />
        <p className={helperClass}>
          Any website, portfolio, newsletter, or content page you&apos;d like
          us to review.
        </p>
      </div>

      <fieldset>
        <legend className={labelClass}>
          Industry {requiredMark}
        </legend>
        <p className={helperClass}>Select all that apply.</p>
        <div className="mt-2 space-y-2">
          {INDUSTRIES.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer"
            >
              <input
                type="checkbox"
                name="industry"
                value={opt}
                checked={industry.includes(opt)}
                onChange={() => toggleIndustry(opt)}
                className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>
          What&apos;s the average ACV of the clients you work with? {requiredMark}
        </legend>
        <div className="mt-2 space-y-2">
          {ACV_BUCKETS.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer"
            >
              <input
                type="radio"
                name="acv"
                required
                value={opt}
                checked={acv === opt}
                onChange={(e) => setAcv(e.target.value)}
                className="w-4 h-4 border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>
          Are you open to promoting LoudFace on your social channels?{' '}
          <span className="text-surface-400">(optional)</span>
        </legend>
        <p className={helperClass}>
          This includes sharing posts, creating content, or recommending
          LoudFace to your audience.
        </p>
        <div className="mt-2 flex flex-wrap gap-4">
          {YES_NO_MAYBE.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer"
            >
              <input
                type="radio"
                name="socialPromo"
                value={opt}
                checked={socialPromo === opt}
                onChange={(e) => setSocialPromo(e.target.value)}
                className="w-4 h-4 border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>
          Are you open to speaking at our webinar series?{' '}
          <span className="text-surface-400">(optional)</span>
        </legend>
        <p className={helperClass}>
          We run invite-only roundtables and webinars for B2B growth leaders.
          We&apos;d love to feature the right partners as guest speakers.
        </p>
        <div className="mt-2 flex flex-wrap gap-4">
          {YES_NO_MAYBE.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer"
            >
              <input
                type="radio"
                name="webinar"
                value={opt}
                checked={webinar === opt}
                onChange={(e) => setWebinar(e.target.value)}
                className="w-4 h-4 border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      {status === 'error' && (
        <p className="text-sm text-error" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!hydrated || status === 'loading'}
        className="w-full rounded-full bg-primary-600 px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <span className="inline-flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Submitting…
          </span>
        ) : (
          <span className="inline-flex items-center justify-center gap-2">
            Apply
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        )}
      </button>

      <p className="text-xs text-surface-500 text-center">
        By submitting, you agree to our{' '}
        <a href="/privacy" className="underline underline-offset-2 hover:text-surface-700">
          Privacy Policy
        </a>
        . We review every application personally and reply within 48 hours.
      </p>
    </form>
  );
}
