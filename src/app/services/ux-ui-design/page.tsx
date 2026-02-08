/**
 * UX/UI Design Service Page
 *
 * Data Sources:
 * - JSON: services-ux-ui-design.json (via content layer)
 */
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getServicesUxUiDesignContent } from '@/lib/content-utils';
import {
  SectionContainer,
  SectionHeader,
  Card,
  Button,
  BulletLabel,
  Badge,
} from '@/components/ui';
import { FAQ, CTA } from '@/components/sections';

// Dynamic import below-fold visual component — defers client JS hydration
const DesignSystemVisual = dynamic(
  () => import('@/components/ui/DesignSystemVisual').then(m => ({ default: m.DesignSystemVisual })),
);

export const metadata: Metadata = {
  title: 'UX/UI Design Services',
  description:
    'Conversion-focused design systems for B2B and SaaS websites. Component libraries, design tokens, and layouts built for humans, search engines, and AI — not just aesthetics.',
  alternates: {
    canonical: '/services/ux-ui-design',
  },
};

export default function UxUiDesignServicePage() {
  const content = getServicesUxUiDesignContent();

  return (
    <>
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

          {/* Right — Design System Animation */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center">
            <DesignSystemVisual />
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

      {/* ─── Section 2: Problems ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.problems.title}
          highlightWord={content.problems.highlightWord}
        />

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Looks great, converts poorly — Award ribbon ≠ conversion chart */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center px-4" aria-hidden="true">
              <svg className="w-full h-16" viewBox="0 0 200 64" fill="none">
                {/* Award ribbon icon (left) */}
                <g transform="translate(28, 6)">
                  <circle cx="18" cy="18" r="14" fill="var(--color-surface-100)" stroke="var(--color-surface-300)" strokeWidth="1" />
                  <circle cx="18" cy="18" r="8" fill="var(--color-surface-200)" />
                  {/* Star */}
                  <path d="M18 12l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="var(--color-surface-300)" />
                  {/* Ribbon tails */}
                  <path d="M10 30l-4 18 8-5 4 7 2-20" fill="var(--color-surface-200)" stroke="var(--color-surface-300)" strokeWidth="0.5" />
                  <path d="M26 30l4 18-8-5-4 7-2-20" fill="var(--color-surface-200)" stroke="var(--color-surface-300)" strokeWidth="0.5" />
                </g>

                {/* Not-equals sign */}
                <text x="88" y="36" fontSize="18" fill="var(--color-surface-300)" fontWeight="700">&ne;</text>

                {/* Flatline conversion chart (right) */}
                <g transform="translate(112, 6)">
                  {/* Axis */}
                  <line x1="0" y1="48" x2="68" y2="48" stroke="var(--color-surface-200)" strokeWidth="1" />
                  {/* Goal dashed line */}
                  <line x1="0" y1="8" x2="68" y2="8" stroke="var(--color-success)" strokeWidth="0.75" strokeDasharray="3 2" opacity="0.3" />
                  <text x="70" y="11" fontSize="5" fill="var(--color-success)" opacity="0.4" style={{ fontFamily: 'var(--font-mono)' }}>Goal</text>
                  {/* Flatline near bottom */}
                  <path d="M4,40 L18,41 L32,39 L46,42 L60,40" stroke="var(--color-error)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
                  {/* Data points */}
                  <circle cx="4" cy="40" r="2" fill="var(--color-error)" opacity="0.6" />
                  <circle cx="18" cy="41" r="2" fill="var(--color-error)" opacity="0.6" />
                  <circle cx="32" cy="39" r="2" fill="var(--color-error)" opacity="0.6" />
                  <circle cx="46" cy="42" r="2" fill="var(--color-error)" opacity="0.6" />
                  <circle cx="60" cy="40" r="2" fill="var(--color-error)" opacity="0.6" />
                </g>
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

          {/* Card 2: Every new page starts from scratch — Scattered fragments */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center px-4" aria-hidden="true">
              <svg className="w-full h-16" viewBox="0 0 200 64" fill="none">
                {/* Dashed site boundary */}
                <rect x="10" y="2" width="180" height="58" rx="4" fill="none" stroke="var(--color-surface-200)" strokeWidth="1" strokeDasharray="4 3" />

                {/* Scattered page fragments */}
                {[
                  { x: 20, y: 8, w: 28, h: 32, r: -8, headColor: 'var(--color-surface-200)' },
                  { x: 62, y: 14, w: 24, h: 28, r: 12, headColor: 'var(--color-surface-300)' },
                  { x: 100, y: 6, w: 30, h: 36, r: -3, headColor: 'var(--color-primary-200)' },
                  { x: 140, y: 18, w: 26, h: 24, r: 7, headColor: 'var(--color-surface-200)' },
                  { x: 166, y: 4, w: 22, h: 30, r: -10, headColor: 'var(--color-surface-300)' },
                ].map((frag, i) => (
                  <g key={i} transform={`translate(${frag.x}, ${frag.y}) rotate(${frag.r})`}>
                    <rect x="0" y="0" width={frag.w} height={frag.h} rx="2" fill="white" stroke="var(--color-surface-200)" strokeWidth="0.75" />
                    <rect x="0" y="0" width={frag.w} height="5" rx="2" fill={frag.headColor} />
                    <rect x="3" y="8" width={frag.w - 8} height="1.5" rx="0.5" fill="var(--color-surface-200)" />
                    <rect x="3" y="12" width={frag.w - 12} height="1" rx="0.5" fill="var(--color-surface-100)" />
                  </g>
                ))}

                {/* Clock + "2 wks" label */}
                <g transform="translate(140, 44)">
                  <circle cx="5" cy="5" r="4" fill="none" stroke="var(--color-error)" strokeWidth="0.75" opacity="0.7" />
                  <line x1="5" y1="5" x2="5" y2="3" stroke="var(--color-error)" strokeWidth="0.75" strokeLinecap="round" opacity="0.7" />
                  <line x1="5" y1="5" x2="7" y2="5" stroke="var(--color-error)" strokeWidth="0.75" strokeLinecap="round" opacity="0.7" />
                  <text x="12" y="8" fontSize="5" fill="var(--color-error)" fontWeight="500" style={{ fontFamily: 'var(--font-mono)' }}>2 wks</text>
                </g>

                {/* Scattered ? and ! */}
                <text x="56" y="12" fontSize="7" fill="var(--color-surface-300)" fontWeight="700">?</text>
                <text x="128" y="48" fontSize="7" fill="var(--color-surface-300)" fontWeight="700">!</text>
              </svg>
            </div>
            <span className="block mt-4 text-7xl font-mono font-bold text-surface-100 leading-none select-none">
              {content.problems.items[1].number}
            </span>
            <h3 className="text-xl font-medium text-surface-900 -mt-4">
              {content.problems.items[1].title}
            </h3>
            <p className="mt-3 text-surface-600">{content.problems.items[1].description}</p>
          </Card>

          {/* Card 3: Designed for one audience — 3 audience icons, only human checked */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center px-4" aria-hidden="true">
              <svg className="w-full h-16" viewBox="0 0 200 64" fill="none">
                {/* Three audience columns */}
                {/* Human — full opacity, green check */}
                <g transform="translate(20, 4)">
                  <circle cx="22" cy="10" r="7" fill="var(--color-surface-300)" />
                  <path d="M12 28c0-6 4-10 10-10s10 4 10 10" fill="var(--color-surface-300)" />
                  <circle cx="36" cy="6" r="5" fill="var(--color-success)" fillOpacity="0.15" />
                  <path d="M33.5 6l1.5 1.5 3-3" stroke="var(--color-success)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="10" y="44" fontSize="6" fill="var(--color-surface-600)" fontWeight="500" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)' }}>Human</text>
                </g>

                {/* Search — faded, red X */}
                <g transform="translate(78, 4)" opacity="0.3">
                  <circle cx="18" cy="14" r="10" fill="none" stroke="var(--color-surface-400)" strokeWidth="2" />
                  <line x1="25" y1="22" x2="33" y2="30" stroke="var(--color-surface-400)" strokeWidth="2" strokeLinecap="round" />
                </g>
                <g transform="translate(78, 4)">
                  <circle cx="34" cy="6" r="5" fill="var(--color-error)" fillOpacity="0.15" />
                  <path d="M32 4l4 4M36 4l-4 4" stroke="var(--color-error)" strokeWidth="1.2" strokeLinecap="round" />
                  <text x="18" y="44" fontSize="6" fill="var(--color-surface-400)" fontWeight="500" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)' }}>Search</text>
                </g>

                {/* AI — faded, red X */}
                <g transform="translate(136, 4)" opacity="0.3">
                  <rect x="6" y="4" width="24" height="22" rx="4" fill="none" stroke="var(--color-surface-400)" strokeWidth="1.5" />
                  <circle cx="14" cy="14" r="2" fill="var(--color-surface-400)" />
                  <circle cx="22" cy="14" r="2" fill="var(--color-surface-400)" />
                  <path d="M12 20h12" stroke="var(--color-surface-400)" strokeWidth="1" strokeLinecap="round" />
                </g>
                <g transform="translate(136, 4)">
                  <circle cx="34" cy="6" r="5" fill="var(--color-error)" fillOpacity="0.15" />
                  <path d="M32 4l4 4M36 4l-4 4" stroke="var(--color-error)" strokeWidth="1.2" strokeLinecap="round" />
                  <text x="18" y="44" fontSize="6" fill="var(--color-surface-400)" fontWeight="500" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)' }}>AI</text>
                </g>

                {/* Coverage bar below */}
                <g transform="translate(20, 54)">
                  <rect x="0" y="0" width="53" height="4" rx="2" fill="var(--color-surface-400)" />
                  <rect x="53" y="0" width="53" height="4" rx="0" fill="none" stroke="var(--color-surface-200)" strokeWidth="0.5" strokeDasharray="2 2" />
                  <rect x="106" y="0" width="53" height="4" rx="2" fill="none" stroke="var(--color-surface-200)" strokeWidth="0.5" strokeDasharray="2 2" />
                  <text x="165" y="6" fontSize="6" fill="var(--color-error)" fontWeight="500" style={{ fontFamily: 'var(--font-mono)' }}>33%</text>
                </g>
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

      {/* ─── Section 3: Approach (Dark) ─── */}
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

      {/* ─── Section 4: Two Tracks (Build vs Growth) ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.tracks.title}
          highlightWord={content.tracks.highlightWord}
          subtitle={content.tracks.description}
        />

        <div className="mt-8 lg:mt-12 border border-surface-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-200">
            {/* Build Column */}
            <div className="p-8 lg:p-12">
              <Badge variant="outline" size="md">{content.tracks.build.label}</Badge>
              <h3 className="mt-4 text-xl font-medium text-surface-900">
                {content.tracks.build.title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.tracks.build.description}
              </p>
              <ul className="mt-6 space-y-3">
                {content.tracks.build.items.map((item) => (
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

            {/* Growth Column */}
            <div className="p-8 lg:p-12">
              <Badge variant="outline" size="md">{content.tracks.growth.label}</Badge>
              <h3 className="mt-4 text-xl font-medium text-surface-900">
                {content.tracks.growth.title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.tracks.growth.description}
              </p>
              <ul className="mt-6 space-y-3">
                {content.tracks.growth.items.map((item) => (
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

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
          {/* ── Row 1: 3 equal cards (each span-2 of 6) ── */}

          {/* Card 1: Conversion-focused UX — Scroll flow with attention heatmap */}
          <Card padding="none" hover={false} className="md:col-span-2">
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-3 flex items-center gap-3">
                {/* Page wireframe with heatmap overlay */}
                <div className="flex-1 relative">
                  <div className="w-full h-full rounded-lg border border-surface-200 bg-white overflow-hidden relative">
                    {/* Hot zone — hero/CTA area */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[40%] rounded-t-lg"
                      style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 100%)' }}
                    />
                    {/* Hero skeleton */}
                    <div className="p-2">
                      <div className="h-2 w-[75%] rounded-full mb-1" style={{ backgroundColor: 'var(--color-surface-800)' }} />
                      <div className="h-1 w-[55%] rounded-full mb-2" style={{ backgroundColor: 'var(--color-surface-200)' }} />
                      <div className="h-2.5 w-10 rounded" style={{ backgroundColor: 'var(--color-primary-500)' }} />
                    </div>
                    {/* Mid section — cards */}
                    <div className="px-2 mt-1">
                      <div className="flex gap-1">
                        <div className="flex-1 h-6 rounded-sm border" style={{ borderColor: 'var(--color-surface-200)' }} />
                        <div className="flex-1 h-6 rounded-sm border" style={{ borderColor: 'var(--color-surface-200)' }} />
                      </div>
                    </div>
                    {/* Cool zone */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[35%]"
                      style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.02), transparent)' }}
                    />
                  </div>

                  {/* Curved scroll arrow */}
                  <svg className="absolute -right-1 top-2 w-4 h-20" viewBox="0 0 16 80" fill="none">
                    <path d="M8 4 C8 4 12 20 8 40 C4 60 8 72 8 72" stroke="var(--color-primary-400)" strokeWidth="1" strokeDasharray="3 2" fill="none" />
                    <path d="M5 68l3 6 3-6" stroke="var(--color-primary-400)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>

                {/* Labels */}
                <div className="flex flex-col gap-4 flex-shrink-0">
                  {['Hook', 'Build', 'Convert'].map((label, i) => (
                    <span
                      key={label}
                      className="text-[7px] font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: i === 2 ? 'var(--color-primary-100)' : 'var(--color-surface-100)',
                        color: i === 2 ? 'var(--color-primary-600)' : 'var(--color-surface-500)',
                      }}
                    >
                      {label}
                    </span>
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

          {/* Card 2: Component-first design systems — Token tree */}
          <Card padding="none" hover={false} className="md:col-span-2">
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-3 flex flex-col items-center justify-center gap-2">
                {/* Token row */}
                <div className="flex gap-2">
                  {[
                    { bg: 'var(--color-primary-500)', label: 'Color' },
                    { bg: 'var(--color-surface-700)', label: 'Type' },
                    { bg: 'var(--color-primary-300)', label: 'Space' },
                    { bg: 'var(--color-surface-400)', label: 'Radius' },
                  ].map((token) => (
                    <div key={token.label} className="flex flex-col items-center gap-0.5">
                      <div className="w-5 h-5 rounded" style={{ backgroundColor: token.bg }} />
                      <span className="text-[5px] font-mono" style={{ color: 'var(--color-surface-400)' }}>{token.label}</span>
                    </div>
                  ))}
                </div>

                {/* Connection lines */}
                <svg className="w-32 h-4" viewBox="0 0 128 16" fill="none">
                  <path d="M16 0 L32 16" stroke="var(--color-primary-300)" strokeWidth="0.75" strokeDasharray="3 2" />
                  <path d="M44 0 L64 16" stroke="var(--color-primary-300)" strokeWidth="0.75" strokeDasharray="3 2" />
                  <path d="M76 0 L64 16" stroke="var(--color-primary-300)" strokeWidth="0.75" strokeDasharray="3 2" />
                  <path d="M108 0 L96 16" stroke="var(--color-primary-300)" strokeWidth="0.75" strokeDasharray="3 2" />
                </svg>

                {/* Component row */}
                <div className="flex gap-3">
                  {['Button', 'Card', 'Form'].map((comp) => (
                    <div
                      key={comp}
                      className="px-2.5 py-1 rounded border text-center"
                      style={{ borderColor: 'var(--color-primary-200)', backgroundColor: 'white' }}
                    >
                      <span className="text-[7px] font-medium" style={{ color: 'var(--color-surface-700)' }}>{comp}</span>
                    </div>
                  ))}
                </div>

                {/* Connection lines to page */}
                <svg className="w-24 h-3" viewBox="0 0 96 12" fill="none">
                  <path d="M16 0 L48 12" stroke="var(--color-primary-300)" strokeWidth="0.75" strokeDasharray="3 2" />
                  <path d="M48 0 L48 12" stroke="var(--color-primary-300)" strokeWidth="0.75" strokeDasharray="3 2" />
                  <path d="M80 0 L48 12" stroke="var(--color-primary-300)" strokeWidth="0.75" strokeDasharray="3 2" />
                </svg>

                {/* Page block */}
                <div
                  className="px-4 py-1.5 rounded border"
                  style={{ borderColor: 'var(--color-primary-400)', backgroundColor: 'var(--color-primary-50)' }}
                >
                  <span className="text-[7px] font-semibold" style={{ color: 'var(--color-primary-600)' }}>Page</span>
                </div>

                {/* Counter */}
                <span className="text-[8px] font-mono" style={{ color: 'var(--color-surface-500)' }}>1 system = 40+ pages</span>
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

          {/* Card 3: Performance as a design constraint — Gauge dashboard */}
          <Card padding="none" hover={false} className="md:col-span-2">
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-3 flex flex-col items-center justify-center">
                {/* Semi-circular gauge */}
                <svg className="w-28 h-16" viewBox="0 0 120 64" fill="none">
                  {/* Gauge arc background */}
                  <path
                    d="M10 58 A50 50 0 0 1 110 58"
                    stroke="var(--color-surface-200)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Gauge arc filled — gradient effect via segments */}
                  <path
                    d="M10 58 A50 50 0 0 1 30 18"
                    stroke="var(--color-error)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.6"
                  />
                  <path
                    d="M30 18 A50 50 0 0 1 60 8"
                    stroke="var(--color-warning)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.6"
                  />
                  <path
                    d="M60 8 A50 50 0 0 1 110 58"
                    stroke="var(--color-success)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Needle — pointing to ~95 position */}
                  <line x1="60" y1="58" x2="98" y2="28" stroke="var(--color-surface-800)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="60" cy="58" r="3" fill="var(--color-surface-800)" />
                  {/* Score */}
                  <text x="60" y="52" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--color-surface-900)" style={{ fontFamily: 'var(--font-mono)' }}>96</text>
                </svg>

                {/* Metric rows */}
                <div className="mt-2 w-full space-y-1">
                  {[
                    { label: 'LCP', value: '1.2s' },
                    { label: 'CLS', value: '0.01' },
                    { label: 'FID', value: '18ms' },
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center gap-2 px-2">
                      <span className="text-[6px] font-mono font-medium w-5" style={{ color: 'var(--color-surface-500)' }}>{metric.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-surface-100">
                        <div className="h-full rounded-full" style={{ width: '85%', backgroundColor: 'var(--color-success)' }} />
                      </div>
                      <span className="text-[6px] font-mono" style={{ color: 'var(--color-success)' }}>{metric.value}</span>
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

          {/* ── Row 2: 2 equal cards (each span-3 of 6) ── */}

          {/* Card 4: Search and AI-ready structure — Semantic heading tree (side-by-side) */}
          <Card padding="none" hover={false} className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-5" aria-hidden="true">
                <div className="h-full rounded-xl bg-surface-50 border border-surface-100 p-3 flex flex-col">
                  {/* Heading tree */}
                  <div className="space-y-1.5 flex-1">
                    {/* H1 */}
                    <div className="flex items-center gap-2">
                      <span className="text-[6px] font-mono font-semibold" style={{ color: 'var(--color-surface-400)' }}>&lt;h1&gt;</span>
                      <div className="h-2 w-[70%] rounded-full" style={{ backgroundColor: 'var(--color-surface-800)' }} />
                      <span className="text-[6px] font-mono" style={{ color: 'var(--color-primary-500)' }}>Entity</span>
                    </div>
                    {/* H2 */}
                    <div className="flex items-center gap-2 pl-3">
                      <span className="text-[6px] font-mono font-semibold" style={{ color: 'var(--color-surface-400)' }}>&lt;h2&gt;</span>
                      <div className="h-1.5 w-[55%] rounded-full" style={{ backgroundColor: 'var(--color-surface-600)' }} />
                      <span className="text-[6px] font-mono" style={{ color: 'var(--color-primary-500)' }}>Parsed</span>
                    </div>
                    {/* H3 */}
                    <div className="flex items-center gap-2 pl-6">
                      <span className="text-[6px] font-mono font-semibold" style={{ color: 'var(--color-surface-400)' }}>&lt;h3&gt;</span>
                      <div className="h-1.5 w-[40%] rounded-full" style={{ backgroundColor: 'var(--color-surface-400)' }} />
                    </div>
                    {/* FAQ Q/A — highlighted */}
                    <div
                      className="rounded px-2 py-1 ml-3"
                      style={{ backgroundColor: 'var(--color-primary-50)' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[6px] font-mono font-semibold" style={{ color: 'var(--color-primary-600)' }}>Q:</span>
                        <div className="h-1 w-[60%] rounded-full" style={{ backgroundColor: 'var(--color-primary-300)' }} />
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[6px] font-mono font-semibold" style={{ color: 'var(--color-primary-600)' }}>A:</span>
                        <div className="h-1 w-[50%] rounded-full" style={{ backgroundColor: 'var(--color-primary-200)' }} />
                      </div>
                    </div>
                    {/* Schema annotation */}
                    <div className="flex items-center gap-1.5 pl-1 mt-1">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="5" r="3" stroke="var(--color-success)" strokeWidth="1" fill="none" />
                        <line x1="8" y1="7" x2="10" y2="9" stroke="var(--color-success)" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                      <span className="text-[6px] font-mono font-medium" style={{ color: 'var(--color-surface-500)' }}>Schema</span>
                    </div>
                  </div>

                  {/* Bottom badge strip */}
                  <div className="flex gap-1.5 mt-2">
                    {['Human', 'Search', 'AI'].map((audience) => (
                      <span
                        key={audience}
                        className="text-[6px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                        style={{
                          backgroundColor: 'rgba(34,197,94,0.1)',
                          color: 'var(--color-success)',
                        }}
                      >
                        {audience} &#10003;
                      </span>
                    ))}
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

          {/* Card 5: Brand execution with substance — Trust hierarchy stack (side-by-side) */}
          <Card padding="none" hover={false} className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-5" aria-hidden="true">
                <div className="h-full rounded-xl bg-surface-50 border border-surface-100 p-3 flex items-center gap-3">
                  {/* Stacked trust layers */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    {/* Top layer — Conversion Clarity */}
                    <div className="w-full h-8 rounded-lg flex items-center justify-center bg-white border border-surface-200">
                      <span className="text-[7px] font-semibold" style={{ color: 'var(--color-surface-700)' }}>Conversion Clarity</span>
                    </div>
                    {/* Middle — Information Architecture */}
                    <div
                      className="w-full h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary-50)' }}
                    >
                      <span className="text-[7px] font-semibold" style={{ color: 'var(--color-primary-600)' }}>Information Architecture</span>
                    </div>
                    {/* Bottom — Visual Identity */}
                    <div
                      className="w-full h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary-100)' }}
                    >
                      <span className="text-[7px] font-semibold" style={{ color: 'var(--color-primary-700)' }}>Visual Identity</span>
                    </div>

                    {/* Shield annotation */}
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1L2 3v3c0 2.5 2 4.5 4 5 2-.5 4-2.5 4-5V3L6 1z" fill="var(--color-primary-100)" stroke="var(--color-primary-500)" strokeWidth="0.75" />
                      </svg>
                      <span className="text-[7px] font-semibold" style={{ color: 'var(--color-primary-600)' }}>Enterprise-ready</span>
                    </div>
                  </div>

                  {/* Trust meter bar */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <span className="text-[6px] font-mono" style={{ color: 'var(--color-surface-400)' }}>Trust</span>
                    <div className="w-2.5 h-24 rounded-full bg-surface-200 relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-full"
                        style={{
                          height: '80%',
                          background: 'linear-gradient(to top, var(--color-surface-300), var(--color-success))',
                        }}
                      />
                    </div>
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M3 6l2 2 4-4" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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

      {/* ─── Section 6: FAQ ─── */}
      <FAQ
        title={content.faq.title}
        items={content.faq.items}
        showFooter
      />

      {/* ─── Section 7: CTA ─── */}
      <CTA
        title={content.cta.title}
        subtitle={content.cta.subtitle}
        ctaText={content.cta.ctaText}
      />
    </>
  );
}
