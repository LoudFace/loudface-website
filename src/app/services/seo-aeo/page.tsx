/**
 * SEO/AEO Service Page
 *
 * Data Sources:
 * - JSON: services-seo-aeo.json (via content layer)
 */
import type { Metadata } from 'next';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { getServicesSeoAeoContent } from '@/lib/content-utils';
import { AI_PLATFORM_ICONS } from '@/lib/icons';
import {
  SectionContainer,
  SectionHeader,
  Card,
  Button,
  BulletLabel,
  Badge,
} from '@/components/ui';
import Link from 'next/link';
import { FAQ, CTA, RelatedServices } from '@/components/sections';

// Dynamic import below-fold visual component — defers client JS hydration
const AICitationVisual = dynamic(
  () => import('@/components/ui/AICitationVisual').then(m => ({ default: m.AICitationVisual })),
);

export const metadata: Metadata = {
  title: 'SEO & AI Engine Optimization Services',
  description:
    'Get your brand cited by ChatGPT, Perplexity, and Google AI Mode. Hands-free SEO and AEO programs that build authority across every engine where your buyers look.',
  alternates: {
    canonical: '/services/seo-aeo',
  },
};

export default function SeoAeoServicePage() {
  const content = getServicesSeoAeoContent();

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'SEO & AI Engine Optimization Services',
    description:
      'Get your brand cited by ChatGPT, Perplexity, and Google AI Mode. Hands-free SEO and AEO programs that build authority across every engine where your buyers look.',
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: ['Search Engine Optimization', 'AI Engine Optimization'],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co/' },
      { '@type': 'ListItem', position: 2, name: 'SEO & AEO' },
    ],
  };

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
              <Button variant="outline" size="lg" href="#how-it-works">
                {content.hero.secondaryCta}
              </Button>
            </div>
          </div>

          {/* Right — AI Citation Animation */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center">
            <AICitationVisual />
          </div>
        </div>

        {/* Stats Strip */}
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
          {/* Card 1: Rankings without revenue — diverging lines chart */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center px-4" aria-hidden="true">
              <svg className="w-full h-16" viewBox="0 0 200 64" fill="none">
                {/* Traffic line — goes up */}
                <path
                  d="M10,48 C40,45 70,38 100,30 C130,22 160,16 190,8"
                  stroke="var(--color-surface-400)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Revenue line — stays flat/dips */}
                <path
                  d="M10,48 C40,50 70,52 100,51 C130,52 160,54 190,56"
                  stroke="var(--color-error)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                />
                {/* Labels */}
                <text x="192" y="8" fontSize="8" fill="var(--color-surface-400)" fontWeight="500">Traffic</text>
                <text x="192" y="58" fontSize="8" fill="var(--color-error)" fontWeight="500">Revenue</text>
              </svg>
            </div>
            <span className="block mt-4 text-7xl font-mono font-bold text-surface-100 leading-none select-none">
              {content.problems.items[0].number}
            </span>
            <h3 className="text-xl font-medium text-surface-900 -mt-4">
              {content.problems.items[0].title}
            </h3>
            <p className="mt-3 text-surface-600">{content.problems.items[0].description}</p>
          </Card>

          {/* Card 2: Invisible to AI engines — platform icons with "?" */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center gap-3 px-4" aria-hidden="true">
              {['ChatGPT', 'Perplexity', 'Google AI', 'Claude'].map((name) => {
                const icon = AI_PLATFORM_ICONS[name];
                return (
                  <div key={name} className="relative">
                    <div className="w-10 h-10 rounded-lg bg-white border border-surface-200 flex items-center justify-center">
                      {icon && (
                        <svg
                          className="w-5 h-5 text-surface-300"
                          viewBox={icon.viewBox}
                          dangerouslySetInnerHTML={{ __html: icon.path }}
                        />
                      )}
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-surface-200 flex items-center justify-center text-[8px] font-bold text-surface-500">
                      ?
                    </span>
                  </div>
                );
              })}
            </div>
            <span className="block mt-4 text-7xl font-mono font-bold text-surface-100 leading-none select-none">
              {content.problems.items[1].number}
            </span>
            <h3 className="text-xl font-medium text-surface-900 -mt-4">
              {content.problems.items[1].title}
            </h3>
            <p className="mt-3 text-surface-600">{content.problems.items[1].description}</p>
          </Card>

          {/* Card 3: Tactics without a system — scattered disconnected blocks */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center relative overflow-hidden" aria-hidden="true">
              <svg className="w-full h-full" viewBox="0 0 200 96" fill="none">
                {/* Scattered rectangles at random angles */}
                <rect x="20" y="15" width="28" height="14" rx="3" fill="var(--color-surface-200)" transform="rotate(-12 20 15)" />
                <rect x="70" y="50" width="24" height="12" rx="3" fill="var(--color-surface-300)" transform="rotate(8 70 50)" />
                <rect x="120" y="20" width="30" height="14" rx="3" fill="var(--color-surface-200)" transform="rotate(15 120 20)" />
                <rect x="45" y="70" width="22" height="12" rx="3" fill="var(--color-surface-200)" transform="rotate(-5 45 70)" />
                <rect x="160" y="55" width="26" height="12" rx="3" fill="var(--color-surface-300)" transform="rotate(-18 160 55)" />
                <rect x="100" y="65" width="20" height="10" rx="3" fill="var(--color-surface-200)" transform="rotate(10 100 65)" />
              </svg>
            </div>
            <span className="block mt-4 text-7xl font-mono font-bold text-surface-100 leading-none select-none">
              {content.problems.items[2].number}
            </span>
            <h3 className="text-xl font-medium text-surface-900 -mt-4">
              {content.problems.items[2].title}
            </h3>
            <p className="mt-3 text-surface-600">{content.problems.items[2].description}</p>
          </Card>
        </div>
      </SectionContainer>

      {/* ─── Section 3: Autopilot Approach (Dark) ─── */}
      <SectionContainer padding="lg" className="bg-surface-900 text-surface-300" id="how-it-works">
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
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-px bg-surface-700" />

            <div className="grid grid-cols-4 gap-8">
              {content.approach.steps.map((step) => (
                <div key={step.number} className="relative">
                  <div className="relative z-10 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-mono text-sm font-medium mx-auto">
                    {step.number}
                  </div>

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

      {/* ─── Section 4: Two Tracks ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.tracks.title}
          highlightWord={content.tracks.highlightWord}
          subtitle={content.tracks.description}
        />

        <div className="mt-8 lg:mt-12 border border-surface-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-200">
            {/* SEO Column */}
            <div className="p-8 lg:p-12">
              <Badge variant="outline" size="md">{content.tracks.seo.label}</Badge>
              <h3 className="mt-4 text-xl font-medium text-surface-900">
                {content.tracks.seo.title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.tracks.seo.description}
              </p>
              <ul className="mt-6 space-y-3">
                {content.tracks.seo.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="var(--color-primary-100)" />
                      <path d="M6 10l3 3 5-5" stroke="var(--color-primary-600)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-surface-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AEO Column */}
            <div className="p-8 lg:p-12">
              <Badge variant="outline" size="md">{content.tracks.aeo.label}</Badge>
              <h3 className="mt-4 text-xl font-medium text-surface-900">
                {content.tracks.aeo.title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.tracks.aeo.description}
              </p>
              <ul className="mt-6 space-y-3">
                {content.tracks.aeo.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="var(--color-primary-100)" />
                      <path d="M6 10l3 3 5-5" stroke="var(--color-primary-600)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-surface-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bridge row */}
          <div className="border-t border-surface-200 px-8 lg:px-12 py-6 text-center bg-surface-50">
            <p className="text-surface-600 max-w-2xl mx-auto">
              {content.tracks.bridge}
            </p>
          </div>
        </div>
      </SectionContainer>

      {/* ─── Section 5: Capabilities Bento Grid ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.capabilities.title}
          highlightWord={content.capabilities.highlightWord}
        />

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* ── Card 1: Technical Foundation — Score Gauge ── */}
          <Card padding="none" hover={false}>
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                    <circle cx="44" cy="44" r="36" stroke="var(--color-surface-200)" strokeWidth="6" />
                    <circle
                      cx="44" cy="44" r="36"
                      stroke="var(--color-success)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${0.96 * 2 * Math.PI * 36} ${2 * Math.PI * 36}`}
                      transform="rotate(-90 44 44)"
                    />
                    <text x="44" y="40" textAnchor="middle" style={{ fontSize: '22px', fontWeight: 600, fill: 'var(--color-surface-900)', fontFamily: 'var(--font-mono)' }}>96</text>
                    <text x="44" y="56" textAnchor="middle" style={{ fontSize: '10px', fill: 'var(--color-surface-500)' }}>/ 100</text>
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  {['Core Web Vitals', 'Schema markup', 'Crawl health', 'Internal links'].map((item) => (
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
                {content.capabilities.items[0].title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.capabilities.items[0].description}
              </p>
            </div>
          </Card>

          {/* ── Card 2: Content Systems — Topical Cluster Node Map ── */}
          <Card padding="none" hover={false}>
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 240 160" fill="none">
                  {/* Connecting lines */}
                  <line x1="120" y1="80" x2="55" y2="35" stroke="var(--color-surface-300)" strokeWidth="1" />
                  <line x1="120" y1="80" x2="185" y2="35" stroke="var(--color-surface-300)" strokeWidth="1" />
                  <line x1="120" y1="80" x2="45" y2="100" stroke="var(--color-surface-300)" strokeWidth="1" />
                  <line x1="120" y1="80" x2="195" y2="100" stroke="var(--color-surface-300)" strokeWidth="1" />
                  <line x1="120" y1="80" x2="80" y2="135" stroke="var(--color-surface-300)" strokeWidth="1" />
                  <line x1="120" y1="80" x2="160" y2="135" stroke="var(--color-surface-300)" strokeWidth="1" />

                  {/* Center hub node */}
                  <circle cx="120" cy="80" r="18" fill="var(--color-primary-500)" />
                  <text x="120" y="78" textAnchor="middle" fontSize="7" fontWeight="600" fill="white">Main</text>
                  <text x="120" y="87" textAnchor="middle" fontSize="6" fill="white" fillOpacity="0.8">Topic</text>

                  {/* Spoke nodes */}
                  {[
                    { cx: 55, cy: 35, label: 'Guide' },
                    { cx: 185, cy: 35, label: 'How-to' },
                    { cx: 45, cy: 100, label: 'FAQ' },
                    { cx: 195, cy: 100, label: 'Compare' },
                    { cx: 80, cy: 135, label: 'Stats' },
                    { cx: 160, cy: 135, label: 'Tools' },
                  ].map((node) => (
                    <g key={node.label}>
                      <circle cx={node.cx} cy={node.cy} r="12" fill="var(--color-primary-100)" />
                      <text x={node.cx} y={node.cy + 3} textAnchor="middle" fontSize="7" fontWeight="500" fill="var(--color-primary-700)">{node.label}</text>
                    </g>
                  ))}
                </svg>
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

          {/* ── Card 3: Off-page & Distribution — Platform Grid ── */}
          <Card padding="none" hover={false}>
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-4 grid grid-cols-2 gap-2.5">
                {[
                  { name: 'G2', domain: 'g2.com' },
                  { name: 'Capterra', domain: 'capterra.com' },
                  { name: 'Reddit', domain: 'reddit.com' },
                  { name: 'Quora', domain: 'quora.com' },
                ].map((platform) => (
                  <div key={platform.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-surface-200">
                    <img
                      src={`https://cdn.brandfetch.io/${platform.domain}/icon/fallback/transparent?c=1idmHW4h6BoV1E9hJTF`}
                      alt=""
                      className="w-5 h-5 rounded-sm object-contain"
                      loading="lazy"
                    />
                    <span className="text-sm font-medium text-surface-700">{platform.name}</span>
                  </div>
                ))}
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

          {/* ── Card 4: E-E-A-T — Author Profile Card (wide) ── */}
          <Card padding="none" hover={false} className="md:col-span-1">
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-surface-400" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill="currentColor" />
                      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="currentColor" />
                    </svg>
                  </div>
                  {/* Info */}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-surface-900">Dr. Jane Smith</div>
                    <div className="text-2xs text-surface-500 mt-0.5">VP Engineering, Acme Corp</div>
                    <div className="flex gap-1.5 mt-2">
                      <span className="px-2 py-0.5 rounded bg-primary-50 border border-primary-200 text-[9px] font-medium text-primary-700">Forbes</span>
                      <span className="px-2 py-0.5 rounded bg-primary-50 border border-primary-200 text-[9px] font-medium text-primary-700">TechCrunch</span>
                    </div>
                  </div>
                </div>
                {/* Skeleton bio */}
                <div className="mt-4 space-y-1.5">
                  <div className="h-2 w-full bg-surface-200 rounded-full" />
                  <div className="h-2 w-4/5 bg-surface-200 rounded-full" />
                  <div className="h-2 w-3/5 bg-surface-100 rounded-full" />
                </div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <h3 className="text-lg font-medium text-surface-900">
                {content.capabilities.items[3].title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.capabilities.items[3].description}
              </p>
            </div>
          </Card>

          {/* ── Card 5: LLM Visibility Monitoring — Citation Dashboard (2-col) ── */}
          <Card padding="none" hover={false} className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-5" aria-hidden="true">
                <div className="h-full min-h-[12rem] rounded-xl bg-surface-50 border border-surface-100 p-4">
                  <div className="text-2xs font-medium text-surface-400 uppercase tracking-wider mb-3">
                    AI Citation Monitor
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { name: 'ChatGPT', cited: true, count: '12x' },
                      { name: 'Perplexity', cited: true, count: '8x' },
                      { name: 'Google AI', cited: true, count: '6x' },
                      { name: 'Claude', cited: true, count: '5x' },
                      { name: 'Grok', cited: false, count: '—' },
                    ].map((platform) => {
                      const icon = AI_PLATFORM_ICONS[platform.name];
                      return (
                        <div key={platform.name} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-md bg-white border border-surface-200 flex items-center justify-center flex-shrink-0">
                            {icon && (
                              <svg
                                className="w-4 h-4 text-surface-600"
                                viewBox={icon.viewBox}
                                dangerouslySetInnerHTML={{ __html: icon.path }}
                              />
                            )}
                          </div>
                          <span className="text-sm font-medium text-surface-700 w-20">{platform.name}</span>
                          <div className="flex items-center gap-1.5 ml-auto">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: platform.cited ? 'var(--color-success)' : 'var(--color-surface-300)' }}
                            />
                            <span className={`text-xs font-medium ${platform.cited ? 'text-surface-700' : 'text-surface-400'}`}>
                              {platform.cited ? `Cited (${platform.count})` : 'Not cited'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col justify-center">
                <h3 className="text-lg font-medium text-surface-900">
                  {content.capabilities.items[4].title}
                </h3>
                <p className="mt-2 text-surface-600">
                  {content.capabilities.items[4].description}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </SectionContainer>

      {/* ─── Section 6: SEO by Industry ─── */}
      <SectionContainer>
        <SectionHeader
          title="SEO by Industry"
          highlightWord="Industry"
          subtitle="Every vertical has unique search dynamics. We build strategies around yours."
        />
        <div className="mt-8 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/seo-for/ecommerce', label: 'E-Commerce SEO', desc: 'Compete with Amazon and marketplace giants.' },
            { href: '/seo-for/healthcare', label: 'Healthcare SEO', desc: 'Navigate YMYL, E-E-A-T, and multi-location local search.' },
            { href: '/seo-for/saas', label: 'SaaS SEO', desc: 'Fix JavaScript rendering and build product-led content.' },
            { href: '/seo-for/startups', label: 'Startup SEO', desc: 'Build authority from zero on a lean budget.' },
            { href: '/seo-for/b2b', label: 'B2B SEO', desc: 'Align search with long sales cycles and buying committees.' },
            { href: '/seo-for/fintech', label: 'FinTech SEO', desc: 'Meet YMYL standards and build financial trust signals.' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 p-4 rounded-xl border border-surface-200 bg-white
                transition-all duration-200 hover:border-surface-300 hover:shadow-md
                focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
            >
              <div>
                <div className="font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                  {item.label}
                </div>
                <div className="mt-1 text-sm text-surface-500">{item.desc}</div>
              </div>
              <svg
                className="w-5 h-5 flex-shrink-0 text-surface-400 group-hover:text-primary-500 transition-colors ml-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </SectionContainer>

      {/* ─── Section 7: FAQ ─── */}
      <FAQ
        title={content.faq.title}
        items={content.faq.items}
        showFooter
      />

      {/* ─── Related Services ─── */}
      <RelatedServices currentService="/services/seo-aeo" />

      {/* ─── Section 8: CTA ─── */}
      <CTA
        title={content.cta.title}
        subtitle={content.cta.subtitle}
        ctaText={content.cta.ctaText}
      />
    </>
  );
}
