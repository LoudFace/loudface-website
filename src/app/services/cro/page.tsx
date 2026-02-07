/**
 * CRO Service Page
 *
 * Data Sources:
 * - JSON: services-cro.json (via content layer)
 */
import type { Metadata } from 'next';
import { getServicesCroContent } from '@/lib/content-utils';
import {
  SectionContainer,
  SectionHeader,
  Card,
  Button,
  BulletLabel,
  ConversionSplitVisual,
} from '@/components/ui';
import { FAQ, CTA } from '@/components/sections';

export const metadata: Metadata = {
  title: 'Conversion Rate Optimization Services',
  description:
    'Turn your existing traffic into revenue with systematic CRO programs. We run conversion audits, test headlines and CTAs, and report against pipeline outcomes weekly.',
  alternates: {
    canonical: '/services/cro',
  },
};

export default function CroServicePage() {
  const content = getServicesCroContent();

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

          {/* Right — A/B Test Animation */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center">
            <ConversionSplitVisual />
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
          {/* Card 1: High traffic, flat pipeline — Paired bar chart */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center px-4" aria-hidden="true">
              <svg className="w-full h-16" viewBox="0 0 220 64" fill="none">
                {/* Baseline */}
                <line x1="8" y1="56" x2="158" y2="56" stroke="var(--color-surface-200)" strokeWidth="0.75" />
                {/* Bar pairs — traffic (ascending) + pipeline (flat) */}
                {[
                  { x: 14, tH: 18 },
                  { x: 40, tH: 26 },
                  { x: 66, tH: 34 },
                  { x: 92, tH: 40 },
                  { x: 118, tH: 48 },
                ].map((bar, i) => (
                  <g key={i}>
                    <rect x={bar.x} y={56 - bar.tH} width="10" height={bar.tH} rx="2" fill="var(--color-surface-300)" />
                    <rect x={bar.x + 13} y={48} width="10" height={8} rx="2" fill="var(--color-error)" opacity="0.6" />
                  </g>
                ))}
                {/* Legend */}
                <rect x="166" y="22" width="8" height="8" rx="1.5" fill="var(--color-surface-300)" />
                <text x="178" y="29" fontSize="8" fill="var(--color-surface-400)" fontWeight="500">Traffic</text>
                <rect x="166" y="36" width="8" height="8" rx="1.5" fill="var(--color-error)" opacity="0.6" />
                <text x="178" y="43" fontSize="8" fill="var(--color-error)" fontWeight="500">Pipeline</text>
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

          {/* Card 2: Design-first, conversion-second — Scorecard comparison */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center px-5" aria-hidden="true">
              <svg className="w-full h-14" viewBox="0 0 200 56" fill="none">
                {/* Row 1 — Design score: high */}
                <text x="0" y="12" fontSize="9" fontWeight="600" fill="var(--color-surface-500)">Design</text>
                <rect x="50" y="4" width="120" height="10" rx="3" fill="var(--color-surface-100)" />
                <rect x="50" y="4" width="108" height="10" rx="3" fill="var(--color-surface-300)" />
                <text x="178" y="13" fontSize="9" fontWeight="700" fill="var(--color-surface-500)" style={{ fontFamily: 'var(--font-mono)' }}>9.2</text>

                {/* Row 2 — Conversion score: dangerously low */}
                <text x="0" y="46" fontSize="9" fontWeight="600" fill="var(--color-surface-500)">Conversion</text>
                <rect x="70" y="38" width="100" height="10" rx="3" fill="var(--color-surface-100)" />
                <rect x="70" y="38" width="9" height="10" rx="3" fill="var(--color-error)" opacity="0.7" />
                <text x="178" y="47" fontSize="9" fontWeight="700" fill="var(--color-error)" style={{ fontFamily: 'var(--font-mono)' }}>0.8%</text>

                {/* Dotted connector — the gap */}
                <line x1="100" y1="18" x2="100" y2="34" stroke="var(--color-surface-200)" strokeWidth="1" strokeDasharray="2 2" />
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

          {/* Card 3: Random tests, no system — Zigzag line chart (no trend) */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center px-4" aria-hidden="true">
              <svg className="w-full h-16" viewBox="0 0 200 64" fill="none">
                {/* Goal line — never reached */}
                <line x1="10" y1="10" x2="190" y2="10" stroke="var(--color-success)" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                <text x="192" y="13" fontSize="7" fill="var(--color-success)" fontWeight="500" opacity="0.5">Goal</text>

                {/* Baseline */}
                <line x1="10" y1="56" x2="190" y2="56" stroke="var(--color-surface-200)" strokeWidth="0.75" />

                {/* Zigzag path — random, volatile, going nowhere */}
                <polyline
                  points="20,42 48,24 76,46 104,20 132,44 160,30 188,48"
                  stroke="var(--color-surface-400)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Data points with mixed results */}
                {[
                  { x: 20, y: 42, pass: false },
                  { x: 48, y: 24, pass: true },
                  { x: 76, y: 46, pass: false },
                  { x: 104, y: 20, pass: true },
                  { x: 132, y: 44, pass: false },
                  { x: 160, y: 30, pass: true },
                  { x: 188, y: 48, pass: false },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="4" fill="white" stroke={pt.pass ? 'var(--color-success)' : 'var(--color-error)'} strokeWidth="1.5" />
                    {pt.pass ? (
                      <path d={`M${pt.x - 1.5},${pt.y} l1.5,1.5 2.5,-2.5`} stroke="var(--color-success)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    ) : (
                      <g>
                        <line x1={pt.x - 1.5} y1={pt.y - 1.5} x2={pt.x + 1.5} y2={pt.y + 1.5} stroke="var(--color-error)" strokeWidth="1" strokeLinecap="round" />
                        <line x1={pt.x + 1.5} y1={pt.y - 1.5} x2={pt.x - 1.5} y2={pt.y + 1.5} stroke="var(--color-error)" strokeWidth="1" strokeLinecap="round" />
                      </g>
                    )}
                  </g>
                ))}
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

      {/* ─── Section 4: Capabilities Bento Grid ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.capabilities.title}
          highlightWord={content.capabilities.highlightWord}
        />

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
          {/* ── Row 1: 3 equal cards (each span-2 of 6) ── */}

          {/* Card 1: Conversion clarity — Horizontal Funnel */}
          <Card padding="none" hover={false} className="md:col-span-2">
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-4 flex flex-col justify-center gap-2.5">
                {[
                  { label: 'Visitors', pct: '100%', width: '100%', color: 'var(--color-surface-300)' },
                  { label: 'Leads', pct: '18%', width: '54%', color: 'var(--color-primary-300)' },
                  { label: 'MQLs', pct: '6.2%', width: '28%', color: 'var(--color-primary-400)' },
                  { label: 'Closed', pct: '1.2%', width: '8%', color: 'var(--color-error)', opacity: 0.7 },
                ].map((stage) => (
                  <div key={stage.label} className="flex items-center gap-2.5">
                    <span className="text-[10px] font-medium text-surface-500 w-12 text-right shrink-0">{stage.label}</span>
                    <div className="flex-1 h-4 bg-surface-100 rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: stage.width, background: stage.color, opacity: stage.opacity ?? 1 }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-surface-500 w-8 shrink-0">{stage.pct}</span>
                  </div>
                ))}
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

          {/* Card 2: Confidence-building design — Trust Signal Stack */}
          <Card padding="none" hover={false} className="md:col-span-2">
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-3 flex flex-col justify-center gap-1.5">
                {/* Star rating */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-surface-200">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3" viewBox="0 0 16 16" fill="var(--color-warning)">
                        <path d="M8 1l2.2 4.5 5 .7-3.6 3.5.9 5L8 12.4l-4.5 2.3.9-5L.8 6.2l5-.7z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-surface-700">4.9/5</span>
                  <span className="text-[9px] text-surface-400 ml-auto">142 reviews</span>
                </div>
                {/* Logo strip */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-surface-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-4 rounded-sm bg-surface-300" />
                    <div className="w-7 h-3.5 rounded-sm bg-surface-200" />
                    <div className="w-4 h-4 rounded-full bg-surface-300" />
                    <div className="w-6 h-3 rounded-sm bg-surface-200" />
                  </div>
                  <span className="text-[10px] text-surface-400 font-medium ml-auto">200+ teams</span>
                </div>
                {/* Security badge */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-surface-200">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5L2 4v4c0 3.5 2.6 6.8 6 7.5 3.4-.7 6-4 6-7.5V4L8 1.5z" fill="var(--color-success)" fillOpacity="0.15" stroke="var(--color-success)" strokeWidth="1.2" />
                    <path d="M5.5 8l2 2 3-3" stroke="var(--color-success)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[10px] text-surface-600 font-medium">Secure checkout</span>
                  <svg className="w-3 h-3 ml-auto flex-shrink-0" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="var(--color-success)" fillOpacity="0.15" />
                    <path d="M5 8l2 2 4-4" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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

          {/* Card 3: Copy that converts — Page Anatomy Mockup */}
          <Card padding="none" hover={false} className="md:col-span-2">
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-3 flex gap-3">
                {/* Mini page wireframe */}
                <div className="flex-1 rounded-lg border border-surface-200 bg-white p-2.5 flex flex-col gap-1.5 min-w-0">
                  <div className="h-2.5 w-[85%] bg-surface-800 rounded-full" />
                  <div className="h-1.5 w-[60%] bg-surface-200 rounded-full" />
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex -space-x-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-surface-200 border border-white" />
                      <div className="w-2.5 h-2.5 rounded-full bg-surface-300 border border-white" />
                      <div className="w-2.5 h-2.5 rounded-full bg-surface-200 border border-white" />
                    </div>
                    <div className="h-1 w-8 bg-surface-100 rounded-full" />
                  </div>
                  <div className="h-1 w-full bg-surface-100 rounded-full mt-1" />
                  <div className="h-1 w-[90%] bg-surface-100 rounded-full" />
                  <div className="h-1 w-[75%] bg-surface-100 rounded-full" />
                  <div className="h-3.5 w-[55%] bg-primary-500 rounded mt-1.5" />
                </div>
                {/* Callout labels */}
                <div className="flex flex-col justify-between py-1 shrink-0">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-primary-500" />
                    <span className="text-[8px] font-semibold text-primary-600">Headline</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-primary-400" />
                    <span className="text-[8px] font-semibold text-primary-500">Proof</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-surface-400" />
                    <span className="text-[8px] font-medium text-surface-400">Body</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-primary-500" />
                    <span className="text-[8px] font-semibold text-primary-600">CTA</span>
                  </div>
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

          {/* Card 4: Technical performance — Waterfall + Checklist (side-by-side) */}
          <Card padding="none" hover={false} className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-5" aria-hidden="true">
                <div className="h-full rounded-xl bg-surface-50 border border-surface-100 p-4 flex flex-col">
                  {/* Waterfall header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xs font-medium text-surface-400 uppercase tracking-wider">Load timeline</span>
                    <span className="text-xs font-mono font-semibold" style={{ color: 'var(--color-success)' }}>1.2s</span>
                  </div>
                  {/* Waterfall bars */}
                  <div className="space-y-2">
                    {[
                      { label: 'TTFB', start: 0, width: 12, time: '0.18s', color: 'var(--color-primary-300)' },
                      { label: 'FCP', start: 12, width: 20, time: '0.44s', color: 'var(--color-primary-400)' },
                      { label: 'LCP', start: 12, width: 38, time: '0.82s', color: 'var(--color-primary-500)' },
                      { label: 'CLS', start: 0, width: 4, time: '0.01', color: 'var(--color-success)' },
                    ].map((metric) => (
                      <div key={metric.label} className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-medium text-surface-500 w-7 shrink-0">{metric.label}</span>
                        <div className="flex-1 h-2.5 bg-surface-100 rounded-full overflow-hidden relative">
                          <div
                            className="absolute top-0 h-full rounded-full"
                            style={{
                              left: `${metric.start}%`,
                              width: `${metric.width}%`,
                              background: metric.color,
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-surface-400 w-7 shrink-0 text-right">{metric.time}</span>
                      </div>
                    ))}
                  </div>
                  {/* Checklist */}
                  <div className="mt-3 pt-3 border-t border-surface-200 space-y-1.5">
                    {[
                      { label: 'Page load < 2s', pass: true },
                      { label: 'Mobile optimized', pass: true },
                      { label: 'CTA above fold', pass: true },
                      { label: 'No layout shift', pass: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" fill={item.pass ? 'var(--color-success)' : 'var(--color-error)'} fillOpacity="0.12" />
                          {item.pass ? (
                            <path d="M5 8l2 2 4-4" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          ) : (
                            <g>
                              <line x1="5.5" y1="5.5" x2="10.5" y2="10.5" stroke="var(--color-error)" strokeWidth="1.5" strokeLinecap="round" />
                              <line x1="10.5" y1="5.5" x2="5.5" y2="10.5" stroke="var(--color-error)" strokeWidth="1.5" strokeLinecap="round" />
                            </g>
                          )}
                        </svg>
                        <span className="text-[10px] font-medium text-surface-600">{item.label}</span>
                      </div>
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

          {/* Card 5: Data-driven iteration — Test Performance Dashboard (side-by-side) */}
          <Card padding="none" hover={false} className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-5" aria-hidden="true">
                <div className="h-full rounded-xl bg-surface-50 border border-surface-100 p-4">
                  <div className="text-2xs font-medium text-surface-400 uppercase tracking-wider mb-3">
                    Test Performance
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { name: 'Headline test', lift: '+24%', width: '48%', status: 'Shipped', color: 'var(--color-success)' },
                      { name: 'CTA color', lift: '+18%', width: '36%', status: 'Shipped', color: 'var(--color-success)' },
                      { name: 'Form layout', lift: '+31%', width: '62%', status: 'Running', color: 'var(--color-primary-500)' },
                    ].map((test) => (
                      <div key={test.name}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-surface-600">{test.name}</span>
                          <span
                            className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full ml-auto"
                            style={{
                              color: test.color,
                              backgroundColor: test.status === 'Running' ? 'var(--color-primary-50)' : undefined,
                              background: test.status !== 'Running' ? `color-mix(in srgb, ${test.color} 12%, transparent)` : undefined,
                            }}
                          >
                            {test.status}
                          </span>
                          <span className="text-xs font-mono font-semibold" style={{ color: test.color }}>{test.lift}</span>
                        </div>
                        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: test.width, background: test.color, opacity: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Cumulative lift bar */}
                  <div className="mt-3.5 pt-3 border-t border-surface-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-surface-500 uppercase tracking-wider">Cumulative lift</span>
                      <span className="text-sm font-mono font-semibold text-surface-900">+124%</span>
                    </div>
                    <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: '82%', background: 'linear-gradient(to right, var(--color-primary-400), var(--color-primary-600))' }}
                      />
                    </div>
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

      {/* ─── Section 5: FAQ ─── */}
      <FAQ
        title={content.faq.title}
        items={content.faq.items}
        showFooter
      />

      {/* ─── Section 6: CTA ─── */}
      <CTA
        title={content.cta.title}
        subtitle={content.cta.subtitle}
        ctaText={content.cta.ctaText}
      />
    </>
  );
}
