'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function WebinarRegistrationForm() {
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const GCAL_URL =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=Why+Your+Website+Is+Invisible+in+AI+Search+%E2%80%94+LoudFace+Masterclass' +
    '&dates=20260709T150000Z/20260709T160000Z' +
    '&details=Live+masterclass+with+Arnel+Bukva+%28LoudFace%29+and+Natalie+Sangkagalo+%28Toku%29' +
    '&location=Online';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      company: (form.elements.namedItem('company') as HTMLInputElement).value.trim(),
      jobTitle: (form.elements.namedItem('jobTitle') as HTMLInputElement).value.trim(),
      linkedin: (form.elements.namedItem('linkedin') as HTMLInputElement).value.trim(),
      consent: (form.elements.namedItem('consent') as HTMLInputElement).checked,
    };

    try {
      const res = await fetch('/api/webinar-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Something went wrong. Please try again.');
      }

      // PostHog event
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('webinar_registered', {
          email: data.email,
          company: data.company,
          job_title: data.jobTitle,
          webinar: 'ai-search-visibility-july-2026',
        });
      }

      setState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mb-5 text-4xl">🎉</div>
        <h2 className="mb-3 text-2xl font-medium text-surface-900">You&apos;re in.</h2>
        <p className="mb-8 text-surface-600">
          Check your inbox for confirmation. See you Thursday, July 9 at 11:00 AM EST.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={GCAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-surface-200 bg-white px-5 py-3 text-sm font-semibold text-surface-800 hover:bg-surface-50"
          >
            Add to Google Calendar
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-primary-100 bg-white p-8 shadow-sm">
        <h2 className="mb-1 text-2xl font-medium text-surface-900">Save your seat</h2>
        <p className="mb-6 text-sm text-surface-500">Thursday, July 9 · 11:00 AM EST</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-surface-700">
              Name <span className="text-primary-600">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Jane Smith"
              className="w-full rounded-lg border border-surface-200 px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-surface-700">
              Work email <span className="text-primary-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="jane@company.com"
              className="w-full rounded-lg border border-surface-200 px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="company" className="mb-1.5 block text-sm font-semibold text-surface-700">
              Company name <span className="text-primary-600">*</span>
            </label>
            <input
              id="company"
              name="company"
              type="text"
              required
              placeholder="Acme Corp"
              className="w-full rounded-lg border border-surface-200 px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="jobTitle" className="mb-1.5 block text-sm font-semibold text-surface-700">
              Job title <span className="text-primary-600">*</span>
            </label>
            <input
              id="jobTitle"
              name="jobTitle"
              type="text"
              required
              placeholder="Head of Marketing"
              className="w-full rounded-lg border border-surface-200 px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="linkedin" className="mb-1.5 block text-sm font-semibold text-surface-700">
              LinkedIn profile{' '}
              <span className="font-normal text-surface-400 text-xs">(optional)</span>
            </label>
            <input
              id="linkedin"
              name="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/..."
              className="w-full rounded-lg border border-surface-200 px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex items-start gap-3 pt-1">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              defaultChecked
              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary-600"
            />
            <label htmlFor="consent" className="text-xs leading-relaxed text-surface-500">
              Send me the recording and occasional LoudFace updates. Unsubscribe anytime.
            </label>
          </div>

          {state === 'error' && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</p>
          )}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            fullWidth
            disabled={state === 'loading'}
          >
            {state === 'loading' ? 'Saving your seat…' : 'Save my seat'}
          </Button>

          <p className="text-center text-xs text-surface-400">No spam, ever.</p>
        </form>
      </div>
    </div>
  );
}
