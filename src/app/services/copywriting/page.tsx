/**
 * Copywriting Service Page
 *
 * Data Sources:
 * - JSON: services-copywriting.json (via content layer)
 */
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getServicesCopywritingContent } from '@/lib/content-utils';
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
const CopyFirstVisual = dynamic(
  () => import('@/components/ui/CopyFirstVisual').then(m => ({ default: m.CopyFirstVisual })),
);

export const metadata: Metadata = {
  title: 'Messaging & Copywriting Services',
  description:
    'Copy-first website messaging and content production for B2B and SaaS companies. Positioning, conversion copy, and programmatic content systems — all optimized for humans, search engines, and AI citations.',
  alternates: {
    canonical: '/services/copywriting',
  },
};

export default function CopywritingServicePage() {
  const content = getServicesCopywritingContent();

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

          {/* Right — Copy-First Animation */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center">
            <CopyFirstVisual />
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
          {/* Card 1: Copy that fills layouts — Wireframe with empty text slots */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center px-4" aria-hidden="true">
              <svg className="w-full h-16" viewBox="0 0 200 64" fill="none">
                {/* Page outline */}
                <rect x="30" y="2" width="140" height="60" rx="4" fill="none" stroke="var(--color-surface-200)" strokeWidth="1" />
                {/* Nav bar */}
                <rect x="30" y="2" width="140" height="8" rx="4" fill="var(--color-surface-100)" />
                {/* Dashed headline slot */}
                <rect x="44" y="16" width="90" height="8" rx="2" fill="none" stroke="var(--color-surface-300)" strokeWidth="1" strokeDasharray="4 3" />
                <text x="72" y="23" fontSize="5" fill="var(--color-surface-300)" fontWeight="500" style={{ fontFamily: 'var(--font-mono)' }}>lorem</text>
                {/* Dashed subhead slot */}
                <rect x="52" y="28" width="65" height="6" rx="2" fill="none" stroke="var(--color-surface-300)" strokeWidth="0.75" strokeDasharray="3 2.5" />
                <text x="72" y="33" fontSize="4" fill="var(--color-surface-300)" fontWeight="400" style={{ fontFamily: 'var(--font-mono)' }}>lorem</text>
                {/* Dashed CTA slot */}
                <rect x="58" y="40" width="50" height="10" rx="3" fill="none" stroke="var(--color-surface-300)" strokeWidth="0.75" strokeDasharray="3 2.5" />
                {/* Cursor icon — I-beam */}
                <line x1="82" y1="18" x2="82" y2="22" stroke="var(--color-error)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                <line x1="80" y1="18" x2="84" y2="18" stroke="var(--color-error)" strokeWidth="0.75" strokeLinecap="round" opacity="0.5" />
                <line x1="80" y1="22" x2="84" y2="22" stroke="var(--color-error)" strokeWidth="0.75" strokeLinecap="round" opacity="0.5" />
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

          {/* Card 2: Sounds like everyone else — Three identical browser frames */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center px-4" aria-hidden="true">
              <svg className="w-full h-16" viewBox="0 0 220 64" fill="none">
                {/* Frame 1 (back) */}
                <g transform="translate(10, 0)">
                  <rect x="0" y="0" width="90" height="58" rx="3" fill="white" stroke="var(--color-surface-200)" strokeWidth="0.75" />
                  <rect x="8" y="10" width="55" height="3" rx="1" fill="var(--color-surface-300)" />
                  <rect x="8" y="17" width="40" height="2" rx="1" fill="var(--color-surface-200)" />
                  <rect x="8" y="30" width="32" height="6" rx="1.5" fill="var(--color-surface-300)" />
                  <text x="8" y="48" fontSize="6" fill="var(--color-surface-400)" fontWeight="500">Competitor</text>
                </g>
                {/* Frame 2 (middle — "You") */}
                <g transform="translate(55, 3)">
                  <rect x="0" y="0" width="90" height="58" rx="3" fill="white" stroke="var(--color-surface-200)" strokeWidth="0.75" />
                  <rect x="8" y="10" width="55" height="3" rx="1" fill="var(--color-surface-300)" />
                  <rect x="8" y="17" width="40" height="2" rx="1" fill="var(--color-surface-200)" />
                  <rect x="8" y="30" width="32" height="6" rx="1.5" fill="var(--color-surface-300)" />
                  <text x="8" y="48" fontSize="6" fill="var(--color-error)" fontWeight="600">You</text>
                </g>
                {/* Frame 3 (front) */}
                <g transform="translate(108, 1)">
                  <rect x="0" y="0" width="90" height="58" rx="3" fill="white" stroke="var(--color-surface-200)" strokeWidth="0.75" />
                  <rect x="8" y="10" width="55" height="3" rx="1" fill="var(--color-surface-300)" />
                  <rect x="8" y="17" width="40" height="2" rx="1" fill="var(--color-surface-200)" />
                  <rect x="8" y="30" width="32" height="6" rx="1.5" fill="var(--color-surface-300)" />
                  <text x="8" y="48" fontSize="6" fill="var(--color-surface-400)" fontWeight="500">Competitor</text>
                </g>
                {/* Equals signs */}
                <text x="46" y="34" fontSize="12" fill="var(--color-surface-300)" fontWeight="700">=</text>
                <text x="100" y="34" fontSize="12" fill="var(--color-surface-300)" fontWeight="700">=</text>
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

          {/* Card 3: Content with no compounding — Scattered docs on flat line */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center px-4" aria-hidden="true">
              <svg className="w-full h-16" viewBox="0 0 200 64" fill="none">
                {/* Goal line — never reached */}
                <line x1="10" y1="10" x2="190" y2="10" stroke="var(--color-success)" strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />
                <text x="192" y="13" fontSize="6" fill="var(--color-success)" fontWeight="500" opacity="0.4">Authority</text>

                {/* Flat traffic line */}
                <path
                  d="M10,42 C40,40 60,44 90,41 C120,43 150,40 190,43"
                  stroke="var(--color-surface-400)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Scattered document icons */}
                {[
                  { x: 18, y: 26, r: -8 },
                  { x: 55, y: 48, r: 12 },
                  { x: 88, y: 22, r: -3 },
                  { x: 120, y: 50, r: 7 },
                  { x: 150, y: 28, r: -10 },
                  { x: 175, y: 46, r: 5 },
                ].map((doc, i) => (
                  <g key={i} transform={`translate(${doc.x}, ${doc.y}) rotate(${doc.r})`}>
                    {/* Doc body */}
                    <rect x="0" y="0" width="12" height="14" rx="1.5" fill="var(--color-surface-200)" stroke="var(--color-surface-300)" strokeWidth="0.5" />
                    {/* Folded corner */}
                    <path d="M8.5,0 L12,3.5 L8.5,3.5 Z" fill="var(--color-surface-300)" />
                    {/* Skeleton lines */}
                    <line x1="2" y1="6" x2="9" y2="6" stroke="var(--color-surface-300)" strokeWidth="0.5" />
                    <line x1="2" y1="8.5" x2="7" y2="8.5" stroke="var(--color-surface-300)" strokeWidth="0.5" />
                    <line x1="2" y1="11" x2="8" y2="11" stroke="var(--color-surface-300)" strokeWidth="0.5" />
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

          {/* Card 1: Positioning-first — Messaging hierarchy pyramid */}
          <Card padding="none" hover={false} className="md:col-span-2">
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-4 flex flex-col items-center justify-center gap-1.5">
                {/* Pyramid layers: narrow on top, wide on bottom */}
                {[
                  { label: 'CTAs', width: '30%', bg: 'var(--color-primary-200)', text: 'var(--color-primary-600)' },
                  { label: 'Page copy', width: '50%', bg: 'var(--color-primary-100)', text: 'var(--color-primary-600)' },
                  { label: 'Messaging', width: '70%', bg: 'var(--color-primary-100)', text: 'var(--color-primary-600)' },
                  { label: 'Positioning', width: '90%', bg: 'var(--color-primary-500)', text: 'white' },
                ].map((layer) => (
                  <div
                    key={layer.label}
                    className="h-6 rounded flex items-center justify-center"
                    style={{ width: layer.width, backgroundColor: layer.bg }}
                  >
                    <span className="text-[8px] font-semibold" style={{ color: layer.text }}>{layer.label}</span>
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

          {/* Card 2: Founder voice extraction — Before/after translation */}
          <Card padding="none" hover={false} className="md:col-span-2">
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-3 flex items-center gap-2">
                {/* Messy speech bubble (left) */}
                <div className="flex-1 min-w-0">
                  <div className="rounded-lg border border-surface-200 bg-white p-2 relative">
                    <div className="space-y-1">
                      <div className="h-1.5 w-[95%] bg-surface-300 rounded-full" style={{ transform: 'rotate(-1deg)' }} />
                      <div className="h-1.5 w-[80%] bg-surface-400 rounded-full" style={{ transform: 'rotate(0.5deg)' }} />
                      <div className="h-1.5 w-[88%] bg-surface-300 rounded-full" style={{ transform: 'rotate(-0.5deg)' }} />
                      <div className="h-1.5 w-[65%] bg-surface-200 rounded-full" />
                    </div>
                    {/* Speech tail */}
                    <div className="absolute -bottom-1.5 left-3 w-3 h-3 bg-white border-b border-r border-surface-200 rotate-45" />
                  </div>
                  <span className="text-[7px] font-medium text-surface-400 mt-2 block text-center">Founder</span>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
                    <path d="M2 8h16M18 8l-4-4M18 8l-4 4" stroke="var(--color-primary-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Clean document (right) */}
                <div className="flex-1 min-w-0">
                  <div className="rounded-lg bg-white p-2 relative" style={{ border: '1px solid var(--color-primary-200)' }}>
                    <div className="space-y-1">
                      <div className="h-2 w-[90%] bg-surface-800 rounded-full" />
                      <div className="h-1 w-[75%] bg-surface-200 rounded-full" />
                      <div className="h-1 w-[85%] bg-surface-200 rounded-full" />
                      <div className="h-1 w-[60%] bg-surface-200 rounded-full" />
                    </div>
                    {/* Checkmark */}
                    <div className="absolute -top-1.5 -right-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" fill="var(--color-success)" fillOpacity="0.15" />
                        <path d="M5 8l2 2 4-4" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[7px] font-medium mt-2 block text-center" style={{ color: 'var(--color-primary-600)' }}>Clear copy</span>
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

          {/* Card 3: SEO & AEO-native writing — Document with dual annotations */}
          <Card padding="none" hover={false} className="md:col-span-2">
            <div className="p-5" aria-hidden="true">
              <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 p-3 flex items-center gap-2">
                {/* SEO annotations (left) */}
                <div className="flex flex-col gap-4 items-end flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                      <circle cx="7" cy="7" r="4" stroke="var(--color-success)" strokeWidth="1.2" />
                      <path d="M10 10l3.5 3.5" stroke="var(--color-success)" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <span className="text-[6px] font-semibold" style={{ color: 'var(--color-success)' }}>SEO</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                      <circle cx="7" cy="7" r="4" stroke="var(--color-success)" strokeWidth="1.2" />
                      <path d="M10 10l3.5 3.5" stroke="var(--color-success)" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <span className="text-[6px] font-semibold" style={{ color: 'var(--color-success)' }}>H2</span>
                  </div>
                </div>

                {/* Document center */}
                <div className="flex-1 rounded-lg bg-white border border-surface-200 p-2.5 min-w-0">
                  <div className="space-y-2">
                    {/* H1 line */}
                    <div className="h-2 w-[70%] bg-surface-800 rounded-full" />
                    {/* Paragraph */}
                    <div className="space-y-1">
                      <div className="h-1 w-[85%] bg-surface-200 rounded-full" />
                      <div className="h-1 w-[75%] bg-surface-200 rounded-full" />
                    </div>
                    {/* H2 question heading */}
                    <div className="h-1.5 w-[65%] bg-surface-700 rounded-full" />
                    {/* Answer paragraph */}
                    <div className="space-y-1">
                      <div className="h-1 w-[80%] bg-surface-200 rounded-full" />
                      <div className="h-1 w-[60%] bg-surface-200 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* AEO annotations (right) */}
                <div className="flex flex-col gap-4 items-start flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[6px] font-semibold" style={{ color: 'var(--color-primary-500)' }}>AI</span>
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                      <path d="M2 3h12v8H4l-2 2V3z" fill="var(--color-primary-100)" stroke="var(--color-primary-400)" strokeWidth="1" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[6px] font-semibold" style={{ color: 'var(--color-primary-500)' }}>Cited</span>
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                      <path d="M2 3h12v8H4l-2 2V3z" fill="var(--color-primary-100)" stroke="var(--color-primary-400)" strokeWidth="1" />
                    </svg>
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

          {/* Card 4: Programmatic content systems — Content matrix (side-by-side) */}
          <Card padding="none" hover={false} className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-5" aria-hidden="true">
                <div className="h-full rounded-xl bg-surface-50 border border-surface-100 p-4 flex flex-col">
                  {/* Template source */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-6 rounded-sm flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-500)' }}>
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 3h8M2 6h6M2 9h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-semibold" style={{ color: 'var(--color-primary-600)' }}>Template</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-primary-200)' }} />
                  </div>

                  {/* 3x3 mini doc grid */}
                  <div className="grid grid-cols-3 gap-1.5 flex-1">
                    {[
                      { tag: 'SaaS', shade: 'var(--color-primary-50)' },
                      { tag: 'Fintech', shade: 'var(--color-primary-100)' },
                      { tag: 'Health', shade: 'var(--color-primary-50)' },
                      { tag: 'Devs', shade: 'var(--color-primary-100)' },
                      { tag: 'PMs', shade: 'var(--color-primary-50)' },
                      { tag: 'Execs', shade: 'var(--color-primary-100)' },
                      { tag: 'vs X', shade: 'var(--color-primary-50)' },
                      { tag: 'vs Y', shade: 'var(--color-primary-100)' },
                      { tag: 'vs Z', shade: 'var(--color-primary-50)' },
                    ].map((doc) => (
                      <div key={doc.tag} className="rounded bg-white border border-surface-200 p-1 flex flex-col">
                        <div className="h-1 w-[80%] bg-surface-300 rounded-full mb-0.5" />
                        <div className="h-0.5 w-[60%] bg-surface-200 rounded-full mb-0.5" />
                        <div className="mt-auto">
                          <span
                            className="text-[5px] font-semibold px-1 py-0.5 rounded block text-center"
                            style={{ backgroundColor: doc.shade, color: 'var(--color-primary-700)' }}
                          >
                            {doc.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Counter */}
                  <div className="mt-2 text-right">
                    <span className="text-[9px] font-medium" style={{ color: 'var(--color-surface-500)', fontFamily: 'var(--font-mono)' }}>5/wk</span>
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

          {/* Card 5: Thought leadership — Bold editorial card (side-by-side) */}
          <Card padding="none" hover={false} className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-5" aria-hidden="true">
                <div className="h-full rounded-xl bg-surface-50 border border-surface-100 p-3 relative overflow-hidden">
                  {/* Faded generic articles (background) */}
                  <div className="absolute top-2 right-2 w-[55%] opacity-20">
                    <div className="rounded bg-surface-100 p-2 mb-1 border border-surface-200">
                      <div className="h-1 w-[80%] bg-surface-300 rounded-full mb-1" />
                      <div className="h-0.5 w-[60%] bg-surface-200 rounded-full" />
                    </div>
                    <div className="rounded bg-surface-100 p-2 border border-surface-200">
                      <div className="h-1 w-[75%] bg-surface-300 rounded-full mb-1" />
                      <div className="h-0.5 w-[55%] bg-surface-200 rounded-full" />
                    </div>
                  </div>

                  {/* Foreground bold article */}
                  <div
                    className="relative rounded-lg bg-white p-3 z-10"
                    style={{ borderLeft: '3px solid var(--color-primary-500)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                  >
                    {/* Large quotation mark */}
                    <span
                      className="absolute -top-1 left-2 text-2xl font-serif leading-none select-none"
                      style={{ color: 'var(--color-primary-500)', opacity: 0.35 }}
                    >
                      &ldquo;
                    </span>
                    {/* Headline */}
                    <div className="mt-3 h-2.5 w-[85%] bg-surface-900 rounded-full" />
                    <div className="mt-1.5 h-1 w-[70%] bg-surface-300 rounded-full" />
                    <div className="mt-1 h-1 w-[78%] bg-surface-200 rounded-full" />

                    {/* Author byline */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-surface-200" />
                      <span className="text-[7px] font-medium text-surface-500">Your CEO</span>
                      <span
                        className="text-[6px] font-semibold px-1.5 py-0.5 rounded-full ml-auto"
                        style={{
                          backgroundColor: 'rgba(34,197,94,0.1)',
                          color: 'var(--color-success)',
                        }}
                      >
                        Published
                      </span>
                    </div>
                  </div>

                  {/* Citation counter */}
                  <div className="mt-2 flex items-center gap-1 justify-end">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
                      <path d="M3 5h4M5 3v4" stroke="var(--color-primary-500)" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                    <span className="text-[8px] font-medium" style={{ color: 'var(--color-primary-600)' }}>47 citations</span>
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
