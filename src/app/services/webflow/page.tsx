/**
 * Webflow Development Service Page
 *
 * Data Sources:
 * - JSON: services-webflow.json (via content layer)
 * - CMS: case-studies, clients, industries (for case studies section)
 */
import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { fetchHomepageData, getAccessToken, getEmptyHomepageData } from '@/lib/cms-data';
import { getServicesWebflowContent } from '@/lib/content-utils';
import { asset } from '@/lib/assets';
import { getContrastColors } from '@/lib/color-utils';
import { caseStudyThumbnail, logoImage } from '@/lib/image-utils';
import { SectionContainer, SectionHeader, Card, Button, BulletLabel } from '@/components/ui';
import { FAQ, CTA, RelatedServices } from '@/components/sections';
import type { CaseStudy, Client, Industry } from '@/lib/types';

// Dynamic import below-fold visual components — defers client JS hydration
const PixelBreakpointAnimation = dynamic(
  () => import('@/components/ui/PixelBreakpointAnimation').then(m => ({ default: m.PixelBreakpointAnimation })),
);
const ScalableGridAnimation = dynamic(
  () => import('@/components/ui/ScalableGridAnimation').then(m => ({ default: m.ScalableGridAnimation })),
);
const ComponentAssemblyVisual = dynamic(
  () => import('@/components/ui/ComponentAssemblyVisual').then(m => ({ default: m.ComponentAssemblyVisual })),
);

export const metadata: Metadata = {
  title: 'Webflow Development Services',
  description:
    'Scale-first Webflow development with component-based architecture. Split test faster, ship landing pages in hours, and grow without technical debt.',
  alternates: {
    canonical: '/services/webflow',
  },
};

export default async function WebflowServicePage() {
  const content = getServicesWebflowContent();

  // CMS data for case studies section
  const accessToken = getAccessToken();
  const cmsData = accessToken
    ? await fetchHomepageData(accessToken)
    : getEmptyHomepageData();

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Webflow Development Services',
    description:
      'Scale-first Webflow development with component-based architecture. Split test faster, ship landing pages in hours, and grow without technical debt.',
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: 'Webflow Development',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co/' },
      { '@type': 'ListItem', position: 2, name: 'Webflow Development' },
    ],
  };

  const {
    caseStudies: rawCaseStudies,
    clients: clientsMap,
    industries: industriesMap,
  } = cmsData;

  const caseStudies = rawCaseStudies as (CaseStudy & { id: string })[];
  const featured = caseStudies
    .filter((cs) => cs.featured && cs['paragraph-summary'])
    .slice(0, 3);

  function getClient(id: string | undefined): Client | undefined {
    if (!id) return undefined;
    return clientsMap.get(id);
  }

  function getIndustry(id: string | undefined): Industry | undefined {
    if (!id) return undefined;
    return industriesMap.get(id);
  }

  return (
    <>
      {/* Structured Data */}
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ─── Section 1: Hero ─── */}
      <SectionContainer padding="lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="lg:col-span-7">
            <BulletLabel>{content.hero.eyebrow}</BulletLabel>

            <h1
              className="mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900"
              dangerouslySetInnerHTML={{ __html: content.hero.headline }}
            />

            <p className="mt-6 text-lg text-surface-600 max-w-xl">
              {content.hero.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="primary" size="lg" calTrigger>
                {content.hero.primaryCta}
              </Button>
              <Button variant="outline" size="lg" href="/case-studies">
                {content.hero.secondaryCta}
              </Button>
            </div>
          </div>

          {/* Right — Component Assembly Animation */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center">
            <ComponentAssemblyVisual />
          </div>
        </div>

        {/* Credibility Stats Strip */}
        <div className="mt-12 pt-8 border-t border-surface-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {content.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <span className="text-2xl md:text-3xl font-mono font-medium text-surface-900">
                  {stat.value}
                </span>
                <p className="mt-1 text-sm text-surface-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* ─── Section 2: Problem ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.problems.title}
          highlightWord={content.problems.highlightWord}
        />

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {content.problems.items.map((item) => (
            <Card key={item.number} padding="lg" hover={false}>
              <span className="block text-7xl font-mono font-bold text-surface-100 leading-none select-none">
                {item.number}
              </span>
              <h3 className="text-xl font-medium text-surface-900 -mt-4">
                {item.title}
              </h3>
              <p className="mt-3 text-surface-600">{item.description}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* ─── Section 3: Approach (Dark) ─── */}
      <SectionContainer padding="lg" className="bg-surface-900 text-surface-300">
        <SectionHeader
          title={content.approach.title}
          highlightWord={content.approach.highlightWord}
          variant="dark"
        />

        <p className="mt-6 text-lg text-surface-300 max-w-3xl">
          {content.approach.intro}
        </p>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden lg:block mt-16">
          {/* Timeline line */}
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-px bg-surface-700" />

            <div className="grid grid-cols-4 gap-8">
              {content.approach.steps.map((step) => (
                <div key={step.number} className="relative">
                  {/* Numbered node */}
                  <div className="relative z-10 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-mono text-sm font-medium mx-auto">
                    {step.number}
                  </div>

                  {/* Card below */}
                  <Card variant="glass" padding="md" hover={false} className="mt-6">
                    <h3 className="text-lg font-medium text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-surface-400">
                      {step.description}
                    </p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="lg:hidden mt-10">
          <div className="relative border-l-2 border-surface-700 ml-5 space-y-8">
            {content.approach.steps.map((step) => (
              <div key={step.number} className="relative pl-10">
                {/* Numbered node */}
                <div className="absolute -left-5 top-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-mono text-sm font-medium">
                  {step.number}
                </div>

                <Card variant="glass" padding="md" hover={false}>
                  <h3 className="text-lg font-medium text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-surface-400">
                    {step.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* ─── Section 4: Capabilities Bento Grid ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.capabilities.title}
          highlightWord={content.capabilities.highlightWord}
        />

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

          {/* ── Card 1: Trackable Analytics — SVG area chart ── */}
          <Card padding="none" hover={false}>
            <div className="p-5 overflow-hidden" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-4 relative">
                {/* Metric callout */}
                <div className="absolute top-3 right-3 bg-white rounded-lg shadow-sm border border-surface-200 px-3 py-2 z-10">
                  <span className="block text-2xs text-surface-500">Conversions</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-mono font-semibold text-surface-900">+147%</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                      <path d="M7 3L12 9H2L7 3Z" fill="var(--color-success)" />
                    </svg>
                  </div>
                </div>
                {/* Chart */}
                <svg className="w-full h-full" viewBox="0 0 320 120" fill="none">
                  <defs>
                    <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[30, 55, 80].map((y) => (
                    <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="var(--color-surface-200)" strokeWidth="1" strokeDasharray="4 4" />
                  ))}
                  {/* Area */}
                  <path
                    d="M0,95 C25,88 45,90 70,78 C95,66 115,72 140,58 C165,44 185,50 210,38 C235,26 255,22 280,14 C295,9 310,6 320,4 L320,120 L0,120Z"
                    fill="url(#chart-fill)"
                  />
                  {/* Line */}
                  <path
                    d="M0,95 C25,88 45,90 70,78 C95,66 115,72 140,58 C165,44 185,50 210,38 C235,26 255,22 280,14 C295,9 310,6 320,4"
                    stroke="var(--color-primary-500)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* End dot with glow */}
                  <circle cx="320" cy="4" r="6" fill="var(--color-primary-500)" fillOpacity="0.2" />
                  <circle cx="320" cy="4" r="3.5" fill="var(--color-primary-500)" />
                </svg>
              </div>
            </div>
            <div className="px-5 pb-5">
              <h3 className="text-lg font-medium text-surface-900">
                {content.capabilities.items[0].title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.capabilities.items[0].description}
              </p>
            </div>
          </Card>

          {/* ── Card 2: Integrations — logo marquee with brand icons ── */}
          <Card padding="none" hover={false}>
            <div className="p-5 overflow-hidden" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 flex flex-col justify-center gap-2.5 overflow-hidden">
                {/* Row 1 */}
                <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                  <div className="flex gap-2.5 animate-marquee" style={{ animationDuration: '18s' }}>
                    {[...Array(2)].flatMap((_, dup) =>
                      [
                        { name: 'HubSpot', domain: 'hubspot.com' },
                        { name: 'Zapier', domain: 'zapier.com' },
                        { name: 'Salesforce', domain: 'salesforce.com' },
                        { name: 'Stripe', domain: 'stripe.com' },
                        { name: 'Slack', domain: 'slack.com' },
                        { name: 'Notion', domain: 'notion.so' },
                      ].map((b, i) => (
                        <span key={`${dup}-${i}`} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-surface-200 shadow-sm whitespace-nowrap">
                          <img src={`https://cdn.brandfetch.io/${b.domain}/icon/fallback/transparent?c=1idmHW4h6BoV1E9hJTF`} alt="" className="w-4 h-4 rounded-sm object-contain" loading="lazy" />
                          <span className="text-sm font-medium text-surface-700">{b.name}</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
                {/* Row 2 — reverse */}
                <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                  <div className="flex gap-2.5 animate-marquee [animation-direction:reverse]" style={{ animationDuration: '22s' }}>
                    {[...Array(2)].flatMap((_, dup) =>
                      [
                        { name: 'Webflow', domain: 'webflow.com' },
                        { name: 'Intercom', domain: 'intercom.com' },
                        { name: 'Segment', domain: 'segment.com' },
                        { name: 'Shopify', domain: 'shopify.com' },
                        { name: 'Figma', domain: 'figma.com' },
                        { name: 'Asana', domain: 'asana.com' },
                      ].map((b, i) => (
                        <span key={`${dup}-${i}`} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-surface-200 shadow-sm whitespace-nowrap">
                          <img src={`https://cdn.brandfetch.io/${b.domain}/icon/fallback/transparent?c=1idmHW4h6BoV1E9hJTF`} alt="" className="w-4 h-4 rounded-sm object-contain" loading="lazy" />
                          <span className="text-sm font-medium text-surface-700">{b.name}</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
                {/* Row 3 */}
                <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                  <div className="flex gap-2.5 animate-marquee" style={{ animationDuration: '25s' }}>
                    {[...Array(2)].flatMap((_, dup) =>
                      [
                        { name: 'Airtable', domain: 'airtable.com' },
                        { name: 'Mailchimp', domain: 'mailchimp.com' },
                        { name: 'GitHub', domain: 'github.com' },
                        { name: 'Linear', domain: 'linear.app' },
                      ].map((b, i) => (
                        <span key={`${dup}-${i}`} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-surface-200 shadow-sm whitespace-nowrap">
                          <img src={`https://cdn.brandfetch.io/${b.domain}/icon/fallback/transparent?c=1idmHW4h6BoV1E9hJTF`} alt="" className="w-4 h-4 rounded-sm object-contain" loading="lazy" />
                          <span className="text-sm font-medium text-surface-700">{b.name}</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <h3 className="text-lg font-medium text-surface-900">
                {content.capabilities.items[1].title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.capabilities.items[1].description}
              </p>
            </div>
          </Card>

          {/* ── Card 3: SEO — Lighthouse-style score gauge ── */}
          <Card padding="none" hover={false}>
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-4 flex items-center gap-4">
                {/* Score ring */}
                <div className="flex-shrink-0">
                  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                    {/* Track */}
                    <circle cx="44" cy="44" r="36" stroke="var(--color-surface-200)" strokeWidth="6" />
                    {/* Progress — 98/100 = 98% of circumference */}
                    <circle
                      cx="44" cy="44" r="36"
                      stroke="var(--color-success)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${0.98 * 2 * Math.PI * 36} ${2 * Math.PI * 36}`}
                      transform="rotate(-90 44 44)"
                    />
                    {/* Score */}
                    <text x="44" y="40" textAnchor="middle" style={{ fontSize: '22px', fontWeight: 600, fill: 'var(--color-surface-900)', fontFamily: 'var(--font-mono)' }}>98</text>
                    <text x="44" y="56" textAnchor="middle" style={{ fontSize: '10px', fill: 'var(--color-surface-500)' }}>/ 100</text>
                  </svg>
                </div>
                {/* Checklist */}
                <div className="flex flex-col gap-2">
                  {['Meta tags', 'Schema markup', 'Heading hierarchy', 'Page speed'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" fill="var(--color-success)" fillOpacity="0.15" />
                        <path d="M5 8l2 2 4-4" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-sm text-surface-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <h3 className="text-lg font-medium text-surface-900">
                {content.capabilities.items[2].title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.capabilities.items[2].description}
              </p>
            </div>
          </Card>

          {/* ── Card 4: CMS — content editor wireframe (2-col) ── */}
          <Card padding="none" hover={false} className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-5" aria-hidden="true">
                <div className="h-full min-h-[12rem] rounded-xl bg-surface-50 border border-surface-100 overflow-hidden">
                  {/* Editor toolbar */}
                  <div className="px-4 py-2.5 border-b border-surface-200 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-surface-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-surface-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-surface-300" />
                    </div>
                    <div className="flex-1 h-5 bg-white rounded border border-surface-200 flex items-center px-2">
                      <div className="h-1.5 w-20 bg-surface-200 rounded-full" />
                    </div>
                  </div>
                  {/* Content fields */}
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <div className="text-2xs font-mono font-medium text-surface-400 mb-1.5">title</div>
                      <div className="h-9 rounded-lg bg-white border border-surface-200 flex items-center px-3">
                        <span className="text-sm font-medium text-surface-900">How We Scaled Revenue 3x</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xs font-mono font-medium text-surface-400 mb-1.5">body</div>
                      <div className="h-16 rounded-lg bg-white border border-surface-200 p-3 space-y-2">
                        <div className="h-2 w-full bg-surface-200 rounded-full" />
                        <div className="h-2 w-4/5 bg-surface-200 rounded-full" />
                        <div className="h-2 w-3/5 bg-surface-100 rounded-full" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div className="text-2xs font-mono font-medium text-surface-400 mb-1.5">category</div>
                        <div className="flex gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-primary-50 border border-primary-200 text-2xs font-medium text-primary-700">SaaS</span>
                          <span className="px-2.5 py-1 rounded-full bg-primary-50 border border-primary-200 text-2xs font-medium text-primary-700">B2B</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-2xs font-mono font-medium text-surface-400 mb-1.5">status</div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-light text-2xs font-medium text-success-dark">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          Published
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col justify-center">
                <h3 className="text-lg font-medium text-surface-900">
                  {content.capabilities.items[3].title}
                </h3>
                <p className="mt-2 text-surface-600">
                  {content.capabilities.items[3].description}
                </p>
              </div>
            </div>
          </Card>

          {/* ── Card 5: Responsive — pixel breakpoint animation ── */}
          <Card padding="none" hover={false}>
            <div className="p-5">
              <PixelBreakpointAnimation />
            </div>
            <div className="px-5 pb-5">
              <h3 className="text-lg font-medium text-surface-900">
                {content.capabilities.items[4].title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.capabilities.items[4].description}
              </p>
            </div>
          </Card>

          {/* ── Card 6: Scalable — animated growing grid (dark full-width) ── */}
          <div className="md:col-span-3 rounded-xl bg-surface-900 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
              <div className="px-6 pt-8 sm:py-10 sm:pl-10">
                <ScalableGridAnimation />
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-medium text-white">
                  {content.capabilities.items[5].title}
                </h3>
                <p className="mt-2 text-surface-300 max-w-md">
                  {content.capabilities.items[5].description}
                </p>
              </div>
            </div>
          </div>

        </div>
      </SectionContainer>

      {/* ─── Section 5: Credibility (Dark) ─── */}
      <SectionContainer padding="lg" className="bg-surface-800 text-surface-300">
        <SectionHeader
          title={content.credibility.title}
          highlightWord={content.credibility.highlightWord}
          variant="dark"
        />

        {/* Stats Grid */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {content.credibility.stats.map((stat, i) => (
            <div key={i}>
              <span className="block text-5xl md:text-6xl font-mono font-medium text-white">
                {stat.value}
              </span>
              <span className="block mt-2 text-sm text-surface-500">
                {stat.label}
              </span>
              {stat.description && (
                <span className="block mt-1 text-sm text-surface-400">
                  {stat.description}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="mt-12 text-lg text-surface-300 max-w-3xl">
          {content.credibility.description}
        </p>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center gap-8">
          {content.credibility.badges.map((badge, i) => (
            <img
              key={i}
              src={asset(badge.src)}
              alt={badge.alt}
              width="120"
              height="30"
              className={`h-7.5 w-auto ${badge.src.endsWith('.svg') ? 'brightness-0 invert opacity-70' : ''}`}
              loading="lazy"
            />
          ))}
        </div>
      </SectionContainer>

      {/* ─── Section 6: Case Studies ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.caseStudies.title}
          highlightWord={content.caseStudies.highlightWord}
        />

        {featured.length > 0 ? (
          <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((study) => {
              const client = getClient(study.client);
              const industry = getIndustry(study.industry);
              const clientColor = study['client-color'] || 'var(--color-primary-500)';
              const { textColor: statTextColor } = getContrastColors(clientColor);
              const hasStats = study['result-1---number'] || study['result-2---number'];

              return (
                <Link
                  key={study.slug}
                  href={`/case-studies/${study.slug}`}
                  className="group relative bg-white rounded-2xl border border-surface-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-surface-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {(() => {
                      const thumb = caseStudyThumbnail(
                        study['main-project-image-thumbnail']?.url
                      );
                      return (
                        <img
                          src={
                            thumb.src || asset('/images/placeholder.webp')
                          }
                          srcSet={thumb.srcset}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          alt={
                            study['main-project-image-thumbnail']?.alt ||
                            study['project-title'] ||
                            study.name
                          }
                          width="800"
                          height="500"
                          loading="lazy"
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      );
                    })()}

                    {industry && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-surface-700 shadow-sm">
                        {industry.name}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-medium text-lg text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {study['project-title'] || study.name}
                    </h3>

                    {study['paragraph-summary'] && (
                      <p className="mt-2 text-sm text-surface-600 line-clamp-2">
                        {study['paragraph-summary']}
                      </p>
                    )}

                    {hasStats &&
                      (() => {
                        const hasBothStats =
                          study['result-1---number'] && study['result-2---number'];
                        return (
                          <div
                            className={`mt-4 ${hasBothStats ? 'grid grid-cols-2 gap-2' : ''}`}
                          >
                            {study['result-1---number'] && (
                              <div
                                className="rounded-lg p-3"
                                style={{
                                  backgroundColor: clientColor,
                                  color: statTextColor,
                                }}
                              >
                                <span className="block text-xl font-medium">
                                  {study['result-1---number']}
                                </span>
                                <span className="text-xs opacity-75 line-clamp-1">
                                  {study['result-1---title']}
                                </span>
                              </div>
                            )}
                            {study['result-2---number'] && (
                              <div
                                className="rounded-lg p-3"
                                style={{
                                  backgroundColor: clientColor,
                                  color: statTextColor,
                                }}
                              >
                                <span className="block text-xl font-medium">
                                  {study['result-2---number']}
                                </span>
                                <span className="text-xs opacity-75 line-clamp-1">
                                  {study['result-2---title']}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                    <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between">
                      <div className="flex-shrink-0">
                        {client?.['colored-logo']?.url ? (
                          <img
                            src={logoImage(client['colored-logo'].url)}
                            alt={client.name || 'Client'}
                            width="120"
                            height="20"
                            className="h-5 w-auto max-w-[100px] object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-sm font-medium text-surface-400">
                            {client?.name || ''}
                          </span>
                        )}
                      </div>

                      <span className="flex items-center gap-1.5 text-sm font-medium text-surface-500 group-hover:text-primary-600 transition-colors">
                        View project
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M3 8h10M9 4l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 text-center py-16">
            <p className="text-surface-600">Case studies coming soon.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" href="/case-studies">
            {content.caseStudies.cta}
          </Button>
        </div>
      </SectionContainer>

      {/* ─── Section 7: FAQ ─── */}
      <FAQ
        title={content.faq.title}
        items={content.faq.items}
        showFooter
      />

      {/* ─── Related Services ─── */}
      <RelatedServices currentService="/services/webflow" />

      {/* ─── Section 8: CTA ─── */}
      <CTA
        title={content.cta.title}
        subtitle={content.cta.subtitle}
        ctaText={content.cta.ctaText}
      />
    </>
  );
}
