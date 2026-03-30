'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const INDUSTRIES = [
  'SaaS',
  'E-commerce',
  'Fintech',
  'Healthcare',
  'Education',
  'Marketing',
  'Real Estate',
  'Legal',
  'Technology',
  'Professional Services',
  'Other',
];

export function AuditForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          email: email.trim(),
          companyName: companyName.trim(),
          ...(industry && industry !== '' ? { industry } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong');
        return;
      }

      // Redirect to results page
      router.push(`/audit/${data.id}`);
    } catch {
      setStatus('error');
      setErrorMsg('Network error — please try again');
    }
  }

  const inputClass =
    'w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-3 text-white placeholder:text-surface-500 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Company Name */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-surface-300 mb-1.5">
          Company Name <span className="text-error">*</span>
        </label>
        <input
          id="companyName"
          type="text"
          required
          maxLength={100}
          placeholder="Acme Corp"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Website URL */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-surface-300 mb-1.5">
          Website URL <span className="text-error">*</span>
        </label>
        <input
          id="url"
          type="text"
          required
          placeholder="acme.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
          Email <span className="text-error">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="you@acme.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Industry (optional) */}
      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-surface-300 mb-1.5">
          Industry <span className="text-surface-500">(optional)</span>
        </label>
        <select
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className={`${inputClass} appearance-none`}
        >
          <option value="">Select your industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {/* Error message */}
      {status === 'error' && (
        <p className="text-sm text-error">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-lg bg-primary-600 px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Starting Audit...
          </span>
        ) : (
          'Run Free AI Audit'
        )}
      </button>

      <p className="text-2xs text-surface-500 text-center">
        Takes 1-3 minutes. We&apos;ll analyze your brand across ChatGPT, Claude, Gemini &amp; Perplexity.
      </p>
    </form>
  );
}
