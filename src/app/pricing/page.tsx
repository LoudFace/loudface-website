/**
 * Pricing Page
 *
 * Data Sources:
 * - JSON: pricing.json (via content layer)
 *
 * Design: Trust & Authority style with Swiss Modernism influence.
 * Light base, strategic dark contrast for the plans section,
 * mathematical spacing, single accent color, no gradients.
 */
import type { Metadata } from 'next';
import { getPricingContent } from '@/lib/content-utils';
import {
  SectionContainer,
  SectionHeader,
  Button,
  Badge,
} from '@/components/ui';
import { FAQ, CTA } from '@/components/sections';

export const metadata: Metadata = {
  title: 'Pricing: Solo, Dual & Scale Autopilot Plans',
  description:
    'Pick your Autopilot tier: Solo for one focused track, Dual for Build + Growth in parallel, or Scale for multi-track velocity. Custom-scoped to your goals.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing: Solo, Dual & Scale Autopilot Plans | LoudFace',
    description:
      'Pick your Autopilot tier: Solo for one focused track, Dual for Build + Growth in parallel, or Scale for multi-track velocity. Custom-scoped to your goals.',
    type: 'website',
    url: '/pricing',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'LoudFace Pricing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Pricing: Solo, Dual & Scale Autopilot Plans | LoudFace',
    description:
      'Pick your Autopilot tier: Solo for one focused track, Dual for Build + Growth in parallel, or Scale for multi-track velocity. Custom-scoped to your goals.',
    images: ['/opengraph-image'],
  },
};

/* ─── SVG Icon helpers (no emojis) ─── */
function BuildIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function GrowthIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BoltIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

export default function PricingPage() {
  const content = getPricingContent();

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
      { '@type': 'ListItem', position: 2, name: 'Pricing' },
    ],
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Pricing: Solo, Dual & Scale Autopilot Plans',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: 'https://www.loudface.co/pricing',
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* ─── Hero (Light, centered, oversized type) ─── */}
      <SectionContainer padding="lg">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-100 border border-surface-200 px-4 py-1.5 text-xs font-medium text-surface-600 tracking-wide uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            {content.hero.eyebrow}
          </span>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-surface-900 leading-[1.1] tracking-tight text-balance"
            dangerouslySetInnerHTML={{ __html: content.hero.headline }}
          />

          <p
            className="mt-6 text-lg md:text-xl text-surface-500 max-w-2xl mx-auto leading-relaxed"
            data-speakable
          >
            {content.hero.description}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="lg" calTrigger>
              Book an Intro Call
            </Button>
            <Button variant="ghost" size="lg" href="#plans">
              View plans
            </Button>
          </div>
        </div>
      </SectionContainer>

      {/* ─── How It Works (Light, numbered steps) ─── */}
      <SectionContainer>
        <SectionHeader
          title="How It Works"
          highlightWord="Works"
          align="center"
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {content.howItWorks.steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line (desktop only, not on last item) */}
              {i < content.howItWorks.steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(50%+24px)] w-[calc(100%-48px)] h-px bg-surface-200" />
              )}

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-900 text-white text-sm font-mono font-medium mb-4 relative z-10">
                  {step.number}
                </div>
                <h3 className="text-base font-medium text-surface-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-surface-500 leading-relaxed max-w-[240px] mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* ─── Two Tracks (Light, sits before plans so the term is defined first) ─── */}
      <SectionContainer padding="sm">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 mb-4">
            {content.tracks.title.split(content.tracks.highlightWord)[0]}
            <span className="text-primary-600">{content.tracks.highlightWord}</span>
            {content.tracks.title.split(content.tracks.highlightWord)[1] || ''}
          </h2>
          <p className="text-surface-500 text-base max-w-xl mx-auto">
            {content.tracks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {content.tracks.items.map((track) => (
            <div
              key={track.label}
              className="rounded-2xl bg-white border border-surface-200 p-8 transition-colors hover:border-surface-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-900 text-white flex items-center justify-center">
                  {track.icon === 'build'
                    ? <BuildIcon className="w-5 h-5" />
                    : <GrowthIcon className="w-5 h-5" />
                  }
                </div>
                <div>
                  <h3 className="text-lg font-medium text-surface-900">{track.label}</h3>
                  <p className="text-sm text-primary-600">{track.tagline}</p>
                </div>
              </div>
              <p className="text-sm text-surface-600 leading-relaxed">
                {track.description}
              </p>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* ─── Plans (Dark section — the centrepiece) ─── */}
      <SectionContainer padding="lg" className="bg-surface-900" id="plans">
        <div className="text-center mb-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white">
            Choose your tier
          </h2>
        </div>
        <p className="text-sm text-surface-400 text-center max-w-xl mx-auto mb-3">
          {content.plans.qualifier}
        </p>
        <p className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-sm font-medium text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
            Engagements start from $5k/mo
          </span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {content.plans.tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl flex flex-col ${
                tier.featured
                  ? 'bg-white text-surface-900 shadow-xl shadow-black/20 lg:-my-4 lg:py-4'
                  : 'bg-surface-800 text-surface-300 border border-surface-700'
              }`}
            >
              <div className="p-8 flex flex-col flex-1">
                {tier.featured && tier.badge && (
                  <Badge
                    variant="subtle"
                    className="!bg-surface-900 !text-white !border-surface-900 mb-4 self-start"
                  >
                    {tier.badge}
                  </Badge>
                )}

                <h3 className={`text-xl font-medium ${tier.featured ? 'text-surface-900' : 'text-white'}`}>
                  {tier.name}
                </h3>
                <p className={`mt-1 text-sm font-medium ${tier.featured ? 'text-primary-600' : 'text-primary-400'}`}>
                  {tier.tagline}
                </p>
                <p className={`mt-4 text-sm leading-relaxed ${tier.featured ? 'text-surface-600' : 'text-surface-400'}`}>
                  {tier.description}
                </p>

                {/* Changes checklist */}
                {tier.changes && (
                  <ul className="mt-6 space-y-3 flex-1">
                    {tier.changes.map((change) => (
                      <li
                        key={change}
                        className={`flex items-start gap-3 text-sm ${tier.featured ? 'text-surface-600' : 'text-surface-300'}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          tier.featured
                            ? 'bg-surface-900 text-white'
                            : 'bg-surface-600 text-surface-300'
                        }`}>
                          <CheckIcon className="w-3 h-3" />
                        </span>
                        {change}
                      </li>
                    ))}
                  </ul>
                )}

                {tier.upgradeHint && (
                  <p className={`mt-6 text-xs italic ${tier.featured ? 'text-surface-400' : 'text-surface-500'}`}>
                    {tier.upgradeHint}
                  </p>
                )}

                <div className="mt-8">
                  <Button
                    variant={tier.featured ? 'primary' : 'outline'}
                    fullWidth
                    calTrigger
                    className={tier.featured
                      ? ''
                      : '!border-surface-500 !text-white hover:!bg-surface-700'
                    }
                  >
                    {tier.featured ? 'Start with Dual' : `Start with ${tier.name.split(' ')[0]}`}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* ─── Compare the Tiers (Light, clean table) ─── */}
      <SectionContainer>
        <SectionHeader
          title="Compare the Tiers"
          highlightWord="Tiers"
          align="center"
        />

        <div className="mt-12 rounded-2xl border border-surface-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="text-left py-4 px-6 font-medium text-surface-500 w-[28%]">
                    &nbsp;
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-surface-900 w-[24%]">
                    Solo
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-surface-900 w-[24%] bg-primary-50/50">
                    <span className="flex items-center gap-2">
                      Dual
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-500" />
                    </span>
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-surface-900 w-[24%]">
                    Scale
                  </th>
                </tr>
              </thead>
              <tbody>
                {content.comparison.rows.map((row, i) => (
                  <tr
                    key={row.label}
                    className={
                      i < content.comparison.rows.length - 1
                        ? 'border-b border-surface-100'
                        : ''
                    }
                  >
                    <td className="py-4 px-6 font-medium text-surface-900">
                      {row.label}
                    </td>
                    <td className="py-4 px-6 text-surface-600">
                      {row.solo}
                    </td>
                    <td className="py-4 px-6 text-surface-600 bg-primary-50/30">
                      {row.dual}
                    </td>
                    <td className="py-4 px-6 text-surface-600">
                      {row.scale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-surface-500 max-w-xl mx-auto">
          <p>{content.comparison.footnote}</p>
        </div>
      </SectionContainer>

      {/* ─── Beyond Retainers (Light, bordered card) ─── */}
      <SectionContainer padding="sm">
        <div className="rounded-2xl border border-surface-200 bg-surface-50 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-surface-900 text-white flex items-center justify-center">
              <BoltIcon className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-medium text-surface-900">
              {content.beyondRetainers.title}
            </h2>
          </div>
          <p className="text-surface-600 mb-8 max-w-xl">
            {content.beyondRetainers.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {content.beyondRetainers.options.map((option) => (
              <div
                key={option.title}
                className="rounded-xl bg-white border border-surface-200 p-6 transition-colors hover:border-surface-300 cursor-default"
              >
                <h3 className="font-medium text-surface-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-surface-500 leading-relaxed">
                  {option.description}
                </p>
              </div>
            ))}
          </div>

          <Button variant="outline" calTrigger>
            {content.beyondRetainers.ctaText}
          </Button>
        </div>
      </SectionContainer>

      {/* ─── What Every Plan Includes (Light, icon grid) ─── */}
      <SectionContainer>
        <SectionHeader
          title="What Every Plan Includes"
          highlightWord="Includes"
          align="center"
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.included.items.map((item) => (
            <div key={item.feature} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-surface-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-surface-900 text-sm">
                  {item.feature}
                </h3>
                <p className="mt-1 text-sm text-surface-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* ─── FAQ ─── */}
      <FAQ
        title={content.faq.title}
        items={content.faq.items}
        showFooter
      />

      {/* ─── CTA ─── */}
      <CTA
        title={content.cta.title}
        subtitle={content.cta.subtitle}
        ctaText={content.cta.ctaText}
      />
    </>
  );
}
