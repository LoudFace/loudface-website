'use client';

import { useState, useRef, useMemo, useSyncExternalStore, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { ensurePostHog } from '@/lib/posthog-client';
import { identifyAndCapture } from '@/lib/posthog-form-tracking';

const subscribeHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

/**
 * CareersApplicationForm
 *
 * Fields are aligned 1:1 with the Notion "Candidates" DB
 * (database_id c1a5d01d-d3c4-46e5-821f-c397adc8bfda). If you change a field
 * here, update the Notion property mapping in `/api/careers-apply/route.ts`
 * AND in the Notion DB schema — or that answer is silently dropped.
 *
 * Self-tagging links: this page reads `?role=` and `?src=` so each job posting
 * can carry its own link and land pre-tagged in Notion. Examples:
 *   /careers/apply?role=designer&src=behance
 *   /careers/apply?role=developer&src=dribbble
 * `role` preselects the dropdown (the applicant can still change it).
 * `src` is never shown — it only sets Notion's Source property.
 *
 * PostHog events fired here:
 * - `careers_form_started`      — once, on first field focus
 * - `careers_application_submitted` — on successful POST
 */

/** Notion: Role (select). Keys are the URL values used in ?role=. */
const ROLES = {
  designer: 'Designer',
  developer: 'Developer',
  copywriter: 'Copywriter',
  'project-manager': 'Project Manager',
  seo: 'Organic Search Strategist',
} as const;

/** Notion: Source (select). Keys are the URL values used in ?src=. */
const SOURCES = {
  contra: 'Contra',
  upwork: 'Upwork',
  linkedin: 'LinkedIn',
  dribbble: 'Dribbble',
  behance: 'Behance',
  referral: 'Referral',
  other: 'Other',
} as const;

/** Notion: How heard (multi_select). */
const HEARD_OPTIONS = [
  'LinkedIn',
  'Dribbble',
  'Behance',
  'Contra',
  'Instagram',
  'X (Twitter)',
  'Referral',
  'Our website',
  'Other',
] as const;

type LongField = 'aboutYou' | 'proofOfWork' | 'workLinks' | 'builtWithAI';
type UrlField = 'portfolio' | 'loom';

interface Question {
  key: LongField | UrlField;
  label: string;
  helper: string;
  required: boolean;
}

/**
 * What each role is actually asked. This is the whole point of owning the form:
 * a designer is never asked for Webflow read-only links, and a strategist is
 * never asked for a Dribbble portfolio.
 */
const ROLE_QUESTIONS: Record<string, Question[]> = {
  Designer: [
    { key: 'portfolio', label: 'Portfolio', helper: 'The work you want to be judged on.', required: true },
    { key: 'loom', label: 'Short intro video', helper: 'A 2-minute Loom. We would rather meet you than read about you.', required: true },
    { key: 'workLinks', label: 'Two or three pieces worth opening first', helper: 'Paste the links, and one line each on what you did.', required: true },
    { key: 'aboutYou', label: 'What kind of design do you want to be doing in a year?', helper: '', required: false },
  ],
  Developer: [
    { key: 'workLinks', label: 'Three or more Webflow read-only links', helper: 'Recent builds. Read-only links, not just live URLs.', required: true },
    { key: 'portfolio', label: 'Portfolio or website', helper: '', required: false },
    { key: 'loom', label: 'Short intro video', helper: 'A 2-minute Loom introducing yourself.', required: true },
    { key: 'builtWithAI', label: 'Something you built with AI tools', helper: 'A workflow, script, or internal tool. Link it or describe it.', required: false },
  ],
  Copywriter: [
    { key: 'portfolio', label: 'Portfolio', helper: 'Published writing we can read.', required: true },
    { key: 'workLinks', label: 'Two pieces you are proud of', helper: 'Links, and one line each on why.', required: true },
    { key: 'aboutYou', label: 'Tell us about you', helper: '', required: true },
  ],
  'Project Manager': [
    { key: 'loom', label: 'Short intro video', helper: 'A 2-minute Loom. Be yourself.', required: true },
    { key: 'proofOfWork', label: 'A project that was stalling, and how you pushed it through', helper: 'What was blocking it, and what you actually did.', required: true },
    { key: 'aboutYou', label: 'Tell us about you', helper: '', required: false },
  ],
  'Organic Search Strategist': [
    { key: 'proofOfWork', label: 'Walk us through one SEO or AEO project you led', helper: 'The starting point, what you did, and the result — with numbers.', required: true },
    { key: 'builtWithAI', label: 'Something you built with AI tools', helper: 'A workflow, script, internal tool, or content system.', required: true },
    { key: 'workLinks', label: 'Proof of work', helper: 'Case studies, repos, public content. NDAs are fine — anonymise.', required: false },
  ],
};

const LONG_FIELDS: LongField[] = ['aboutYou', 'proofOfWork', 'workLinks', 'builtWithAI'];

export function CareersApplicationForm() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  );

  const searchParams = useSearchParams();
  const presetRole = ROLES[(searchParams.get('role') ?? '').toLowerCase() as keyof typeof ROLES] ?? '';
  const source = SOURCES[(searchParams.get('src') ?? '').toLowerCase() as keyof typeof SOURCES] ?? 'Inbound form';

  const [role, setRole] = useState<string>(presetRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [heard, setHeard] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const questions = role ? (ROLE_QUESTIONS[role] ?? []) : [];

  // Time-on-page guard: anything submitted in under 3 seconds is a bot.
  const mountedAt = useMemo(() => Date.now(), []);

  const formStartedRef = useRef(false);
  function handleFirstFocus() {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    void ensurePostHog().then((posthog) => {
      posthog?.capture('careers_form_started', { role: role || 'unset', source });
    });
  }

  function setAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleHeard(value: string) {
    setHeard((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hydrated || status === 'loading') return;

    if (!role) {
      setStatus('error');
      setErrorMsg('Please choose the role you are applying for.');
      return;
    }

    const missing = questions.find((q) => q.required && !(answers[q.key] ?? '').trim());
    if (missing) {
      setStatus('error');
      setErrorMsg(`Please fill in: ${missing.label}.`);
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    const parsedSalary = Number.parseInt(salary.replace(/[^0-9]/g, ''), 10);

    try {
      const res = await fetch('/api/careers-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail,
          role,
          linkedin: linkedin.trim(),
          location: location.trim(),
          salary: Number.isFinite(parsedSalary) ? parsedSalary : null,
          portfolio: (answers.portfolio ?? '').trim(),
          loom: (answers.loom ?? '').trim(),
          aboutYou: (answers.aboutYou ?? '').trim(),
          proofOfWork: (answers.proofOfWork ?? '').trim(),
          workLinks: (answers.workLinks ?? '').trim(),
          builtWithAI: (answers.builtWithAI ?? '').trim(),
          heard,
          source,
          company,
          elapsedMs: Date.now() - mountedAt,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus('error');
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        return;
      }

      identifyAndCapture(
        trimmedEmail,
        { email: trimmedEmail, name: name.trim() },
        'careers_application_submitted',
        {
          role,
          source,
          email_domain: trimmedEmail.split('@')[1] ?? '',
          has_salary: Number.isFinite(parsedSalary),
          heard_channels: heard,
        },
      );

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
        <h2 className="text-lg font-medium">Application received.</h2>
        <p className="mt-2 text-sm">
          A person reads every application. If it is a fit, you&apos;ll hear from us
          at <strong>{email.trim()}</strong>. If you don&apos;t hear back, it wasn&apos;t
          the right role this time — please do apply again for another one.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onFocus={handleFirstFocus} className="space-y-5" noValidate>
      <div>
        <label htmlFor="careers-role" className={labelClass}>
          Role you&apos;re applying for {requiredMark}
        </label>
        <select
          id="careers-role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={inputClass}
        >
          <option value="">Choose a role…</option>
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <p className={helperClass}>The questions below change with the role.</p>
      </div>

      <div>
        <label htmlFor="careers-name" className={labelClass}>
          Full name {requiredMark}
        </label>
        <input
          id="careers-name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="careers-email" className={labelClass}>
          Email {requiredMark}
        </label>
        <input
          id="careers-email"
          type="email"
          required
          maxLength={256}
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="careers-linkedin" className={labelClass}>
          LinkedIn
        </label>
        <input
          id="careers-linkedin"
          type="url"
          maxLength={256}
          placeholder="https://www.linkedin.com/in/yourname"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="careers-location" className={labelClass}>
          Where are you based?
        </label>
        <input
          id="careers-location"
          type="text"
          maxLength={120}
          placeholder="City, country"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClass}
        />
        <p className={helperClass}>We&apos;re fully remote. We just need to know your hours.</p>
      </div>

      {/* Role-specific questions. */}
      {questions.map((q) => (
        <div key={q.key}>
          <label htmlFor={`careers-${q.key}`} className={labelClass}>
            {q.label} {q.required ? requiredMark : <span className="text-surface-400">(optional)</span>}
          </label>
          {LONG_FIELDS.includes(q.key as LongField) ? (
            <textarea
              id={`careers-${q.key}`}
              rows={4}
              maxLength={4000}
              value={answers[q.key] ?? ''}
              onChange={(e) => setAnswer(q.key, e.target.value)}
              className={inputClass}
            />
          ) : (
            <input
              id={`careers-${q.key}`}
              type="url"
              maxLength={256}
              placeholder="https://"
              value={answers[q.key] ?? ''}
              onChange={(e) => setAnswer(q.key, e.target.value)}
              className={inputClass}
            />
          )}
          {q.helper && <p className={helperClass}>{q.helper}</p>}
        </div>
      ))}

      <div>
        <label htmlFor="careers-salary" className={labelClass}>
          Monthly rate you&apos;re looking for (USD)
        </label>
        <input
          id="careers-salary"
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder="2000"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className={inputClass}
        />
        <p className={helperClass}>A number, not a range. It saves us both a call.</p>
      </div>

      <fieldset>
        <legend className={labelClass}>How did you hear about us?</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {HEARD_OPTIONS.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 text-sm text-surface-700 cursor-pointer"
            >
              <input
                type="checkbox"
                name="heard"
                value={opt}
                checked={heard.includes(opt)}
                onChange={() => toggleHeard(opt)}
                className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="careers-company">Company (leave this empty)</label>
        <input
          id="careers-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {status === 'error' && (
        <p role="alert" className="text-sm text-error">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!hydrated || status === 'loading'}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
      >
        {status === 'loading' ? 'Sending…' : 'Send application'}
      </button>

      <p className="text-xs text-surface-500">
        We keep your application on file for future roles. To have it removed,
        email <a className="underline" href="mailto:hello@loudface.co">hello@loudface.co</a>.
      </p>
    </form>
  );
}
