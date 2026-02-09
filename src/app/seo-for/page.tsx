/**
 * SEO Services by Industry — Hub/Listing Page
 *
 * Pillar page linking to all /seo-for/[slug] pages.
 * Drives internal linking equity for the programmatic SEO hub.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import {
  fetchSeoPages,
  fetchHomepageData,
  getAccessToken,
  getEmptyHomepageData,
} from '@/lib/cms-data';
import { getSeoForHubContent } from '@/lib/content-utils';
import { logoImage } from '@/lib/image-utils';
import { asset } from '@/lib/assets';
import {
  Button,
  BulletLabel,
  Card,
  SectionContainer,
  SectionHeader,
} from '@/components/ui';
import { FAQ, CTA } from '@/components/sections';
import type { SeoPage } from '@/lib/types';

export const metadata: Metadata = {
  title: 'SEO Services by Industry',
  description:
    'Industry-specific SEO strategies for E-Commerce, Healthcare, SaaS, Startups, B2B, and FinTech. Custom search optimization programs built around your sector\'s unique dynamics.',
  alternates: {
    canonical: '/seo-for',
  },
  openGraph: {
    title: 'SEO Services by Industry | LoudFace',
    description:
      'Industry-specific SEO strategies for E-Commerce, Healthcare, SaaS, Startups, B2B, and FinTech. Custom search optimization programs built around your sector\'s unique dynamics.',
    type: 'website',
    url: '/seo-for',
  },
};

// --- Industry SVG Icons (line-art style, mapped by slug) ---

const INDUSTRY_ICONS: Record<string, React.ReactNode> = {
  ecommerce: (
    <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none" stroke="var(--color-primary-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="16" width="40" height="28" rx="3" />
      <path d="M16 24h6l2 12h14l2-8H22" />
      <circle cx="24" cy="42" r="2" />
      <circle cx="36" cy="42" r="2" />
      <path d="M28 8v8" strokeDasharray="3 2" />
      <path d="M24 10l4-4 4 4" />
    </svg>
  ),
  healthcare: (
    <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none" stroke="var(--color-primary-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M28 6L8 18v20l20 12 20-12V18L28 6z" />
      <path d="M28 22v12M22 28h12" strokeWidth="2" />
      <circle cx="28" cy="28" r="10" strokeDasharray="4 3" />
    </svg>
  ),
  saas: (
    <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none" stroke="var(--color-primary-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="10" width="44" height="30" rx="3" />
      <path d="M6 18h44" />
      <circle cx="10" cy="14" r="1.5" fill="var(--color-primary-500)" stroke="none" />
      <circle cx="15" cy="14" r="1.5" fill="var(--color-primary-500)" stroke="none" />
      <rect x="12" y="24" width="4" height="10" rx="1" fill="var(--color-primary-200)" stroke="none" />
      <rect x="20" y="22" width="4" height="12" rx="1" fill="var(--color-primary-300)" stroke="none" />
      <rect x="28" y="26" width="4" height="8" rx="1" fill="var(--color-primary-200)" stroke="none" />
      <rect x="36" y="20" width="4" height="14" rx="1" fill="var(--color-primary-400)" stroke="none" />
      <path d="M20 46h16" />
      <path d="M24 40v6M32 40v6" />
    </svg>
  ),
  startups: (
    <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none" stroke="var(--color-primary-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M28 6c0 0-12 10-12 26v8l6 4v-8c0-12 6-22 6-22s6 10 6 22v8l6-4v-8C40 16 28 6 28 6z" />
      <circle cx="28" cy="26" r="3" />
      <path d="M22 48l-4 2M34 48l4 2M28 48v4" />
    </svg>
  ),
  b2b: (
    <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none" stroke="var(--color-primary-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="20" width="16" height="24" rx="2" />
      <rect x="34" y="14" width="16" height="30" rx="2" />
      <path d="M10 26h8M10 32h8M10 38h8" strokeWidth="1" />
      <path d="M38 20h8M38 26h8M38 32h8M38 38h8" strokeWidth="1" />
      <path d="M22 32h12" strokeDasharray="4 3" strokeWidth="2" />
      <circle cx="28" cy="32" r="3" fill="var(--color-primary-100)" />
    </svg>
  ),
  fintech: (
    <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none" stroke="var(--color-primary-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="28" r="12" />
      <path d="M20 22v12M17 25h6M17 31h6" strokeWidth="1.5" />
      <path d="M34 20l4 6 4-4 4 8 4-2" strokeWidth="2" />
      <path d="M34 36h16" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M34 40h12" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M34 44h8" strokeWidth="1" strokeDasharray="3 2" />
    </svg>
  ),
};

function getIndustryIcon(slug: string) {
  return INDUSTRY_ICONS[slug] || null;
}

export default async function SeoForHubPage() {
  const content = getSeoForHubContent();
  const accessToken = getAccessToken();

  const [seoPages, cmsData] = await Promise.all([
    accessToken ? fetchSeoPages(accessToken) : Promise.resolve([] as SeoPage[]),
    accessToken
      ? fetchHomepageData(accessToken).catch(() => getEmptyHomepageData())
      : Promise.resolve(getEmptyHomepageData()),
  ]);

  const showcaseClients = cmsData.allClients.filter(
    (c) => c['showcase-logo']
  );

  // --- Structured Data ---
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.loudface.co/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'SEO Services by Industry',
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Industry-Specific SEO Services',
    description:
      'Custom search engine optimization programs tailored to specific industry verticals including E-Commerce, Healthcare, SaaS, Startups, B2B, and FinTech.',
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: 'Search Engine Optimization',
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'SEO Services by Industry',
    itemListElement: seoPages.map((page, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: page['hero-headline'] || page.name,
      url: `https://www.loudface.co/seo-for/${page.slug}`,
    })),
  };

  return (
    <>
      {/* Structured Data */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {seoPages.length > 0 && (
        <Script
          id="itemlist-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}

      {/* ─── Section 1: Hero ─── */}
      <SectionContainer padding="lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="lg:col-span-7">
            <BulletLabel>{content.hero.eyebrow}</BulletLabel>

            <h1
              className="mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900 leading-tight"
              dangerouslySetInnerHTML={{ __html: content.hero.headline }}
            />

            <p className="mt-6 text-lg text-surface-600 max-w-xl">
              {content.hero.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="primary" size="lg" calTrigger>
                {content.hero.primaryCta}
              </Button>
              <Button variant="outline" size="lg" href="#approach">
                {content.hero.secondaryCta}
              </Button>
            </div>
          </div>

          {/* Right — Hub-and-Spoke Industry Network */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center">
            <svg className="w-full max-w-[300px]" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Connecting lines from center to satellites */}
              {[
                { x: 150, y: 40 },   // top
                { x: 245, y: 95 },   // top-right
                { x: 245, y: 205 },  // bottom-right
                { x: 150, y: 260 },  // bottom
                { x: 55, y: 205 },   // bottom-left
                { x: 55, y: 95 },    // top-left
              ].map((pos, i) => (
                <line
                  key={`line-${i}`}
                  x1="150"
                  y1="150"
                  x2={pos.x}
                  y2={pos.y}
                  stroke="var(--color-surface-300)"
                  strokeWidth="1.5"
                />
              ))}

              {/* Dotted connections between adjacent satellites */}
              {[
                { x1: 150, y1: 40, x2: 245, y2: 95 },
                { x1: 245, y1: 95, x2: 245, y2: 205 },
                { x1: 245, y1: 205, x2: 150, y2: 260 },
                { x1: 150, y1: 260, x2: 55, y2: 205 },
                { x1: 55, y1: 205, x2: 55, y2: 95 },
                { x1: 55, y1: 95, x2: 150, y2: 40 },
              ].map((line, i) => (
                <line
                  key={`dotted-${i}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="var(--color-surface-200)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Center hub node */}
              <circle cx="150" cy="150" r="32" fill="var(--color-primary-500)" />
              <text
                x="150"
                y="146"
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill="white"
              >
                SEO
              </text>
              <text
                x="150"
                y="162"
                textAnchor="middle"
                fontSize="9"
                fill="white"
                fillOpacity="0.8"
              >
                Strategy
              </text>

              {/* Satellite industry nodes */}
              {[
                { x: 150, y: 40, label: 'E-Com' },
                { x: 245, y: 95, label: 'SaaS' },
                { x: 245, y: 205, label: 'B2B' },
                { x: 150, y: 260, label: 'Health' },
                { x: 55, y: 205, label: 'FinTech' },
                { x: 55, y: 95, label: 'Startup' },
              ].map((node) => (
                <g key={node.label}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="22"
                    fill="var(--color-primary-100)"
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="500"
                    fill="var(--color-primary-700)"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
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

      {/* ─── Section 2: Value Proposition Cards ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.valueProps.title}
          highlightWord={content.valueProps.highlightWord}
        />

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Industry search intent — diverging intent signals */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex flex-col justify-center gap-2 px-4" aria-hidden="true">
              {[
                { label: 'Buy now', color: 'var(--color-success)' },
                { label: 'Research', color: 'var(--color-info)' },
                { label: 'Compare', color: 'var(--color-warning)' },
              ].map((intent) => (
                <div key={intent.label} className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-surface-200 rounded-full" />
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: intent.color }}
                  />
                  <span className="text-[9px] font-medium w-12" style={{ color: intent.color }}>
                    {intent.label}
                  </span>
                </div>
              ))}
            </div>
            <span className="block mt-4 text-7xl font-mono font-bold text-surface-100 leading-none select-none">
              {content.valueProps.items[0].number}
            </span>
            <h3 className="text-xl font-medium text-surface-900 -mt-4">
              {content.valueProps.items[0].title}
            </h3>
            <p className="mt-3 text-surface-600">{content.valueProps.items[0].description}</p>
          </Card>

          {/* Card 2: Compliance — document with shield */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center relative overflow-hidden" aria-hidden="true">
              <svg className="w-full h-full" viewBox="0 0 200 96" fill="none">
                {/* Document skeleton */}
                <rect x="40" y="12" width="120" height="72" rx="4" fill="var(--color-surface-100)" stroke="var(--color-surface-200)" strokeWidth="1" />
                <rect x="52" y="24" width="60" height="4" rx="2" fill="var(--color-surface-200)" />
                <rect x="52" y="34" width="96" height="3" rx="1.5" fill="var(--color-surface-200)" />
                <rect x="52" y="42" width="80" height="3" rx="1.5" fill="var(--color-surface-200)" />
                <rect x="52" y="50" width="88" height="3" rx="1.5" fill="var(--color-surface-200)" />
                <rect x="52" y="58" width="64" height="3" rx="1.5" fill="var(--color-surface-200)" />

                {/* Shield overlay */}
                <path
                  d="M100 30 L116 38 V52 C116 62 108 70 100 74 C92 70 84 62 84 52 V38 Z"
                  fill="var(--color-primary-100)"
                  stroke="var(--color-primary-400)"
                  strokeWidth="1.5"
                />
                <path
                  d="M94 52 L98 56 L106 48"
                  stroke="var(--color-primary-600)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Compliance labels */}
                <text x="30" y="50" fontSize="7" fontWeight="600" fill="var(--color-surface-400)" textAnchor="end">YMYL</text>
                <text x="170" y="42" fontSize="7" fontWeight="600" fill="var(--color-surface-400)">HIPAA</text>
                <text x="170" y="56" fontSize="7" fontWeight="600" fill="var(--color-surface-400)">PCI</text>
              </svg>
            </div>
            <span className="block mt-4 text-7xl font-mono font-bold text-surface-100 leading-none select-none">
              {content.valueProps.items[1].number}
            </span>
            <h3 className="text-xl font-medium text-surface-900 -mt-4">
              {content.valueProps.items[1].title}
            </h3>
            <p className="mt-3 text-surface-600">{content.valueProps.items[1].description}</p>
          </Card>

          {/* Card 3: Competition maps — simplified SERP */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center relative overflow-hidden" aria-hidden="true">
              <svg className="w-full h-full" viewBox="0 0 200 96" fill="none">
                {/* SERP results */}
                <rect x="24" y="10" width="152" height="20" rx="3" fill="var(--color-surface-200)" />
                <text x="32" y="24" fontSize="8" fontWeight="600" fill="var(--color-surface-400)">Marketplace Giant</text>
                <rect x="140" y="14" width="28" height="12" rx="2" fill="var(--color-primary-100)" />
                <text x="154" y="23" fontSize="6" fontWeight="600" fill="var(--color-primary-600)" textAnchor="middle">#1</text>

                <rect x="24" y="36" width="152" height="20" rx="3" fill="var(--color-surface-100)" />
                <text x="32" y="50" fontSize="8" fontWeight="500" fill="var(--color-surface-400)">Established Brand</text>
                <rect x="140" y="40" width="28" height="12" rx="2" fill="var(--color-surface-100)" stroke="var(--color-surface-200)" strokeWidth="1" />
                <text x="154" y="49" fontSize="6" fontWeight="500" fill="var(--color-surface-400)" textAnchor="middle">#2</text>

                <rect x="24" y="62" width="152" height="20" rx="3" fill="white" stroke="var(--color-primary-400)" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="32" y="76" fontSize="8" fontWeight="600" fill="var(--color-primary-600)">Your Brand</text>
                <path
                  d="M164 76 L164 18"
                  stroke="var(--color-primary-500)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="3 2"
                />
                <path
                  d="M160 22 L164 14 L168 22"
                  stroke="var(--color-primary-500)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <span className="block mt-4 text-7xl font-mono font-bold text-surface-100 leading-none select-none">
              {content.valueProps.items[2].number}
            </span>
            <h3 className="text-xl font-medium text-surface-900 -mt-4">
              {content.valueProps.items[2].title}
            </h3>
            <p className="mt-3 text-surface-600">{content.valueProps.items[2].description}</p>
          </Card>
        </div>
      </SectionContainer>

      {/* ─── Section 3: Industry Grid ─── */}
      {seoPages.length > 0 && (
        <SectionContainer>
          <SectionHeader
            title="Choose your industry"
            highlightWord="industry"
            subtitle="Tap into a strategy built for your vertical's search dynamics."
          />

          <div className="mt-8 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {seoPages.map((page) => {
              const stat1Value = page['stat-1-value'];
              const stat1Label = page['stat-1-label'];
              const icon = getIndustryIcon(page.slug);

              return (
                <Link
                  key={page.slug}
                  href={`/seo-for/${page.slug}`}
                  className="group block bg-white rounded-xl border border-surface-200 overflow-hidden
                    transition-all duration-200 hover:border-surface-300 hover:shadow-md
                    focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
                >
                  {/* Industry icon area */}
                  <div className="flex items-center justify-center bg-surface-50 py-8">
                    {icon || (
                      <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary-600">
                          {page.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-lg font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                      {page['hero-headline'] || page.name}
                    </h2>
                    {page['hero-subtitle'] && (
                      <p className="mt-2 text-sm text-surface-600 line-clamp-2">
                        {page['hero-subtitle']}
                      </p>
                    )}

                    {/* Key stat */}
                    {stat1Value && stat1Label && (
                      <div className="mt-4 pt-4 border-t border-surface-100 flex items-baseline gap-2">
                        <span className="text-xl font-mono font-medium text-primary-600">
                          {stat1Value}
                        </span>
                        <span className="text-sm text-surface-500">{stat1Label}</span>
                      </div>
                    )}

                    {/* Learn more arrow */}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600">
                      Learn more
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </SectionContainer>
      )}

      {/* ─── Section 4: Dark Section — Our Approach ─── */}
      <SectionContainer
        padding="lg"
        className="bg-surface-900 text-surface-300"
        id="approach"
      >
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

      {/* ─── Section 5: Client Logos Trust Bar ─── */}
      {showcaseClients.length > 0 && (
        <SectionContainer padding="sm" className="bg-surface-50">
          <p className="text-center text-sm text-surface-500 mb-6">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-x-12 md:gap-y-8">
            {showcaseClients.map((client) => (
              <div key={client.id} className="flex items-center justify-center">
                <img
                  src={
                    logoImage(client['colored-logo']?.url) ||
                    asset('/images/placeholder-logo.svg')
                  }
                  loading="lazy"
                  width="100"
                  height="45"
                  alt={client.name}
                  className="max-w-[100px] max-h-[45px] w-auto h-auto object-contain grayscale opacity-60 transition-all duration-200 hover:grayscale-0 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </SectionContainer>
      )}

      {/* ─── Section 6: FAQ ─── */}
      <FAQ
        title={content.faq.title}
        items={content.faq.items}
        showFooter
      />

      {/* ─── Section 7: CTA ─── */}
      <CTA
        title="Don't See Your Industry?"
        subtitle="We work across all sectors. Book a call and we'll build a custom SEO strategy for your business."
      />
    </>
  );
}
