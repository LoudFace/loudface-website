'use client';

import { useState, type ReactNode } from 'react';

/**
 * Who does the work, drawn once for every cards proposal (Arnel's pick,
 * 2026-10-26, "C3" on the Paper page "Proposal deck").
 *
 * Buyers used to line-item retainers ask who on their team will manage the
 * website. This answers it: the hero's two streams opened up, every job a
 * station on them, and one team running all of it for one fee. Picking a
 * station opens a strip with the seniority behind that job, one real number
 * and real shipped work, because the bare job names read as cheap (Arnel:
 * "it's not like we just have a cheap designer on board").
 *
 * Every number and client name here is on loudface.co (case studies page,
 * homepage, methodology) as of 2026-10-26. Change one only when the live page
 * that owns it changes.
 *
 * Geometry: the diagram is drawn at 660 × 330, the width of the deck's main
 * column beside the proof rail, so its type renders at full size. Labels are
 * HTML placed in percent of that box; the ribbons are SVG.
 */

type Proof = { big?: string; badge?: 'webflow'; text: string };
type Step = {
  id: string;
  name: string;
  short: string;
  x: number;
  y: number;
  side: 'top' | 'bottom' | 'end';
  icon: ReactNode;
  headline: string;
  body: string;
  proof: Proof[];
  picture: ReactNode;
};

const W = 660;
const H = 330;
const TOP = 'M90 80 C 300 80, 400 80, 470 115 S 540 165, 556 165';
const BOT = 'M90 250 C 300 250, 400 250, 470 215 S 540 165, 556 165';
const LEADS = { x: 598, y: 165 };

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

function Photo({ src, caption, position = '50% 50%' }: { src: string; caption: string; position?: string }) {
  return (
    <figure className="relative m-0 h-full min-h-[240px] overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={caption} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }} />
      <figcaption className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[13px] font-medium text-surface-950">{caption}</figcaption>
    </figure>
  );
}

/* The house grounds the photographs use (DESIGN.md tokens): lavender, sand, peach. */
const GROUNDS = {
  lavender: 'linear-gradient(150deg, #ebe6fd 0%, #b7aaf2 100%)',
  sand: 'linear-gradient(150deg, #fcefcf 0%, #f2c768 100%)',
  peach: 'linear-gradient(150deg, #fde6dc 0%, #f59a7b 100%)',
};

function Plate({ children, caption, ground }: { children: ReactNode; caption: string; ground: keyof typeof GROUNDS }) {
  return (
    <figure className="relative m-0 flex h-full min-h-[240px] items-center justify-center overflow-hidden rounded-2xl px-6 pb-16 pt-8" style={{ background: GROUNDS[ground] }}>
      {children}
      <figcaption className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[13px] font-medium text-surface-950">{caption}</figcaption>
    </figure>
  );
}

const TOOLS = [
  { src: '/images/home-v11/logos/posthog-icon.png', name: 'PostHog', what: 'Every visit, by source' },
  { src: '/images/home-v11/logos/gtm-icon.svg', name: 'Tag Manager', what: 'Forms and demo buttons' },
  { src: '/images/home-v11/logos/fav-hubspot.png', name: 'Your CRM', what: 'Each lead with its source' },
];

const REVIEWS = [
  { src: '/images/review-platforms/clutch.png', name: 'Clutch', rating: '4.8' },
  { src: '/images/review-platforms/google.png', name: 'Google', rating: '5.0' },
];

const STEPS: Step[] = [
  {
    id: 'design',
    name: 'Design',
    short: 'Pages that sell',
    x: 176,
    y: 80,
    side: 'top',
    icon: svg(<><rect x="3" y="4" width="14" height="12" rx="2" /><path d="M3 8h14" /></>),
    headline: 'A highly aesthetic design team, working with our own custom harnesses',
    body: 'Positioning, copy and design ship as one piece of work, built to sell, not to decorate. The same team designed and built sites for Montblanc, Hoxhunt and Dimer Health.',
    proof: [
      { big: '288%', text: "more conversions after we redesigned Dimer Health's site" },
      { badge: 'webflow', text: 'One of a small number of agencies worldwide' },
    ],
    picture: <Photo src="/images/home-v11/bento-design.webp" caption="Dimer Health, a site we designed and built" position="100% 50%" />,
  },
  {
    id: 'development',
    name: 'Development',
    short: 'Builds and fixes',
    x: 292,
    y: 82,
    side: 'top',
    icon: svg(<path d="M7 6l-4 4 4 4M13 6l4 4-4 4" />),
    headline: 'A trained development team, with AI doing the checks',
    body: 'AI agents handle research and QA on every build. Our developers run them and sign off every release, and speed and tracking are checked before anything goes live.',
    proof: [
      { big: '$200K', text: 'in sales within 30 days from a landing page we built for Outbound Specialist' },
      { badge: 'webflow', text: 'One of a small number of agencies worldwide' },
    ],
    picture: <Photo src="/images/home-v11/bento-build.webp" caption="Ceipal, a site we built" position="92% 50%" />,
  },
  {
    id: 'tracking',
    name: 'Tracking',
    short: 'Every lead, sourced',
    x: 408,
    y: 95,
    side: 'top',
    icon: svg(<><circle cx="10" cy="10" r="6.5" /><circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" /></>),
    headline: 'Every lead traced back to where it came from',
    body: 'We wire analytics, your forms and your CRM in the first week. Each demo request carries the page and the search or AI assistant that sent it.',
    proof: [
      { big: 'Week 1', text: 'tracking live, before the first article ships' },
      { text: 'Visits from ChatGPT and other assistants are counted on their own, not lost in "direct"' },
    ],
    picture: (
      <Plate caption="Analytics, tags and your CRM, wired as one" ground="sand">
        <div className="relative w-full max-w-[280px]">
          <span aria-hidden="true" className="absolute bottom-7 left-[27px] top-7 w-px bg-white/80" />
          <div className="relative space-y-2.5">
            {TOOLS.map((t) => (
              <div key={t.name} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-[0_8px_20px_-12px_rgba(30,27,75,0.35)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.src} alt="" width={30} height={30} className="h-[30px] w-[30px] flex-none rounded-md object-contain" />
                <div className="min-w-0 leading-tight">
                  <p className="text-[14px] font-semibold text-surface-950">{t.name}</p>
                  <p className="text-[12px] text-surface-500">{t.what}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Plate>
    ),
  },
  {
    id: 'content',
    name: 'Content',
    short: 'Written, published',
    x: 176,
    y: 250,
    side: 'bottom',
    icon: svg(<><path d="M5 3h7l3 3v11H5z" /><path d="M8 10h5M8 13h5" /></>),
    headline: 'Strategists who write for buyers and for AI',
    body: 'A strategist plans every piece from the questions your buyers ask ChatGPT and Google. Writers draft, AI agents check facts and structure, and the strategist signs off before it goes live on your site.',
    proof: [
      { big: '21.5%', text: "LoudFace's own share of non-branded AI answers, up from 0.13%" },
      { big: '9.1×', text: 'Google clicks a week for TradeMomentum' },
    ],
    picture: <Photo src="/images/home-v11/bento-search.webp" caption="Genie Teacher, 370× Google impressions a day" position="90% 50%" />,
  },
  {
    id: 'mentions',
    name: 'Mentions',
    short: 'On lists AI reads',
    x: 292,
    y: 248,
    side: 'bottom',
    icon: svg(<path d="M8.5 11.5l3-3M7 9l-2 2a2.8 2.8 0 004 4l2-2M13 11l2-2a2.8 2.8 0 00-4-4L9 7" />),
    headline: 'Placed on the lists ChatGPT reads',
    body: 'We find the roundups and comparisons AI cites for your category and get you onto them, often by featuring the other company in return.',
    proof: [
      { big: '0 → 97.8%', text: "Toku's AI visibility on its category's top prompt" },
      { big: '3rd of 53', text: 'where LoudFace now ranks among the brands tracked in AI answers' },
    ],
    picture: <Photo src="/images/home-v11/bento-ai.webp" caption="Toku, named in an AI answer" position="60% 50%" />,
  },
  {
    id: 'reviews',
    name: 'Reviews',
    short: 'G2 and Capterra',
    x: 408,
    y: 235,
    side: 'bottom',
    icon: svg(<path d="M10 3.5l1.9 4 4.3.5-3.2 3 .9 4.3L10 13.1l-3.9 2.2.9-4.3-3.2-3 4.3-.5z" />),
    headline: 'Review programmes on the sites AI checks',
    body: 'AI weighs independent proof before it recommends a vendor. We set up G2, Capterra and Trustpilot and run the ask to your happy customers.',
    proof: [
      { big: '4.8', text: 'our own Clutch rating, from verified clients' },
      { big: '5.0', text: 'our Google rating, from four reviews' },
    ],
    picture: (
      <Plate caption="Our own ratings, run the same way" ground="peach">
        <div className="grid w-full max-w-[280px] gap-2.5">
          {REVIEWS.map((r) => (
            <div key={r.name} className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 shadow-[0_8px_20px_-12px_rgba(30,27,75,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.src} alt="" className="h-6 w-6 object-contain" />
              <span className="flex-1 text-[14px] font-medium text-surface-900">{r.name}</span>
              <span className="text-[15px] font-semibold text-surface-950">{r.rating}</span>
            </div>
          ))}
        </div>
      </Plate>
    ),
  },
  {
    id: 'report',
    name: 'Pipeline report',
    short: 'Every Friday',
    x: LEADS.x,
    y: LEADS.y,
    side: 'end',
    icon: null,
    headline: 'One number on top: leads from search and AI',
    body: 'Every Friday your strategist writes what moved, why, and what we do next. Once a month you get a full report with one recommendation you decide on together.',
    proof: [
      { big: 'Fridays', text: 'a written note from the strategist who runs your account' },
      { big: 'Week 1', text: 'a written growth plan, before any content ships' },
    ],
    picture: (
      <Plate caption="The Friday note, from your strategist" ground="lavender">
        <div className="w-full max-w-[290px] rounded-xl bg-white p-4 shadow-[0_10px_28px_-14px_rgba(30,27,75,0.45)]">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/home-v11/team/arnel-bukva-v3.jpg" alt="" className="h-8 w-8 rounded-full object-cover" />
            <div>
              <p className="text-[13px] font-semibold text-surface-950">Friday note</p>
              <p className="text-[12px] text-surface-500">What moved, why, what’s next</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 border-t border-surface-100 pt-3">
            {['Leads this week', 'What moved and why', 'Next week'].map((h, i) => (
              <div key={h}>
                <p className="text-[12px] font-semibold text-surface-800">{h}</p>
                <span aria-hidden="true" className={`mt-1.5 block h-1.5 rounded bg-surface-100 ${i === 1 ? 'w-full' : 'w-2/3'}`} />
              </div>
            ))}
          </div>
        </div>
      </Plate>
    ),
  },
];

const TEAM = ['arnel-bukva-v3', 'tamara-pavlovic-v3', 'abhay-tyagi-v3', 'andrea-van-wyk-v5'];

function Origin({ top, label, tag, children }: { top: number; label: string; tag: string; children: ReactNode }) {
  return (
    <div className="absolute flex w-[96px] flex-col items-center" style={{ left: 0, top: pct(top, H) }}>
      <div className="flex h-[66px] w-[96px] items-center justify-center overflow-hidden rounded-xl border border-surface-200 bg-white shadow-[0_6px_18px_-8px_rgba(30,27,75,0.2)]">
        {children}
      </div>
      <p className="mt-2 text-[12px] font-semibold text-surface-950">{label}</p>
      <p className="text-[12px] font-medium text-primary-600">{tag}</p>
    </div>
  );
}

function Diagram({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  return (
    <div className="relative mx-auto w-full max-w-[760px]" style={{ aspectRatio: `${W} / ${H + 44}` }}>
      <div className="absolute inset-x-0 top-0" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="pw-rib" gradientUnits="userSpaceOnUse" x1="90" y1="0" x2="556" y2="0">
              <stop offset="0" stopColor="#eeedfe" />
              <stop offset="0.55" stopColor="#cfcbfa" />
              <stop offset="1" stopColor="#6f68ee" />
            </linearGradient>
          </defs>
          <path d={TOP} fill="none" stroke="url(#pw-rib)" strokeWidth="34" strokeLinecap="round" />
          <path d={BOT} fill="none" stroke="url(#pw-rib)" strokeWidth="34" strokeLinecap="round" />
          <path d={TOP} fill="none" stroke="#fff" strokeWidth="1.6" strokeDasharray="2 8" strokeLinecap="round" />
          <path d={BOT} fill="none" stroke="#fff" strokeWidth="1.6" strokeDasharray="2 8" strokeLinecap="round" />
          {[TOP, BOT].map((p) =>
            [0, 1, 2].map((k) => (
              <circle key={`${p}-${k}`} r="3" fill="#fff" opacity="0" className="pc-traveller">
                <animateMotion dur="7s" begin={`${-(k * 7) / 3}s`} repeatCount="indefinite" path={p} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.88;1" dur="7s" begin={`${-(k * 7) / 3}s`} repeatCount="indefinite" />
              </circle>
            )),
          )}
          <circle cx={LEADS.x} cy={LEADS.y} r="58" fill="none" stroke="#eeedfe" strokeWidth="1.5" />
          <circle cx={LEADS.x} cy={LEADS.y} r="51" fill="none" stroke="#dcd9fc" strokeWidth="1.5" />
          <circle cx={LEADS.x} cy={LEADS.y} r="44" fill={active === 'report' ? '#3d38cf' : '#4f46e5'} />
        </svg>

        <Origin top={47} label="Your website" tag="Get chosen">
          <div aria-hidden="true" className="w-full self-start">
            <div className="flex h-3.5 items-center gap-1 bg-surface-100 px-2">
              {[0, 1, 2].map((i) => <span key={i} className="h-1 w-1 rounded-full bg-surface-300" />)}
            </div>
            <div className="space-y-1 px-2.5 pt-2">
              <span className="block h-1.5 w-12 rounded-sm bg-surface-950" />
              <span className="block h-1 w-16 rounded-sm bg-surface-200" />
              <span className="block h-2 w-8 rounded-full bg-primary-600" />
            </div>
          </div>
        </Origin>
        <Origin top={217} label="Google and AI" tag="Get found">
          <div className="flex items-center gap-1.5">
            {['fav-google-g.png', 'fav-chatgpt.webp', 'fav-perplexity.png'].map((f) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={f} src={`/images/home-v11/logos/${f}`} alt="" className="h-5 w-5 rounded" />
            ))}
          </div>
        </Origin>

        {STEPS.map((s) => {
          const on = active === s.id;
          if (s.side === 'end') {
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onPick(s.id)}
                aria-pressed={on}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-full text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
                style={{ left: pct(s.x, W), top: pct(s.y, H), width: pct(88, W), aspectRatio: '1' }}
              >
                <span className="my-auto text-[19px] font-medium leading-none">Leads</span>
              </button>
            );
          }
          const labelTop = s.side === 'top' ? s.y - 66 : s.y + 26;
          return (
            <div key={s.id}>
              <button
                type="button"
                onClick={() => onPick(s.id)}
                aria-pressed={on}
                aria-label={`${s.name}: ${s.headline}`}
                className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-[background-color,box-shadow,color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
                  on
                    ? 'bg-primary-600 text-white shadow-[0_0_0_6px_rgba(79,70,229,0.18),0_6px_16px_rgba(79,70,229,0.35)]'
                    : 'bg-white text-primary-600 shadow-[0_4px_12px_rgba(26,16,64,0.14)] hover:shadow-[0_0_0_5px_rgba(79,70,229,0.12),0_4px_12px_rgba(26,16,64,0.14)]'
                }`}
                style={{ left: pct(s.x, W), top: pct(s.y, H) }}
              >
                {s.icon}
              </button>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => onPick(s.id)}
                className="absolute flex w-[108px] -translate-x-1/2 flex-col items-center text-center"
                style={{ left: pct(s.x, W), top: pct(labelTop, H) }}
              >
                <span className={`text-[15px] font-medium leading-tight tracking-[-0.01em] ${on ? 'text-primary-700' : 'text-surface-950'}`}>{s.name}</span>
                <span className="mt-0.5 text-[12px] leading-snug text-surface-500">{s.short}</span>
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onPick('report')}
        className="absolute flex w-[120px] -translate-x-1/2 flex-col items-center text-center"
        style={{ left: pct(LEADS.x, W), top: pct(LEADS.y + 70, H + 44) }}
      >
        <span className={`text-[15px] font-medium leading-tight ${active === 'report' ? 'text-primary-700' : 'text-surface-950'}`}>Pipeline report</span>
        <span className="mt-0.5 text-[12px] text-surface-500">Every Friday</span>
      </button>
    </div>
  );
}

/* Phones: the same seven steps as two groups of chips, then the strip. */
function Chips({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  const group = (title: string, ids: string[]) => (
    <div>
      <p className="text-[12px] font-semibold text-primary-700">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ids.map((id) => {
          const s = STEPS.find((x) => x.id === id)!;
          const on = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPick(id)}
              aria-pressed={on}
              className={`rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors ${on ? 'bg-primary-600 text-white' : 'bg-primary-50 text-surface-900'}`}
            >
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
  return (
    <div className="space-y-4">
      {group('Get chosen: your website', ['design', 'development', 'tracking'])}
      {group('Get found: Google and AI', ['content', 'mentions', 'reviews'])}
      {group('Leads', ['report'])}
    </div>
  );
}

function Strip({ step }: { step: Step }) {
  return (
    <div key={step.id} className="pw-strip grid gap-6 border-t border-surface-200 pt-6 md:min-h-[392px] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
      <div>
        <h3 className="text-[22px] font-medium leading-[1.15] tracking-[-0.025em] text-surface-950 sm:text-[24px]">{step.headline}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-surface-700">{step.body}</p>
        <div className={`mt-5 grid border-t border-surface-200 ${step.proof.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {step.proof.map((p, i) => (
            <div key={p.text} className={`pt-4 ${i > 0 ? 'sm:border-l sm:border-surface-200 sm:pl-4' : 'sm:pr-4'}`}>
              {p.badge === 'webflow' ? (
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/home-v11/logos/webflow-icon.png" alt="" width={30} height={30} className="h-[30px] w-[30px] flex-none rounded-lg" />
                  <div className="leading-tight">
                    <p className="text-[14px] font-semibold text-surface-950">Webflow</p>
                    <p className="whitespace-nowrap text-[12px] font-medium text-surface-600">Enterprise Partner</p>
                  </div>
                </div>
              ) : (
                p.big && <p className="text-[28px] font-medium leading-none tracking-[-0.04em] text-primary-600">{p.big}</p>
              )}
              <p className="mt-2 max-w-[260px] text-[13px] leading-snug text-surface-700">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="min-h-[240px]">{step.picture}</div>
    </div>
  );
}

export function ProposalWhoDoesIt({ index, initialStep = 'design' }: { index: number; initialStep?: string }) {
  const [active, setActive] = useState(initialStep);
  const step = STEPS.find((s) => s.id === active) ?? STEPS[0];
  return (
    <section
      id={`section-who-${index + 1}`}
      data-proposal-section="One team runs both sides"
      data-proposal-type="whoDoesIt"
      className="py-12 sm:py-14"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-[520px]">
          <h2 className="text-[22px] font-medium leading-tight tracking-[-0.03em] text-surface-950 sm:text-[26px]">One team runs both sides</h2>
          <p className="mt-2 text-[15px] text-surface-600">
            Getting found brings buyers in. Getting chosen turns them into leads. We do both, so nobody on your team has to manage the website.
          </p>
          {/* Arnel, 2026-10-26: we are not a full-service shop; each job is here because we do it as well as the best specialists. */}
          <p className="mt-3 text-[15px] font-medium leading-snug text-surface-950">
            We’re not a full-service agency. We only take on a job when our team does it as well as the best specialists in that field.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex">
            {TEAM.map((t, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={t}
                src={`/images/home-v11/team/${t}.jpg`}
                alt=""
                className={`h-10 w-10 rounded-full border-2 border-surface-50 object-cover ${i > 0 ? '-ml-3' : ''}`}
              />
            ))}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-surface-950">Your LoudFace team</p>
            <p className="text-[12px] text-surface-500">Strategy, design, build, content</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[22px] bg-primary-50/70 p-3 sm:p-4">
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(10,10,10,0.05),0_8px_24px_-16px_rgba(30,27,75,0.18)] sm:p-6">
          <p className="mb-4 hidden text-right text-[12px] text-surface-500 sm:block">Pick a step to see who does it</p>
          <div className="hidden sm:block">
            <Diagram active={active} onPick={setActive} />
          </div>
          <div className="sm:hidden">
            <Chips active={active} onPick={setActive} />
          </div>
          <div className="mt-6" aria-live="polite">
            <Strip step={step} />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4">
          <p className="flex items-center gap-2.5 text-[14px] text-surface-700">
            <span aria-hidden="true" className="h-5 w-5 flex-none rounded-full border-[1.5px] border-dashed border-surface-400" />
            Your team’s part: review the first three posts so we learn your voice. After that, you approve.
          </p>
          <p className="flex items-center gap-2 text-[14px] font-semibold text-primary-700">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary-600" />
            All of it, one flat fee
          </p>
        </div>
      </div>
    </section>
  );
}
