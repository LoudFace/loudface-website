'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { ApplyContent } from '@/lib/content-utils';
import { strip } from '@/lib/inline-edit/mark';
import { isTrackingAllowed } from '@/lib/consent';
import { ensurePostHog } from '@/lib/posthog-client';
import { readReferralTag } from '@/lib/referral-tag';
import {
  REVENUE_BANDS,
  isValidEmail,
  isValidName,
  normalizePhone,
  normalizeWebsite,
  qualifies,
  type RevenueBandId,
} from '@/lib/apply-qualify';

/**
 * The /apply application card (design D, Arnel 2026-10-31). Five steps in the browser (revenue, website, name, work
 * email, phone), answers kept in sessionStorage so a reload or Back keeps them, every earlier answer editable under
 * the current question. Under $100K a month shows the not-fit state: no call, no Lead. After step 5 the answers go
 * to POST /api/apply (Meta Lead through the Conversions API), the Pixel fires the same Lead with the same event id
 * when consent allows it, and the real Cal.com booker opens inside the card with every answer filled in.
 * On a phone the whole card fits the first screen in every step (390×660 and 375×600, DESIGN.md §7 "Application card").
 */

const Cal = dynamic(() => import('@calcom/embed-react').then((m) => m.default || m), { ssr: false });
const CAL_LINK = 'arnelbukva/loudface-intro-call-apply';
const CAL_NAMESPACE = 'apply';
const STORE = 'lf_apply';
const FIELD_STEPS = ['website', 'name', 'email', 'phone'] as const;
type FieldKey = (typeof FIELD_STEPS)[number];
type Step = 0 | 1 | 2 | 3 | 4 | 'notfit' | 'cal';
type Answers = { revenue?: RevenueBandId } & Partial<Record<FieldKey, string>>;
type Saved = { step: Step; answers: Answers; eventId?: string; utm?: Record<string, string> };

const AUTOCOMPLETE: Record<FieldKey, { type: string; autoComplete: string; inputMode?: 'url' | 'email' | 'tel' | 'text' }> = {
  website: { type: 'text', autoComplete: 'url', inputMode: 'url' },
  name: { type: 'text', autoComplete: 'name', inputMode: 'text' },
  email: { type: 'email', autoComplete: 'email', inputMode: 'email' },
  phone: { type: 'tel', autoComplete: 'tel', inputMode: 'tel' },
};
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

function readCookie(name: string): string | undefined {
  const part = document.cookie.split(';').map((p) => p.trim()).find((p) => p.startsWith(`${name}=`));
  const value = part?.slice(name.length + 1);
  return value ? value.slice(0, 500) : undefined;
}

function load(): Saved | null {
  try {
    const raw = window.sessionStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
function save(state: Saved) {
  try {
    window.sessionStorage.setItem(STORE, JSON.stringify(state));
  } catch {
    // Private mode can refuse storage; the card still works for this page view.
  }
}

const Arrow = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Check = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.3l2.3 2.3 4.7-5" stroke="#1b7f4b" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function ApplyCard({ c, avatar, engines, onStep }: {
  c: ApplyContent;
  avatar: string;
  engines: string[];
  onStep?: (step: Step) => void;
}) {
  const card = c.card;
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [eventId, setEventId] = useState<string>();
  const [utm, setUtm] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const restored = useRef(false);

  // Restore a visit in progress; keep the first page view's UTM tags for the booking.
  useEffect(() => {
    const saved = load();
    const params = new URLSearchParams(window.location.search);
    const fresh = Object.fromEntries(UTM_KEYS.map((k) => [k, params.get(k)?.slice(0, 100) ?? '']).filter(([, v]) => v));
    if (saved) {
      setAnswers(saved.answers ?? {});
      setStep(saved.step ?? 0);
      setEventId(saved.eventId);
      setUtm(Object.keys(fresh).length ? fresh : saved.utm ?? {});
    } else {
      setUtm(fresh);
    }
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    save({ step, answers, eventId, utm });
    onStep?.(step);
  }, [step, answers, eventId, utm, onStep]);

  // The field shows its saved answer when the visitor lands on it (Back, Edit, reload).
  useEffect(() => {
    if (typeof step === 'number' && step > 0) {
      setDraft(answers[FIELD_STEPS[step - 1]] ?? '');
      setError(null);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Each step change keeps the card in view: if its top went above the viewport, bring it back.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !restored.current) return;
    const top = el.getBoundingClientRect().top;
    if (top < 0) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [step]);

  const bandIndex = answers.revenue ? REVENUE_BANDS.findIndex((b) => b.id === answers.revenue) : -1;
  const bandLabel = bandIndex >= 0 ? card.revenue.options[bandIndex].label : '';

  const go = useCallback((next: Step) => setStep(next), []);

  function nextFromRevenue() {
    if (!answers.revenue) return;
    if (!qualifies(answers.revenue)) {
      setStep('notfit');
      void ensurePostHog().then((ph) => ph?.capture('apply_not_fit', { revenue_band: answers.revenue }));
      return;
    }
    setStep(1);
  }

  function check(key: FieldKey, value: string): string | null {
    if (key === 'website') return normalizeWebsite(value);
    if (key === 'name') return isValidName(value) ? value.trim() : null;
    if (key === 'email') return isValidEmail(value) ? value.trim() : null;
    return normalizePhone(value);
  }

  async function submit(all: Answers) {
    setSending(true);
    setError(null);
    const id = eventId ?? `apply_${crypto.randomUUID()}`;
    setEventId(id);
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    const fbc = readCookie('_fbc') ?? (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined);
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...all, eventId: id, fbc, utm }),
      });
      const body = (await res.json()) as { ok?: boolean };
      if (!res.ok || !body.ok) throw new Error('apply failed');
      // The Pixel's Lead carries the server's event id, so Meta keeps one of the two. Only with consent.
      const w = window as typeof window & { fbq?: (...args: unknown[]) => void };
      if (isTrackingAllowed() && typeof w.fbq === 'function') w.fbq('track', 'Lead', {}, { eventID: id });
      setStep('cal');
    } catch {
      setError(strip(card.error));
    } finally {
      setSending(false);
    }
  }

  function nextFromField(e?: React.FormEvent) {
    e?.preventDefault();
    if (typeof step !== 'number' || step === 0) return;
    const key = FIELD_STEPS[step - 1];
    const value = check(key, draft);
    if (!value) {
      setError(strip(card[key].invalid));
      inputRef.current?.focus();
      return;
    }
    const all = { ...answers, [key]: value };
    setAnswers(all);
    if (step < 4) setStep((step + 1) as Step);
    else void submit(all);
  }

  const total = 5;
  const count = typeof step === 'number' ? step + 1 : total;
  const progress = (n: number) => (
    <div className="ap-prog" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => <i key={i} className={i < n ? 'is-on' : ''} />)}
    </div>
  );

  const top = (n: number) => (
    <div className="ap-top">
      <h2 className="ap-title"><span className="ap-wide"><span>{card.title}</span></span><span className="ap-narrow"><span>{card.titleShort}</span></span></h2>
      <div className="ap-count">
        <span className="ap-wide"><span>{card.questionWord}</span> {n} <span>{card.questionOf}</span> {total}</span>
        <span className="ap-narrow">{n} <span>{card.questionOf}</span> {total}</span>
      </div>
    </div>
  );

  // The rows of answers given so far, each editable.
  const done = useMemo(() => {
    if (typeof step !== 'number' || step === 0) return [];
    const rows: { label: string; value: string; to: Step }[] = [{ label: card.revenue.summary, value: bandLabel, to: 0 }];
    FIELD_STEPS.slice(0, step - 1).forEach((k, i) => rows.push({ label: card[k].summary, value: answers[k] ?? '', to: (i + 1) as Step }));
    return rows;
  }, [step, answers, bandLabel, card]);

  if (step === 'notfit') {
    const n = c.notFit;
    return (
      <div className="ap-card" ref={cardRef as React.RefObject<never>} data-step="notfit">
        <div className="ap-in">
          <h2 className="ap-title"><span>{n.title}</span></h2>
          <p className="ap-body"><span>{n.body}</span></p>
          <div className="ap-offer">
            <div className="ap-k"><span>{n.offerKicker}</span></div>
            <div className="ap-ot"><span>{n.offerTitle}</span></div>
            <p className="ap-op"><span>{n.offerBody}</span></p>
            <div className="ap-act">
              <a className="ap-btn" href="/ai-audit"><span>{n.offerCta}</span><Arrow /></a>
              <span className="ap-eng" aria-hidden="true">{engines.map((src) => <img key={src} src={src} alt="" width={20} height={20} />)}</span>
            </div>
          </div>
          <a className="ap-link" href="/case-studies/delshad-legal-content-engine">
            <span className="ap-wide"><span>{n.caseLink}</span></span>
            <span className="ap-narrow"><span>{n.caseLinkShort}</span></span>
            <span className="ap-link-cta"><span>{n.caseCta}</span> →</span>
          </a>
        </div>
        <div className="ap-foot">
          <button type="button" className="ap-back" onClick={() => go(0)}>← <span>{n.change}</span></button>
        </div>
      </div>
    );
  }

  if (step === 'cal') {
    return (
      <div className="ap-card ap-card-cal" ref={cardRef as React.RefObject<never>} data-step="cal">
        <div className="ap-in">
          <div className="ap-host">
            <img src={avatar} alt="" width={40} height={40} />
            <div><div className="ap-host-t"><span>{c.cal.title}</span></div><div className="ap-host-m"><span>{c.cal.meta}</span></div></div>
          </div>
          <div className="ap-cal">
            <CalBooker answers={answers} band={strip(bandLabel)} utm={utm} onBooked={() => {
              try { window.sessionStorage.removeItem(STORE); } catch { /* storage refused */ }
              router.push('/thank-you');
            }} />
          </div>
        </div>
        <div className="ap-pre"><span className="ap-check"><Check /></span><span>{c.cal.prefilled}</span></div>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className="ap-card" ref={cardRef as React.RefObject<never>} data-step="q1">
        <div className="ap-in">
          {top(1)}
          {progress(1)}
          <fieldset className="ap-fs">
            <legend className="ap-q"><span>{card.revenue.question}</span></legend>
            <div className="ap-tiles">
              {REVENUE_BANDS.map((band, i) => (
                <label key={band.id} className={`ap-tile${answers.revenue === band.id ? ' is-sel' : ''}`}>
                  <input type="radio" name="revenue" value={band.id} checked={answers.revenue === band.id}
                    onChange={() => setAnswers((a) => ({ ...a, revenue: band.id }))} />
                  <span className="ap-r" aria-hidden="true" />
                  <span>{card.revenue.options[i].label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="ap-foot">
          <div className="ap-who">
            <img src={avatar} alt="" width={34} height={34} />
            <div><span className="ap-wide"><span>{card.time}</span><br /><span>{card.timeTail}</span></span><span className="ap-narrow"><span>{card.time}</span></span></div>
          </div>
          <button type="button" className="ap-btn" disabled={!answers.revenue} onClick={nextFromRevenue}><span>{card.next}</span><Arrow /></button>
        </div>
      </div>
    );
  }

  const key = FIELD_STEPS[step - 1];
  const field = card[key];
  const ac = AUTOCOMPLETE[key];
  return (
    <form className="ap-card" ref={cardRef as React.RefObject<never>} data-step={`q${count}`} onSubmit={nextFromField} noValidate>
      <div className="ap-in">
        {top(count)}
        {progress(count)}
        <label className="ap-q" htmlFor={`apply-${key}`}><span>{field.question}</span></label>
        <div className="ap-hint"><span>{field.hint}</span></div>
        <input
          id={`apply-${key}`}
          ref={inputRef}
          className={`ap-field${error ? ' is-bad' : ''}`}
          type={ac.type}
          inputMode={ac.inputMode}
          autoComplete={ac.autoComplete}
          enterKeyHint={step < 4 ? 'next' : 'go'}
          placeholder={strip(field.placeholder)}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); if (error) setError(null); }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'apply-error' : undefined}
          autoFocus
        />
        {error && <div className="ap-error" id="apply-error" role="alert">{error}</div>}
        <div className="ap-done">
          {/* Each earlier answer is one button: a row on desktop, a chip on a phone, either way it reopens that step. */}
          {done.map((row) => (
            <button type="button" className="ap-row" key={row.label} onClick={() => go(row.to)}>
              <span className="ap-row-k">{row.label}</span>
              <span className="ap-row-v">{row.to === 1 ? row.value.replace(/^https:\/\//, '') : row.value}</span>
              <span className="ap-row-e"><span>{card.edit}</span></span>
            </button>
          ))}
        </div>
      </div>
      <div className="ap-foot">
        <button type="button" className="ap-back" onClick={() => go((step - 1) as Step)}>← <span>{card.back}</span></button>
        <button type="submit" className="ap-btn" disabled={sending}>
          {sending ? <span>{card.sending}</span> : <><span>{card.next}</span><Arrow /></>}
        </button>
      </div>
    </form>
  );
}

/**
 * The real Cal.com booker, inline, in its own namespace so its settings never leak into the site-wide modal. The
 * answers prefill the booking form (Cal.com reads them from the booker's own address, as every Cal.com prefill does);
 * website and revenue are hidden questions on the event type, so nobody types anything twice. fbp, fbc and lf_tag ride
 * as booking metadata the way CalHandler sends them, for the Schedule event the Slack approval later sends.
 */
function CalBooker({ answers, band, utm, onBooked }: { answers: Answers; band: string; utm: Record<string, string>; onBooked: () => void }) {
  const booked = useRef(onBooked);
  booked.current = onBooked;
  const [config] = useState<Record<string, string>>(() => {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    const fbp = readCookie('_fbp');
    const fbc = readCookie('_fbc') ?? (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined);
    const tag = readReferralTag();
    return {
      layout: 'month_view',
      theme: 'light',
      name: answers.name ?? '',
      email: answers.email ?? '',
      attendeePhoneNumber: answers.phone ?? '',
      website: answers.website ?? '',
      monthly_revenue: band,
      utm_source: utm.utm_source || 'website',
      utm_medium: utm.utm_medium || 'apply',
      utm_campaign: utm.utm_campaign || 'apply',
      utm_content: utm.utm_content || '/apply',
      ...(fbp ? { 'metadata[fbp]': fbp } : {}),
      ...(fbc ? { 'metadata[fbc]': fbc } : {}),
      ...(tag ? { 'metadata[lf_tag]': tag } : {}),
    };
  });
  useEffect(() => {
    let off = false;
    (async () => {
      const { getCalApi } = await import('@calcom/embed-react');
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      if (off) return;
      cal('ui', {
        hideEventTypeDetails: true,
        layout: 'month_view',
        theme: 'light',
        cssVarsPerTheme: {
          light: { 'cal-brand': '#4f46e5', 'cal-border-booker': 'transparent', 'cal-border-booker-width': '0px' },
          dark: { 'cal-brand': '#4f46e5', 'cal-border-booker': 'transparent', 'cal-border-booker-width': '0px' },
        },
      });
      // A booking goes to /thank-you with nothing about the visitor in the address.
      cal('on', { action: 'bookingSuccessfulV2', callback: () => booked.current() });
    })();
    return () => { off = true; };
  }, []);
  return (
    <Cal namespace={CAL_NAMESPACE} calLink={CAL_LINK} style={{ width: '100%', height: '100%', overflow: 'auto' }} config={config} />
  );
}
