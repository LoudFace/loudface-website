import type { ReactNode } from 'react';
import { img, personPhoto } from '@/app/home-v11/ui';
import { card, H, panel, softShadow, Tick } from './cards-ui';

/**
 * The house sections of the LoudFace tab (Arnel, 9 Nov 2026): the deck's first
 * tab sells LoudFace before the lead's own tab. It is a retrofit of the cards
 * deck, not a redesign ("I was mostly hoping just for a retrofit or moving
 * things around"), so the tab reuses the deck's own sections and adds only the
 * three it lacked, each in the look Arnel picked from the 9 Nov drafts:
 *   Expectations  draft A's three moments, each with a small example screen.
 *   Story         draft A's dated rows and founder quote.
 *   Why us        draft B's four tinted cards, then the hand-off to the lead's tab.
 * Every figure here is on loudface.co as of 9 Nov 2026.
 */

const FAV = (name: string) => img(`logos/fav-${name}`);

function Section({ id, name, heading, intro, children }: { id: string; name: string; heading: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} data-proposal-section={name} data-proposal-type="pitch" className="py-12 sm:py-14">
      <H>{heading}</H>
      {intro && <p className="mt-2 max-w-[64ch] text-[15px] leading-relaxed text-surface-600">{intro}</p>}
      {children}
    </section>
  );
}

function Screen({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-surface-200 bg-surface-50/60 p-1.5">
      <div className="rounded-lg bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-surface-100 px-3 py-2 text-[11.5px]">
          <span className="font-medium text-surface-700">{title}</span>
          <span className="text-surface-400">{note}</span>
        </div>
        <div className="divide-y divide-surface-100">{children}</div>
      </div>
    </div>
  );
}

const Row = ({ children }: { children: ReactNode }) => <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-surface-700">{children}</div>;
const Met = ({ children = 'Met' }: { children?: string }) => <span className="ml-auto font-medium text-primary-700">{children}</span>;

/* ── What you can expect from us ──────────────────────────────────────── */
const TRACED = [
  { fav: 'chatgpt.webp', source: 'ChatGPT', page: 'Service page' },
  { fav: 'google-g.png', source: 'Google', page: 'Case study' },
  { fav: 'perplexity.png', source: 'Perplexity', page: 'Contact page' },
  { fav: 'gemini.png', source: 'Gemini', page: 'Pricing page' },
];
const MINIMUMS = ['Pages published', 'Mentions placed', 'Site improvements'];

const MOMENTS: { when: string; lead: string; rest: string; screen: ReactNode }[] = [
  {
    when: 'Week 1',
    lead: 'Tracking goes live,',
    rest: 'so every lead is traced back to the page, search or AI answer that sent it.',
    screen: (
      <Screen title="New leads, traced to source" note="Example">
        {TRACED.map((t) => (
          <Row key={t.source}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FAV(t.fav)} alt="" className="h-3.5 w-3.5 rounded-sm" />
            <span className="whitespace-nowrap font-medium text-surface-900">{t.source}</span>
            <span aria-hidden="true" className="text-surface-400">→</span>
            <span className="truncate text-surface-500">{t.page}</span>
            <Met>Lead</Met>
          </Row>
        ))}
      </Screen>
    ),
  },
  {
    when: 'Every Friday',
    lead: 'One report, one number on top:',
    rest: "leads from search and AI. Then what we shipped and what's next.",
    screen: (
      <Screen title="Friday report" note="Example: Genie Teacher">
        <div className="flex items-end justify-between gap-3 px-3 py-3">
          <div>
            <p className="text-[11px] text-surface-500">Lead requests a week</p>
            <p className="proposal-num text-[26px] font-medium leading-none tracking-[-0.03em] text-surface-950">5.8×</p>
            <p className="mt-1 text-[11px] text-surface-400">Sep vs the 7 weeks before</p>
          </div>
          <svg viewBox="0 0 118 54" className="h-[46px] w-[100px]" aria-hidden="true">
            <path d="M2,48.3 L14.7,44.2 L27.3,49.9 L40,44.2 L52.7,42 L65.3,44.2 L78,39.9 L90.7,2 L103.3,14.1 L116,27.3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="text-primary-600" />
          </svg>
        </div>
        <Row><span className="font-medium text-surface-900">What we shipped</span><span aria-hidden="true" className="ml-auto text-surface-400">›</span></Row>
        <Row><span className="font-medium text-surface-900">What&apos;s next</span><span aria-hidden="true" className="ml-auto text-surface-400">›</span></Row>
      </Screen>
    ),
  },
  {
    when: 'Every month',
    lead: 'The minimums in your contract are met,',
    rest: 'and we work above them. Pages published, mentions placed, the site improved.',
    screen: (
      <Screen title="This month, against your contract" note="Example">
        {MINIMUMS.map((m) => (
          <Row key={m}><Tick /><span className="text-surface-900">{m}</span><Met /></Row>
        ))}
        <Row><Tick /><span className="text-surface-900">Work above the minimum</span><Met>Ongoing</Met></Row>
      </Screen>
    ),
  },
];

export function PitchExpectations({ index }: { index: number }) {
  return (
    <Section id={`pitch-${index}`} name="LoudFace · What you can expect" heading="What you can expect from us">
      <div className={`${panel} space-y-3`}>
        {MOMENTS.map((m) => (
          <div key={m.when} className={`${card} grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,300px)] sm:items-center sm:gap-8 sm:p-6`}>
            <div>
              <span className="inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-[12px] font-medium text-primary-700">{m.when}</span>
              <p className="mt-3 text-[17px] leading-snug text-surface-700">
                <b className="font-semibold text-surface-950">{m.lead}</b> {m.rest}
              </p>
            </div>
            {m.screen}
          </div>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-surface-600">Monthly minimums are written into the contract. You can talk to a client before you sign.</p>
    </Section>
  );
}

/* ── Our story ────────────────────────────────────────────────────────── */
const YEARS = [
  { year: '2019', lead: 'Arnel starts LoudFace,', rest: 'betting on Webflow before most agencies had heard of it.' },
  { year: '2022', lead: 'SEO and conversion fold into every build.', rest: 'Growth becomes the retainer, not an upsell.' },
  { year: '2024', lead: 'Webflow Enterprise Partner,', rest: 'one of a small number worldwide.' },
  { year: '2026', lead: 'AI-search visibility joins the stack.', rest: '200+ sites shipped, 50+ teams served.' },
];

export function PitchStory({ index }: { index: number }) {
  return (
    <Section id={`pitch-${index}`} name="LoudFace · Our story" heading="Seven years of building for growth" intro="Offices in Dubai and the US. 2h response time.">
      <div className={`${panel} grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]`}>
        <ol className={`${card} px-5 sm:px-6`}>
          {YEARS.map((y, i) => (
            <li key={y.year} className={`grid grid-cols-[64px_minmax(0,1fr)] gap-4 py-4 ${i > 0 ? 'border-t border-surface-100' : ''}`}>
              <span className="proposal-num text-[20px] font-medium leading-tight tracking-[-0.02em] text-primary-600">{y.year}</span>
              <p className="text-[14.5px] leading-relaxed text-surface-600">
                <b className="font-semibold text-surface-950">{y.lead}</b> {y.rest}
              </p>
            </li>
          ))}
        </ol>
        <figure className={`${card} m-0 flex flex-col justify-between gap-6 p-6`}>
          <blockquote className="text-[18px] leading-snug tracking-[-0.01em] text-surface-950">
            &ldquo;I started LoudFace chasing a hunch: that design and numbers belonged on the same team, not in separate agencies handing off a brief. Seven years later that&apos;s still the whole bet.&rdquo;
          </blockquote>
          <figcaption className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={personPhoto('arnel-bukva')} alt="Arnel Bukva" className="h-11 w-11 rounded-full object-cover" loading="lazy" />
            <span>
              <span className="block text-[14px] font-semibold text-surface-950">Arnel Bukva</span>
              <span className="block text-[12.5px] text-surface-500">Founder & Head of Growth</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}

/* ── Why teams pick us, then the hand-off ─────────────────────────────── */
const ENGINES = ['chatgpt.webp', 'gemini.png', 'perplexity.png', 'claude.png', 'google-g.png', 'copilot.svg'];
const CLIENT_FACES = [
  { src: img('people/kenneth-o-friel.webp'), name: "Kenneth O'Friel, Toku" },
  { src: img('people/jordan-hayes.webp'), name: 'Jordan Hayes, Hayes Media' },
  { src: img('people/daan-smit.webp'), name: 'Daan Smit, Brandfirm' },
];
const RANKS = ['1st', '2nd', '3rd', '4th'];

const REASONS: { text: string; tint: string; visual: ReactNode }[] = [
  {
    text: 'One team for brand, website, search and AI, on one flat fee.',
    tint: 'bg-primary-50',
    visual: (
      <div className="grid w-fit grid-cols-3 gap-2">
        {ENGINES.map((f) => (
          <span key={f} className={`flex h-10 w-10 items-center justify-center rounded-full bg-white ${softShadow}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FAV(f)} alt="" className="h-5 w-5" />
          </span>
        ))}
      </div>
    ),
  },
  {
    text: 'Monthly minimums written into the contract.',
    tint: 'bg-[#fbf4e6]',
    visual: (
      <div className={`w-full max-w-[220px] rounded-xl bg-white p-3 ${softShadow}`}>
        <p className="text-[11.5px] font-medium text-surface-900">Monthly minimums</p>
        <ul className="mt-2 space-y-1.5">
          {MINIMUMS.map((m) => (
            <li key={m} className="flex items-center gap-2 text-[11.5px] text-surface-600"><Tick />{m}</li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    text: 'We did it for ourselves first: 2nd of 53 brands in our own category.',
    tint: 'bg-[#fbeee8]',
    visual: (
      <div className={`w-full max-w-[220px] rounded-xl bg-white p-2 ${softShadow}`}>
        {RANKS.map((r) => (
          <div key={r} className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-[11.5px] ${r === '2nd' ? 'bg-primary-50 font-medium text-primary-700' : 'text-surface-400'}`}>
            <span className="w-6">{r}</span>
            {r === '2nd' ? <span className="text-surface-950">LoudFace</span> : <span className="h-1.5 flex-1 rounded-full bg-surface-100" />}
          </div>
        ))}
        <p className="px-2 pt-1 text-[10.5px] text-surface-400">of 53 tracked brands</p>
      </div>
    ),
  },
  {
    text: 'Talk to a client before you sign.',
    tint: 'bg-[#eef0fb]',
    visual: (
      <div className="flex -space-x-3">
        {CLIENT_FACES.map((f) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={f.src} src={f.src} alt={f.name} className="h-12 w-12 rounded-full border-2 border-white object-cover" loading="lazy" />
        ))}
      </div>
    ),
  },
];

export function PitchWhyUs({ index, clientName }: { index: number; clientName: string }) {
  return (
    <Section id={`pitch-${index}`} name="LoudFace · Why teams pick us" heading="Why teams pick us">
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {REASONS.map((r) => (
          <div key={r.text} className={`flex min-h-[230px] flex-col justify-between gap-6 rounded-[20px] p-6 ${r.tint}`}>
            {r.visual}
            <p className="text-[18px] font-medium leading-snug tracking-[-0.01em] text-surface-950">{r.text}</p>
          </div>
        ))}
      </div>
      <a href="#proposal" className={`${card} mt-3 flex flex-wrap items-center justify-between gap-4 p-6 transition-shadow hover:shadow-md`}>
        <span>
          <span className="block text-[12.5px] font-medium text-primary-700">Next</span>
          <span className="mt-1 block text-[22px] font-medium tracking-[-0.02em] text-surface-950">{clientName}</span>
          <span className="mt-1 block max-w-[52ch] text-[14.5px] text-surface-600">
            Where you are today, what we&apos;d do first, and the investment.
          </span>
        </span>
        <span className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-[14px] font-medium text-white">
          Go to your tab <span aria-hidden="true">→</span>
        </span>
      </a>
    </Section>
  );
}
