/**
 * fCMO Partnership Landing Page
 *
 * Data Sources:
 * - CMS: clients (logo strip), testimonials (social proof)
 * - Inline copy (partner-specific content)
 */
import type { Metadata } from 'next';
import { fetchCollection } from '@/lib/cms-data';
import type { Client, Testimonial } from '@/lib/types';
import { logoImage, avatarImage } from '@/lib/image-utils';
import { asset } from '@/lib/assets';
import {
  SectionContainer,
  SectionHeader,
  Button,
  BulletLabel,
  Card,
  LogoImage,
} from '@/components/ui';

export const metadata: Metadata = {
  title: 'fCMO Partner Program — 10% Lifetime Commission',
  description:
    'Partner program for fractional CMOs and growth advisors. Refer B2B SaaS clients, earn 10% of their retainer every month they stay. No caps, no expiry.',
  alternates: {
    canonical: '/partners',
  },
  openGraph: {
    title: 'fCMO Partner Program — 10% Lifetime Commission | LoudFace',
    description:
      'Partner program for fractional CMOs and growth advisors. Refer B2B SaaS clients, earn 10% of their retainer every month they stay. No caps, no expiry.',
    type: 'website',
    url: '/partners',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'LoudFace fCMO Partner Program',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'fCMO Partner Program — 10% Lifetime Commission | LoudFace',
    description:
      'Partner program for fractional CMOs and growth advisors. Refer B2B SaaS clients, earn 10% of their retainer every month they stay. No caps, no expiry.',
    images: ['/opengraph-image'],
  },
};

/* ─── Step data ─── */
const STEPS = [
  {
    number: '01',
    title: 'Apply',
    body: 'Fill out a short application. We review every submission manually and respond within 48 hours.',
    detail:
      'We keep the partner network selective. This works best when both sides are the right fit.',
  },
  {
    number: '02',
    title: 'Get your unique partner link',
    body: 'Once approved, you receive a unique tracking link. Every referral that comes through it is tagged to your account automatically.',
    detail: 'No manual follow-up, no attribution disputes.',
  },
  {
    number: '03',
    title: 'Make the introduction',
    body: 'Share your link or introduce us directly. We handle the full sales conversation, scoping, and onboarding. You stay in your advisory role.',
    detail: null,
  },
  {
    number: '04',
    title: 'Earn 10% for the lifetime of the engagement',
    body: 'Every month your referral is an active LoudFace client, you earn 10% of their retainer value. No expiry. No caps. Paid monthly.',
    detail: null,
  },
];

const RIGHT_FIT = [
  "You're a fractional CMO, growth advisor, or marketing consultant",
  'Your clients are B2B SaaS, fintech, AI, or tech companies at $1M\u2013$50M ARR',
  "You advise on strategy but don't run growth execution in-house",
  "You're confident enough in your recommendations to put your name behind them",
];

const NOT_FIT = [
  'You run a competing full-service agency',
  'Your clients are primarily B2C or e-commerce',
  "You're looking for a white-label or reseller arrangement",
];

const WHY_ITEMS = [
  'We only work with B2B SaaS, fintech, AI, and tech companies. No generalist client mix.',
  'We run SEO, AEO, and CRO as one integrated system. One team, one strategy, one accountability.',
  'We report on pipeline and revenue contribution. Not vanity metrics.',
  'We work as an extension of your advisory, not a replacement for it.',
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

  const showcaseClients = clients.filter((c) => c['showcase-logo']);
  // Pick a testimonial that has a profile image and body
  const featuredTestimonial = testimonials.find(
    (t) => t['profile-image']?.url && t['testimonial-body']
  );

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

          <h1 className="font-heading font-medium text-white leading-[1.1] tracking-tight">
            <span className="text-2xl sm:text-3xl md:text-4xl block">
              Your clients need growth execution.
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl block mt-3 text-balance">
              We deliver it. You earn from it.
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-surface-300 max-w-2xl leading-relaxed">
            A partner program for fractional CMOs, growth advisors, and marketing
            consultants who work with B2B SaaS and tech companies.
          </p>

          <div className="mt-10">
            <Button variant="primary" size="lg" href="https://loudface.notion.site/337b63394d10805f9bc5c22cf56c7c0f?pvs=105" className="rounded-full">
              Become a Partner
              <ArrowIcon className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Client logos */}
        {showcaseClients.length > 0 && (
          <div className="mt-16 pt-12 border-t border-surface-700">
            <p className="text-sm text-surface-500 mb-8 uppercase tracking-wide font-medium">
              Companies our partners have referred
            </p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-x-12 md:gap-y-8">
              {showcaseClients.map((client) => (
                <LogoImage
                  key={client.id}
                  src={
                    logoImage(client['colored-logo']?.url) ||
                    asset('/images/placeholder-logo.svg')
                  }
                  alt={client.name}
                  containerClassName="logo-item"
                  imgClassName="brightness-0 invert opacity-40 transition-opacity duration-200 hover:opacity-70"
                />
              ))}
            </div>
          </div>
        )}
      </SectionContainer>

      {/* ─── SECTION 2: Steps ─── */}
      <SectionContainer padding="lg">
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
              {step.detail && (
                <p className="mt-3 text-sm text-surface-500 leading-relaxed">
                  {step.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* ─── SECTION 3: What You Earn (Dark, bold) ─── */}
      <SectionContainer padding="lg" className="bg-surface-900 text-surface-300">
        <div className="max-w-3xl">
          <BulletLabel variant="dark">What you earn</BulletLabel>

          <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-medium text-white leading-tight tracking-tight">
            10% lifetime commission.{' '}
            <span className="text-primary-400">
              On a minimum retainer of $10K/month.
            </span>
          </h2>

          <p className="mt-6 text-lg text-surface-300 leading-relaxed max-w-2xl">
            Most referral programs offer a one-time finder&apos;s fee. Ours pays
            you every month the engagement is active.
          </p>

          <p className="mt-4 text-surface-400">
            No delivery responsibility. No client management. No expiry.
          </p>

          <div className="mt-10">
            <Button variant="primary" size="lg" href="https://loudface.notion.site/337b63394d10805f9bc5c22cf56c7c0f?pvs=105" className="rounded-full">
              Become a Partner
              <ArrowIcon className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </SectionContainer>

      {/* ─── SECTION 4: Why Partner ─── */}
      <SectionContainer padding="lg">
        <div className="max-w-3xl">
          <BulletLabel>Why partner with LoudFace</BulletLabel>

          <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight">
            Your reputation is on the line every time you make a recommendation.
          </h2>

          <p className="mt-6 text-lg text-surface-600 leading-relaxed">
            We understand that. Which is why we work the same way you do &mdash;
            accountable to pipeline outcomes.
          </p>

          <ul className="mt-8 space-y-4">
            {WHY_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-primary-600 mt-0.5 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <span className="text-surface-600 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        {featuredTestimonial && (
          <div className="mt-16 max-w-2xl rounded-2xl bg-surface-50 border border-surface-200 p-8 md:p-10">
            <div
              className="text-surface-700 leading-relaxed [&>p]:m-0"
              dangerouslySetInnerHTML={{
                __html: featuredTestimonial['testimonial-body'] || '',
              }}
            />
            <div className="mt-6 flex items-center gap-4">
              <img
                src={avatarImage(featuredTestimonial['profile-image']!.url)}
                alt={featuredTestimonial.name}
                width="48"
                height="48"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-surface-900">
                  {featuredTestimonial.name}
                </div>
                <div className="text-sm text-surface-500">
                  {featuredTestimonial.role}
                </div>
              </div>
            </div>
          </div>
        )}
      </SectionContainer>

      {/* ─── SECTION 5: Criteria ─── */}
      <SectionContainer padding="lg" className="bg-surface-50">
        <div className="max-w-3xl">
          <BulletLabel>Partner criteria</BulletLabel>

          <h2 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight text-balance">
            We&apos;re selective about who we partner with, and we expect the same
            standard in return.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Right fit */}
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

          {/* Not a fit */}
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

      {/* ─── SECTION 6: Final CTA ─── */}
      <SectionContainer padding="lg" className="bg-surface-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white leading-tight tracking-tight text-balance">
            If you&apos;re advising B2B SaaS companies on growth, this
            conversation is worth having.
          </h2>

          <p className="mt-6 text-lg text-surface-300 leading-relaxed">
            One introduction to the right client. 10% of their retainer. Every
            month they stay.
          </p>

          <p className="mt-2 text-surface-400">
            Apply below and we&apos;ll follow up within 48 hours.
          </p>

          <div className="mt-10">
            <Button
              variant="primary"
              size="lg"
              href="https://loudface.notion.site/337b63394d10805f9bc5c22cf56c7c0f?pvs=105"
                           className="px-8 py-4 rounded-full hover:-translate-y-0.5"
            >
              Become a Partner
              <ArrowIcon className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
