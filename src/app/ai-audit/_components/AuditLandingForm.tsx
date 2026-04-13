'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function AuditLandingForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [persona, setPersona] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // Derive companyName from domain for the audit API
    let companyName = url.trim();
    try {
      const withProto = /^https?:\/\//i.test(companyName)
        ? companyName
        : `https://${companyName}`;
      const hostname = new URL(withProto).hostname.replace(/^www\./, '');
      companyName = hostname.split('.')[0];
      // Capitalize first letter
      companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    } catch {
      // Fall back to raw input
    }

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          email: email.trim(),
          companyName,
          // Extra fields for follow-up context
          contactName: name.trim(),
          competitors: competitors.trim(),
          buyerPersona: persona.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong');
        return;
      }

      router.push(`/audit/${data.id}`);
    } catch {
      setStatus('error');
      setErrorMsg('Network error — please try again');
    }
  }

  const inputClass =
    'w-full rounded-lg border border-surface-200 bg-white px-4 py-3 text-surface-900 placeholder:text-surface-400 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 transition-colors text-sm';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="audit-url"
          className="block text-sm font-medium text-surface-900 mb-1.5"
        >
          Your website URL <span className="text-error">*</span>
        </label>
        <input
          id="audit-url"
          type="text"
          required
          placeholder="acme.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="audit-name"
          className="block text-sm font-medium text-surface-900 mb-1.5"
        >
          Your name <span className="text-error">*</span>
        </label>
        <input
          id="audit-name"
          type="text"
          required
          maxLength={100}
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="audit-email"
          className="block text-sm font-medium text-surface-900 mb-1.5"
        >
          Work email <span className="text-error">*</span>
        </label>
        <input
          id="audit-email"
          type="email"
          required
          placeholder="jane@acme.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="audit-competitors"
          className="block text-sm font-medium text-surface-900 mb-1.5"
        >
          Your top 3 competitors <span className="text-error">*</span>
        </label>
        <input
          id="audit-competitors"
          type="text"
          required
          maxLength={200}
          placeholder="competitor1.com, competitor2.com, competitor3.com"
          value={competitors}
          onChange={(e) => setCompetitors(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="audit-persona"
          className="block text-sm font-medium text-surface-900 mb-1.5"
        >
          Your primary buyer persona <span className="text-error">*</span>
        </label>
        <input
          id="audit-persona"
          type="text"
          required
          maxLength={200}
          placeholder='e.g. "VP Engineering at B2B SaaS"'
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          className={inputClass}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-error">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-lg bg-primary-600 px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
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
            Starting Audit...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            Run My Audit
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
    </form>
  );
}
