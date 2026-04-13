/**
 * AI Visibility Audit — Marketing Landing Page
 *
 * Data Sources:
 * - CMS: clients (logo strip), testimonials (social proof)
 * - Inline copy (audit-specific content)
 *
 * Separate from the existing /audit tool page which lives in the (audit) route
 * group with its own layout (no header/footer). This page uses the standard
 * site layout with full marketing copy.
 */
import type { Metadata } from 'next';
import { fetchCollection } from '@/lib/cms-data';
import type { Client, Testimonial } from '@/lib/types';
import { logoImage, avatarImage } from '@/lib/image-utils';
import { asset } from '@/lib/assets';
import {
  SectionContainer,
  BulletLabel,
  Button,
  LogoImage,
} from '@/components/ui';
import { FAQ } from '@/components/sections';
import { AuditLandingForm } from './_components/AuditLandingForm';

export const metadata: Metadata = {
  title: 'Free AI Visibility Audit for B2B SaaS',
  description:
    'Check where your brand stands across ChatGPT, Perplexity, and Google SGE versus competitors. Get a free AI search presence score and a personal Loom walkthrough.',
  alternates: {
    canonical: '/ai-audit',
  },
  openGraph: {
    title: 'Free AI Visibility Audit for B2B SaaS | LoudFace',
    description:
      'Check where your brand stands across ChatGPT, Perplexity, and Google SGE versus competitors. Get a free AI search presence score and a personal Loom walkthrough.',
    type: 'website',
    url: '/ai-audit',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'LoudFace AI Visibility Audit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Free AI Visibility Audit for B2B SaaS | LoudFace',
    description:
      'Check where your brand stands across ChatGPT, Perplexity, and Google SGE versus competitors. Get a free AI search presence score and a personal Loom walkthrough.',
    images: ['/opengraph-image'],
  },
};

const HERO_BENEFITS = [
  'Your brand\u2019s AI search presence score',
  'Side-by-side competitor comparison across AI platforms',
  'One fix you can implement within a week',
  'A personal Loom from Arnel on AEO gaps killing your pipeline visibility',
];

const AUDIT_REVEALS = [
  'Your AI search presence score across ChatGPT, Perplexity, and Google SGE',
  'Side-by-side comparison vs your top 3 competitors',
  'The exact queries your buyers are running on AI platforms',
  'The gap between your Google rankings and your AI visibility',
  'A personal Loom from Arnel detailing one specific thing you can fix this week',
];

const FAQ_ITEMS = [
  {
    question: 'Do I have to book a call?',
    answer:
      'No. You get the full report first. If you want to talk through what it means, there\u2019s an option to book time with Arnel after delivery. No pressure.',
  },
  {
    question: 'How is this different from a generic SEO audit?',
    answer:
      'It\u2019s not an SEO audit. We\u2019re measuring AI search visibility \u2014 whether your brand gets cited by ChatGPT and Perplexity when your buyers search for solutions. Most tools don\u2019t track this at all.',
  },
  {
    question: 'What do you do with my information?',
    answer:
      'We run your audit and send you the report. That\u2019s it. No spam, no auto-enrollment in a sequence.',
  },
];

function ArrowIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  );
}

export default async function AiAuditPage() {
  const [clients, testimonials] = await Promise.all([
    fetchCollection<Client>('clients'),
    fetchCollection<Testimonial>('testimonials'),
  ]);

  const showcaseClients = clients.filter((c) => c['showcase-logo']);
  const displayTestimonials = testimonials.filter(
    (t) => t['profile-image']?.url && t['testimonial-body']
  );

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.loudface.co',
      },
      { '@type': 'ListItem', position: 2, name: 'AI Visibility Audit' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ─── HERO: Headline + Form ─── */}
      <SectionContainer padding="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Copy */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-medium text-surface-900 leading-[1.1] tracking-tight text-balance">
              Your competitors are winning deals on ChatGPT searches.
              <span className="block mt-2 text-primary-600">
                How far behind are you?
              </span>
            </h1>

            <p className="mt-6 text-lg text-surface-600 leading-relaxed max-w-lg">
              Check where your brand stands across ChatGPT, Perplexity, and
              Google SGE searches &mdash; versus your top competitors.
            </p>

            <div className="mt-8">
              <p className="text-sm font-medium text-surface-900 mb-4">
                What you get:
              </p>
              <ul className="space-y-3">
                {HERO_BENEFITS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-primary-600 mt-0.5 shrink-0">
                      <ArrowIcon className="w-4 h-4" />
                    </span>
                    <span className="text-sm text-surface-600 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Form */}
          <div className="rounded-2xl border border-surface-200 bg-surface-50 p-6 md:p-8 shadow-sm">
            <AuditLandingForm />
          </div>
        </div>

        {/* Trust line with logos */}
        {showcaseClients.length > 0 && (
          <div className="mt-16 pt-12 border-t border-surface-200">
            <p className="text-sm text-surface-500 mb-6">
              Used by B2B SaaS teams at
            </p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-x-10 md:gap-y-6">
              {showcaseClients.slice(0, 8).map((client) => (
                <LogoImage
                  key={client.id}
                  src={
                    logoImage(client['colored-logo']?.url) ||
                    asset('/images/placeholder-logo.svg')
                  }
                  alt={client.name}
                  containerClassName="logo-item"
                  imgClassName="grayscale opacity-50 transition-opacity duration-200 hover:opacity-80"
                />
              ))}
            </div>
          </div>
        )}
      </SectionContainer>

      {/* ─── Testimonials ─── */}
      {displayTestimonials.length > 0 && (
        <SectionContainer className="bg-surface-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTestimonials.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="rounded-2xl bg-white border border-surface-200 p-6 md:p-8"
              >
                <div
                  className="text-sm text-surface-600 leading-relaxed [&>p]:m-0 line-clamp-5"
                  dangerouslySetInnerHTML={{
                    __html: t['testimonial-body'] || '',
                  }}
                />
                <div className="mt-6 flex items-center gap-3">
                  <img
                    src={avatarImage(t['profile-image']!.url)}
                    alt={t.name}
                    width="40"
                    height="40"
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-surface-900">
                      {t.name}
                    </div>
                    <div className="text-2xs text-surface-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionContainer>
      )}

      {/* ─── Problem Block (Dark) ─── */}
      <SectionContainer padding="lg" className="bg-surface-900 text-surface-300">
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white leading-tight tracking-tight text-balance">
            B2B buyers have changed how they shortlist vendors.
          </h2>

          <p className="mt-6 text-lg text-surface-300 leading-relaxed">
            They&apos;re not starting on Google. They&apos;re asking ChatGPT and
            buying from whoever shows up in that answer.
          </p>

          <p className="mt-4 text-surface-400">
            If your competitor is showing up in that answer and you&apos;re not,
            the deal starts without you.
          </p>

          <p className="mt-4 text-white font-medium">
            Your AI search presence should catch up to this shift.
          </p>

          <div className="mt-12">
            <p className="text-sm font-medium text-white mb-6">
              Run the AI visibility audit to see:
            </p>
            <ul className="space-y-4">
              {AUDIT_REVEALS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-primary-400 mt-0.5 shrink-0">
                    <ArrowIcon className="w-4 h-4" />
                  </span>
                  <span className="text-surface-300 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <Button
              variant="primary"
              size="lg"
              href="#audit-form"
              className="rounded-full"
            >
              Run My Audit
              <svg
                className="ml-2 w-5 h-5"
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
            </Button>
          </div>
        </div>
      </SectionContainer>

      {/* ─── FAQ ─── */}
      <FAQ
        title="Common questions"
        items={FAQ_ITEMS}
        showFooter={false}
        variant="open"
      />

      {/* ─── Final CTA ─── */}
      <SectionContainer padding="lg" className="bg-surface-50" id="audit-form">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-medium text-surface-900 text-center mb-8">
            Run your free AI visibility audit
          </h2>
          <div className="rounded-2xl border border-surface-200 bg-white p-6 md:p-8 shadow-sm">
            <AuditLandingForm />
          </div>
          <p className="mt-4 text-2xs text-surface-500 text-center">
            No spam. No auto-enrollment. Just your audit.
          </p>
        </div>
      </SectionContainer>
    </>
  );
}
