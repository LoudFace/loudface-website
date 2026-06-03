/**
 * fCMO Partnership Landing Page (rewrite — May 2026)
 *
 * Data Sources:
 * - CMS: clients (logo strip), testimonials (social proof)
 * - Inline copy (partner-specific content)
 *
 * Architecture notes (read the brief in /docs/partners-page-rewrite-may-2026.md):
 * - Logo strip + 5-star reviews + testimonial headshots are delivered via the
 *   shared <Partners> component (same instance used on the homepage). It pulls
 *   tagline + star labels from src/data/content/partners.json so we do not
 *   duplicate the data on this page.
 * - Detail testimonial cards use the shared <TestimonialGrid>.
 * - Application form is a native client component posting to /api/partner-apply
 *   (replaces the Notion form link).
 * - Mobile sticky CTA is its own client component, scrolls to #apply.
 */
import type { Metadata } from 'next';
import { fetchCollection } from '@/lib/cms-data';
import type { Client, Testimonial } from '@/lib/types';
import {
  SectionContainer,
  SectionHeader,
  BulletLabel,
  Partners,
  TestimonialGrid,
  FAQ,
  CTA,
} from '@/components';
import { PartnerApplicationForm } from './_components/PartnerApplicationForm';
import { MobileStickyCTA } from './_components/MobileStickyCTA';
import { PartnersCTALink } from './_components/PartnersCTALink';

export const metadata: Metadata = {
  title: 'fCMO Partner Program — 10% Lifetime Commission',
  description:
    'Partner program for fractional CMOs and growth advisors. Refer clients, earn 10% of their retainer every month they stay. No caps, no expiry.',
  alternates: {
    canonical: '/partners',
  },
  openGraph: {
    title: 'fCMO Partner Program — 10% Lifetime Commission | LoudFace',
    description:
      'Refer a client. Earn 10% of their retainer for as long as they stay. No caps. No expiry.',
    type: 'website',
    url: '/partners',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      {
        url: '/partners/opengraph-image',
        width: 1200,
        height: 630,
        alt: '10% lifetime commission — LoudFace Partner Program',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'fCMO Partner Program — 10% Lifetime Commission | LoudFace',
    description:
      'Refer a client. Earn 10% of their retainer for as long as they stay. No caps. No expiry.',
    images: ['/partners/opengraph-image'],
  },
};

/* ─── Step data ─── */
const STEPS = [
  {
    number: '01',
    title: 'Apply (5 minutes)',
    body: 'Quick form. We review every application manually and reply within 48 hours with either approval, or a no with a reason.',
    detail:
      'We keep the partner network selective. This works best when both sides are the right fit.',
  },
  {
    number: '02',
    title: 'Get your partner kit',
    body: 'Approved partners receive:',
    bullets: [
      'A unique UTM-tagged link (or a warm-intro template if you prefer that route)',
      'A partner agreement that takes 2 minutes to read',
      'Direct Slack/email access to Arnel (CEO) for deal questions',
    ],
  },
  {
    number: '03',
    title: 'Refer a client',
    body: 'Send them your link, or introduce us over email. We handle discovery, scoping, proposal, and onboarding. You stay in your advisory seat.',
    detail: null,
  },
  {
    number: '04',
    title: 'Get paid every month they stay',
    body: '10% of their retainer, paid by the 5th of every month, for as long as they’re a client. Not 6 months. Not 12 months. Lifetime.',
    detail: 'First payment lands 30 days after their first invoice is paid.',
  },
];

const RIGHT_FIT = [
  "You're a fractional CMO, growth advisor, or marketing consultant",
  'Your clients are businesses that need growth execution',
  "You advise on strategy but don't run growth execution in-house",
  "You're confident enough in your recommendations to put your name behind them",
  'You make 1–3 client recommendations per quarter where LoudFace’s service would be a real solve',
];

const NOT_FIT = [
  'You run a competing full-service agency',
  'Your clients are primarily B2C or e-commerce',
  "You're looking for a white-label or reseller arrangement",
  'You expect us to do the selling and your only role is the introduction — the intro is half the work; the recommendation needs to be warm and contextual',
];

const WHY_ITEMS = [
  'SEO + AEO + CRO as one integrated system. One team, one strategy, one accountability.',
  'We report on pipeline and revenue. Not vanity metrics.',
  'We work as an extension of your advisory, not a replacement.',
  '200+ B2B SaaS sites shipped. 4+ years as a Webflow Enterprise Partner.',
  'Average launch in <6 weeks. Most agencies quote 12–16.',
];

const EARNINGS_ROWS = [
  { retainer: '$10,000 / month', monthly: '$1,000', y1: '$12,000', y2: '$24,000' },
  { retainer: '$15,000 / month', monthly: '$1,500', y1: '$18,000', y2: '$36,000' },
  { retainer: '$25,000 / month', monthly: '$2,500', y1: '$30,000', y2: '$60,000' },
];

const FAQ_ITEMS = [
  {
    question: 'Do I have to sign anything formal?',
    answer:
      'Yes — a 1-page partner agreement covering commission terms, payout cadence, and confidentiality. Takes 2 minutes to read. We’ll send it on approval.',
  },
  {
    question: 'How do you track who referred who?',
    answer:
      'Two ways. Either share your unique UTM-tagged link with your client (we attribute the lead automatically when they apply), or send a warm intro to arnel@loudface.co — we tag the lead to your account manually. Both methods are valid and pay out identically.',
  },
  {
    question: 'When do I get paid?',
    answer:
      'Monthly. First payout lands 30 days after your referral’s first invoice is paid. After that, by the 5th of every month, as long as they’re an active client. Paid via Wise, PayPal, or bank transfer (international friendly).',
  },
  {
    question: 'What happens if my referral cancels in month 1?',
    answer:
      'If the client churns within the first 60 days, the commission is clawed back from your next payout. After 60 days, no clawback — it’s yours.',
  },
  {
    question: 'Can I refer someone I’m currently advising?',
    answer:
      'Yes. That’s our ideal partner setup — you advise on strategy, we run execution. Just be transparent with your client that you’re earning a referral fee. We’ll never disclose it without your sign-off.',
  },
  {
    question: 'What if my referral wants to negotiate scope or pricing?',
    answer:
      'We handle all that. Your job ends at the intro. We’ll keep you looped in on the deal status (lost / won / paused) within 5 business days of close or no-go.',
  },
  {
    question: 'Is there a cap on how many referrals I can make?',
    answer: 'No. The more you refer, the more you earn. Top partners earn $30k+/year.',
  },
  {
    question: 'Why 10% lifetime and not a one-time fee?',
    answer:
      'Because a one-time fee turns referrals into a transaction. Lifetime payouts mean we both win when the client wins, and we both lose when they churn. It keeps our incentives aligned with yours and your client’s.',
  },
  {
    question: 'What does the partner agreement actually cover?',
    answer:
      'Commission rate (10%), payout schedule (monthly), tracking method, clawback terms (60 days), confidentiality on client info, and a 12-month notice clause if either side wants to wind down.',
  },
];

/* ─── Icons ─── */
function ArrowIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function CheckCircle({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircle({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

export default async function PartnersPage() {
  const [clients, testimonials] = await Promise.all([
    fetchCollection<Client>('clients'),
    fetchCollection<Testimonial>('testimonials'),
  ]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Partner Program' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ─── SECTION 1: Hero (Dark) ─── */}
      <SectionContainer padding="lg" className="bg-surface-900 text-surface-300">
        <div className="max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-medium text-white tracking-wide uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
            LoudFace Partner Program
          </span>

          <h1 className="font-heading font-medium text-white leading-[1.1] tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-balance">
            Refer a client. Earn 10% of their retainer for as long as they stay
            with us.
          </h1>

          <p className="mt-8 text-lg md:text-xl text-surface-300 max-w-2xl leading-relaxed">
            No caps. No expiry. The LoudFace Partner Program is built for
            fractional CMOs, growth advisors, and consultants who advise clients
            but don&apos;t want to run execution.
          </p>

          <div className="mt-10">
            <PartnersCTALink
              source="hero"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary-600 text-white font-medium text-base transition-colors hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
            >
              Apply in 2 minutes
              <ArrowIcon className="ml-2 w-5 h-5" />
            </PartnersCTALink>
          </div>
        </div>
      </SectionContainer>

      {/* ─── SECTION 2: Shared social-proof block (5-star + headshots + tagline + logos) ─── */}
      <Partners
        testimonials={testimonials}
        clients={clients}
      />

      {/* ─── SECTION 3: Earnings example ─── */}
      <SectionContainer padding="lg">
        <div className="max-w-3xl">
          <BulletLabel>What you&apos;d actually earn</BulletLabel>
          <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight">
            Math beats adjectives.
          </h2>
          <p className="mt-6 text-lg text-surface-600 leading-relaxed">
            10% of the client&apos;s monthly retainer, paid every month they
            stay active. Here&apos;s how that compounds.
          </p>
        </div>

        {/* Desktop table */}
        <div className="mt-10 hidden md:block overflow-hidden rounded-2xl border border-surface-200">
          <table className="w-full text-left">
            <thead className="bg-surface-50">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-surface-700">Client retainer</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-700">Your monthly payout</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-700">After 12 months</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-700">After 24 months</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 bg-white">
              {EARNINGS_ROWS.map((row) => (
                <tr key={row.retainer}>
                  <td className="px-6 py-5 text-surface-900 font-medium">{row.retainer}</td>
                  <td className="px-6 py-5 text-primary-600 font-mono font-medium">{row.monthly}</td>
                  <td className="px-6 py-5 text-surface-700 font-mono">{row.y1}</td>
                  <td className="px-6 py-5 text-surface-900 font-mono font-medium">{row.y2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards */}
        <div className="mt-10 md:hidden space-y-4">
          {EARNINGS_ROWS.map((row) => (
            <div
              key={row.retainer}
              className="rounded-2xl border border-surface-200 bg-white p-6"
            >
              <div className="text-xs font-mono uppercase tracking-wider text-surface-500">
                Client retainer
              </div>
              <div className="mt-1 text-lg font-medium text-surface-900">{row.retainer}</div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-2xs uppercase tracking-wider text-surface-500">Monthly</div>
                  <div className="mt-1 font-mono font-medium text-primary-600">{row.monthly}</div>
                </div>
                <div>
                  <div className="text-2xs uppercase tracking-wider text-surface-500">12 mo</div>
                  <div className="mt-1 font-mono text-surface-700">{row.y1}</div>
                </div>
                <div>
                  <div className="text-2xs uppercase tracking-wider text-surface-500">24 mo</div>
                  <div className="mt-1 font-mono font-medium text-surface-900">{row.y2}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-surface-500 italic">
          Hypothetical based on our average retainer length. We&apos;ll replace
          this with real partner numbers once the first 2–3 cohort
          commissions clear.
        </p>
      </SectionContainer>

      {/* ─── SECTION 4: How it works (4 steps) ─── */}
      <SectionContainer padding="lg" className="bg-surface-50">
        <SectionHeader
          title="Simple structure. Serious upside."
          highlightWord="upside."
        />

        <div className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-surface-200 bg-white p-8 transition-colors hover:border-surface-300"
            >
              <span className="inline-block font-mono text-sm font-medium text-primary-600 mb-4">
                Step {step.number}
              </span>
              <h3 className="text-lg font-medium text-surface-900 mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-surface-600 leading-relaxed">
                {step.body}
              </p>
              {step.bullets && (
                <ul className="mt-4 space-y-2">
                  {step.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-surface-600">
                      <span className="mt-1 w-1 h-1 rounded-full bg-primary-600 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {step.detail && (
                <p className="mt-3 text-sm text-surface-500 leading-relaxed">
                  {step.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* ─── SECTION 5: What you earn / Who qualifies (Dark) ─── */}
      <SectionContainer padding="lg" className="bg-surface-900 text-surface-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <BulletLabel variant="dark">What you earn</BulletLabel>
            <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-medium text-white leading-tight tracking-tight">
              10% of retainer, every month they stay.
            </h2>
            <p className="mt-6 text-surface-300 leading-relaxed">
              Paid by the 5th. No caps. No expiry. Most referral programs offer
              a one-time finder&apos;s fee. Ours pays every month the
              engagement is active.
            </p>
          </div>

          <div>
            <BulletLabel variant="dark">Who qualifies</BulletLabel>
            <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-medium text-white leading-tight tracking-tight">
              <span className="text-primary-400">$10K/month</span> minimum
              retainer.
            </h2>
            <p className="mt-6 text-surface-300 leading-relaxed">
              Referrals must have a minimum retainer of at least $10K/month.
              Anything below isn&apos;t a fit — for them or for us.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <PartnersCTALink
            source="earn_section"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary-600 text-white font-medium text-base transition-colors hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
          >
            Apply in 2 minutes
            <ArrowIcon className="ml-2 w-5 h-5" />
          </PartnersCTALink>
        </div>
      </SectionContainer>

      {/* ─── SECTION 6: Why partner ─── */}
      <SectionContainer padding="lg">
        <div className="max-w-3xl">
          <BulletLabel>Why partner with LoudFace</BulletLabel>

          <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight text-balance">
            Your reputation goes out with every recommendation. We work like we
            know that.
          </h2>

          <ul className="mt-8 space-y-4">
            {WHY_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-primary-600 mt-0.5 shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </span>
                <span className="text-surface-600 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionContainer>

      {/* ─── SECTION 7: Testimonials carousel ─── */}
      <TestimonialGrid
        testimonials={testimonials}
        title="The clients you'd be referring to us"
        highlightWord="us"
        subtitle="A few words from the founders and operators we work with day-to-day."
        variant="gray"
      />

      {/* ─── SECTION 8: Criteria ─── */}
      <SectionContainer padding="lg">
        <div className="max-w-3xl">
          <BulletLabel>Partner criteria</BulletLabel>

          <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight text-balance">
            We&apos;re selective about who we partner with, and we expect the
            same standard in return.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl bg-white border border-surface-200 p-8">
            <h3 className="text-lg font-medium text-surface-900 mb-6">
              You&apos;re the right fit if:
            </h3>
            <ul className="space-y-4">
              {RIGHT_FIT.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-surface-600 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white border border-surface-200 p-8">
            <h3 className="text-lg font-medium text-surface-900 mb-6">
              This isn&apos;t the right fit if:
            </h3>
            <ul className="space-y-4">
              {NOT_FIT.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  <span className="text-sm text-surface-600 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionContainer>

      {/* ─── SECTION 9: FAQ ─── */}
      <FAQ
        title="Common questions about the partner program"
        items={FAQ_ITEMS}
        showFooter={false}
      />

      {/* ─── SECTION 10: Application form ─── */}
      <SectionContainer id="apply" padding="lg" className="bg-surface-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <BulletLabel className="justify-center">Apply now</BulletLabel>
            <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight text-balance">
              One conversation. One referral. 10% for as long as they stay.
            </h2>
            <p className="mt-6 text-lg text-surface-600 leading-relaxed">
              Apply below. We respond within 48 hours, and the form takes about
              2 minutes. If we&apos;re not a fit, we&apos;ll tell you why.
            </p>
          </div>

          <div className="mt-10 rounded-2xl bg-white border border-surface-200 p-6 md:p-8">
            <PartnerApplicationForm />
          </div>
        </div>
      </SectionContainer>

      {/* ─── SECTION 11: Final CTA ─── */}
      <CTA
        variant="dark"
        title="Have a client we should meet?"
        subtitle="If you're advising clients on growth and want to refer execution, this conversation is worth having."
        ctaText="Apply to the Partner Program"
        ctaHref="#apply"
      />

      <MobileStickyCTA />
    </>
  );
}
