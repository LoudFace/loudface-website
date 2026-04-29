/**
 * Growth Autopilot Service Page
 *
 * Data Sources:
 * - JSON: services-growth-autopilot.json (via content layer)
 */
import type { Metadata } from 'next';
import { getServicesGrowthAutopilotContent } from '@/lib/content-utils';
import { fetchCollection } from '@/lib/cms-data';
import type { Client, Testimonial } from '@/lib/types';
import {
  SectionContainer,
  SectionHeader,
  Card,
  Button,
  BulletLabel,
  Badge,
} from '@/components/ui';
import { CTA, FAQ, Partners, RelatedServices, TestimonialGrid } from '@/components/sections';

export const metadata: Metadata = {
  title: 'Growth Autopilot — SEO, AEO & CRO as One System',
  description:
    'Turn your website into a revenue channel. We run SEO, AEO, and CRO as one integrated system for B2B SaaS companies. Get a free AI Visibility Audit.',
  alternates: {
    canonical: '/services/growth-autopilot',
  },
  openGraph: {
    title: 'Growth Autopilot — SEO, AEO & CRO as One System | LoudFace',
    description:
      'Turn your website into a revenue channel. We run SEO, AEO, and CRO as one integrated system for B2B SaaS companies. Get a free AI Visibility Audit.',
    type: 'website',
    url: '/services/growth-autopilot',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Growth Autopilot' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Growth Autopilot — SEO, AEO & CRO as One System | LoudFace',
    description:
      'Turn your website into a revenue channel. We run SEO, AEO, and CRO as one integrated system for B2B SaaS companies. Get a free AI Visibility Audit.',
    images: ['/opengraph-image'],
  },
};

export default async function GrowthAutopilotPage() {
  const content = getServicesGrowthAutopilotContent();

  const [clients, testimonials] = await Promise.all([
    fetchCollection<Client>('clients'),
    fetchCollection<Testimonial>('testimonials'),
  ]);

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Growth Autopilot — SEO, AEO & CRO',
    description:
      'Integrated SEO, AEO, and CRO system for B2B SaaS companies. Turn your website into a revenue channel with one team, one strategy, one system.',
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: 'Growth Marketing',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Growth Autopilot' },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: content.approach.title,
    description: content.approach.intro,
    step: content.approach.layers.map((l) => ({
      '@type': 'HowToStep',
      position: Number(l.number),
      name: l.title,
      text: l.description,
    })),
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Growth Autopilot — SEO, AEO & CRO as One System',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: 'https://www.loudface.co/services/growth-autopilot',
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* ─── Section 1: Hero ─── */}
      <SectionContainer padding="lg">
        <BulletLabel>{content.hero.eyebrow}</BulletLabel>

        <h1
          className="mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900"
          dangerouslySetInnerHTML={{ __html: content.hero.headline }}
        />

        <p className="mt-6 text-lg text-surface-600 max-w-2xl" data-speakable>
          {content.hero.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button variant="primary" size="lg" href="/ai-audit">
            {content.hero.primaryCta}
          </Button>
          <Button variant="outline" size="lg" href="#packages">
            {content.hero.secondaryCta}
          </Button>
        </div>

        {/* Stats Strip */}
        <div className="mt-16 pt-8 border-t border-surface-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.stats.map((stat, i) => (
              <div key={i}>
                <span className="text-2xl md:text-3xl font-mono font-medium text-surface-900">
                  {stat.value}
                </span>
                <p className="mt-1 text-sm text-surface-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* ─── Social Proof: stars + headshots + tagline + logos ─── */}
      <Partners testimonials={testimonials} clients={clients} />

      {/* ─── Section 2: Problems ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.problems.title}
          highlightWord={content.problems.highlightWord}
        />

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.problems.items.map((problem) => (
            <Card key={problem.number} padding="lg" hover={false}>
              <span className="block text-6xl font-mono font-bold text-surface-100 leading-none select-none">
                {problem.number}
              </span>
              <h3 className="text-lg font-medium text-surface-900 mt-2">
                {problem.title}
              </h3>
              <p className="mt-3 text-surface-600">{problem.description}</p>
              <Badge variant="outline" className="mt-4 !border-error/30 !text-error !bg-error/5">
                {problem.tag}
              </Badge>
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* ─── Section 3: How We Work (Dark) ─── */}
      <SectionContainer padding="lg" className="bg-surface-900 text-surface-300" id="how-it-works">
        <SectionHeader
          title={content.approach.title}
          highlightWord={content.approach.highlightWord}
          variant="dark"
        />

        <p className="mt-6 text-lg text-surface-300 max-w-3xl">
          {content.approach.intro}
        </p>

        {/* Layers Flow — Desktop: 3 columns with connecting arrows */}
        <div className="mt-12 lg:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px lg:bg-surface-700 rounded-xl overflow-hidden">
            {content.approach.layers.map((layer) => (
              <div key={layer.number} className="bg-surface-800 p-8">
                <span className="inline-block font-mono text-xs tracking-widest text-primary-400 uppercase mb-4">
                  Layer {layer.number}
                </span>
                <h3 className="text-2xl font-medium text-white mb-3">
                  {layer.title}
                </h3>
                <p className="text-sm text-surface-400 mb-6">
                  {layer.description}
                </p>
                <ul className="space-y-2">
                  {layer.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-surface-400">
                      <span className="text-primary-400 mt-0.5 shrink-0">&rarr;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Compounding indicator */}
          <div className="mt-6 flex items-center gap-3 justify-center text-sm text-surface-500">
            <div className="h-px w-12 bg-surface-700" />
            <span className="font-mono text-xs tracking-wider uppercase">Each layer compounds the one before it</span>
            <div className="h-px w-12 bg-surface-700" />
          </div>
        </div>
      </SectionContainer>

      {/* ─── Section 4: Packages ─── */}
      <SectionContainer id="packages">
        <SectionHeader
          eyebrow="Packages"
          title={content.packages.title}
          highlightWord={content.packages.highlightWord}
        />

        <div className="mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-px bg-surface-200 rounded-xl overflow-hidden border border-surface-200">
          {content.packages.items.map((pkg) => (
            <div
              key={pkg.name}
              className={`bg-white p-8 flex flex-col ${
                pkg.featured ? 'ring-2 ring-primary-500 ring-inset relative' : ''
              }`}
            >
              {pkg.featured && pkg.badge && (
                <Badge
                  variant="subtle"
                  className="!bg-primary-600 !text-white !border-primary-600 mb-4 self-start"
                >
                  {pkg.badge}
                </Badge>
              )}

              <h3 className="text-xl font-medium text-surface-900">
                {pkg.name}
              </h3>
              <p className="mt-2 text-sm text-surface-500 pb-6 border-b border-surface-200">
                {pkg.tagline}
              </p>

              <ul className="mt-6 space-y-3 flex-1">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-surface-600">
                    <span className="text-primary-500 mt-0.5 shrink-0">&rarr;</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  variant={pkg.featured ? 'secondary' : 'outline'}
                  fullWidth
                  calTrigger
                >
                  {pkg.ctaText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* ─── Section 5: Case Studies ─── */}
      <SectionContainer padding="lg" className="bg-surface-950 text-surface-300">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white max-w-lg">
            {content.caseStudies.title}
          </h2>
          <p className="text-sm text-surface-500 md:text-right max-w-[220px]">
            {content.caseStudies.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-surface-800 rounded-xl overflow-hidden">
          {content.caseStudies.items.map((cs) => (
            <div
              key={cs.client}
              className="bg-surface-950 p-8 lg:p-10 transition-colors hover:bg-surface-900"
            >
              <div className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tight leading-none">
                {cs.metric}
              </div>
              <span className="block mt-1 font-mono text-xs tracking-widest uppercase text-surface-500">
                {cs.metricLabel}
              </span>

              <h3 className="mt-6 text-lg font-medium text-white">
                {cs.client}
              </h3>
              <p className="mt-2 text-sm text-surface-400 leading-relaxed">
                {cs.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {cs.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] tracking-wider text-surface-500 px-2 py-0.5 border border-surface-800 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* ─── Testimonials ─── */}
      <TestimonialGrid
        testimonials={testimonials}
        title="What our clients say"
        highlightWord="clients"
      />

      {/* ─── Section 6: Audit CTA ─── */}
      <SectionContainer id="audit">
        <div className="rounded-xl border border-surface-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Info */}
            <div className="p-8 lg:p-12">
              <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-primary-600 mb-6">
                <span className="w-4 h-px bg-primary-500" />
                {content.audit.eyebrow}
              </span>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
                {content.audit.title}
              </h2>
              <p className="mt-4 text-surface-600 max-w-lg">
                {content.audit.description}
              </p>

              <ul className="mt-8 space-y-4">
                {content.audit.checks.map((check) => (
                  <li key={check} className="flex items-start gap-3 text-sm text-surface-600">
                    <span className="text-primary-500 mt-0.5 shrink-0">&rarr;</span>
                    {check}
                  </li>
                ))}
              </ul>

              <p className="mt-8 font-mono text-xs text-surface-400 tracking-wider">
                {content.audit.note}
              </p>
            </div>

            {/* Right: CTA panel */}
            <div className="bg-surface-50 p-8 lg:p-12 flex flex-col justify-center">
              <h3 className="text-xl font-medium text-surface-900">
                Request your free audit
              </h3>
              <p className="mt-2 text-sm text-surface-500">
                Takes 2 minutes. We&apos;ll follow up within 24 hours.
              </p>

              <div className="mt-8">
                <Button variant="primary" size="lg" href="/ai-audit" fullWidth>
                  Request My Free AI Visibility Audit
                </Button>
              </div>

              <p className="mt-4 text-xs text-surface-400 text-center">
                No automated follow-up sequences. No sales pitch before the audit. We do the work first.
              </p>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* ─── Section 7: FAQ ─── */}
      <FAQ
        title={content.faq.title}
        items={content.faq.items}
        showFooter
      />

      {/* ─── Related Services ─── */}
      <RelatedServices currentService="/services/growth-autopilot" />

      {/* ─── Section 8: CTA ─── */}
      <CTA
        title={content.cta.title}
        subtitle={content.cta.subtitle}
        ctaText={content.cta.ctaText}
        ctaHref="/ai-audit"
      />
    </>
  );
}
