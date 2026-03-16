/**
 * SEO for SaaS — Bespoke Landing Page
 *
 * Growth Autopilot program page for B2B SaaS companies.
 * Sections: Hero, Logo Scroll, Problem, Numbers, How We Work (dark),
 *           CTA Break, The System, Testimonials, Case Studies, FAQ, Bottom CTA
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  fetchHomepageData,
  getAccessToken,
  getEmptyHomepageData,
} from '@/lib/cms-data';
import { getSeoForSaasContent } from '@/lib/content-utils';
import { avatarImage } from '@/lib/image-utils';
import {
  Badge,
  BulletLabel,
  Button,
  Card,
  SectionContainer,
  SectionHeader,
} from '@/components/ui';
import { Partners, FAQ } from '@/components/sections';

const content = getSeoForSaasContent();

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  alternates: {
    canonical: '/seo-for/saas',
  },
  openGraph: {
    title: `${content.meta.title} | LoudFace`,
    description: content.meta.description,
    type: 'website',
    url: '/seo-for/saas',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${content.meta.title} | LoudFace`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: `${content.meta.title} | LoudFace`,
    description: content.meta.description,
    images: ['/opengraph-image'],
  },
};

export default async function SaaSPage() {
  const accessToken = getAccessToken();
  const cmsData = accessToken
    ? await fetchHomepageData(accessToken).catch(() => getEmptyHomepageData())
    : getEmptyHomepageData();

  // Testimonials with body text and profile image for the testimonials section
  const displayTestimonials = cmsData.allTestimonials.filter(
    (t) => t['testimonial-body'] && t['profile-image']?.url
  ).slice(0, 3);

  // --- Structured Data ---
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
      {
        '@type': 'ListItem',
        position: 2,
        name: 'SEO Services by Industry',
        item: 'https://www.loudface.co/seo-for',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'B2B SaaS Growth Autopilot',
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'B2B SaaS Growth Autopilot: SEO, AEO & CRO',
    description: content.meta.description,
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: 'Search Engine Optimization',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ─── 1. Hero ─── */}
      <SectionContainer padding="lg">
        <div className="max-w-3xl">
          <BulletLabel>{content.hero.eyebrow}</BulletLabel>

          <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900 leading-tight">
            {content.hero.headline}
          </h1>

          <p className="mt-6 text-lg text-surface-600 leading-relaxed max-w-2xl">
            {content.hero.subheadline}
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
      </SectionContainer>

      {/* ─── 2. Logo Scroll (Partners) ─── */}
      <Partners
        testimonials={cmsData.allTestimonials}
        clients={cmsData.allClients}
      />

      {/* ─── 3. The Problem ─── */}
      <SectionContainer>
        <BulletLabel as="h2">{content.problem.label}</BulletLabel>

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.problem.items.map((problem) => (
            <Card key={problem.number} padding="lg" hover={false}>
              <span className="block text-6xl font-mono font-bold text-surface-100 leading-none select-none">
                {problem.number}
              </span>
              <h3 className="text-xl font-medium text-surface-900 -mt-2">
                {problem.title}
              </h3>
              <p className="mt-3 text-sm font-medium text-surface-500">
                {problem.subtitle}
              </p>
              <p className="mt-3 text-surface-600">{problem.body}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* ─── 4. Numbers (What We Deliver) ─── */}
      <SectionContainer className="bg-surface-50">
        <SectionHeader
          title={content.numbers.headline}
          highlightWord="deliver"
        />

        <div className="mt-8 lg:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {content.numbers.stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-8 rounded-2xl bg-white border border-surface-200"
            >
              <div className="text-4xl md:text-5xl font-medium text-primary-600 font-mono">
                {stat.value}
              </div>
              <p className="mt-3 text-surface-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* ─── 5. How We Work (dark) ─── */}
      <SectionContainer
        id="approach"
        padding="lg"
        className="bg-surface-900 text-surface-300"
      >
        <BulletLabel variant="dark">{content.howWeWork.label}</BulletLabel>

        <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-medium text-white leading-tight">
          {content.howWeWork.headline}
        </h2>

        <p className="mt-6 text-lg text-surface-300 max-w-3xl leading-relaxed">
          {content.howWeWork.body}
        </p>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:block mt-16">
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-px bg-surface-700" />

            <div className="grid grid-cols-4 gap-8">
              {content.howWeWork.steps.map((step) => (
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

        {/* Mobile: vertical timeline */}
        <div className="lg:hidden mt-10">
          <div className="relative border-l-2 border-surface-700 ml-5 space-y-8">
            {content.howWeWork.steps.map((step) => (
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

      {/* ─── 6. CTA Break ─── */}
      <SectionContainer padding="lg" className="bg-primary-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium leading-tight">
            {content.ctaBreak.headline}
          </h2>
          <p className="mt-6 text-lg text-white/80 leading-relaxed">
            {content.ctaBreak.subheadline}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              data-cal-trigger=""
              className="inline-flex items-center justify-center font-medium rounded-lg px-6 py-3 text-base bg-white text-primary-700 hover:bg-primary-50 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {content.ctaBreak.primaryCta}
            </button>
            <button
              type="button"
              data-cal-trigger=""
              className="inline-flex items-center justify-center font-medium rounded-lg px-6 py-3 text-base text-white border border-white/30 bg-transparent hover:bg-white/10 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {content.ctaBreak.secondaryCta}
            </button>
          </div>
        </div>
      </SectionContainer>

      {/* ─── 7. The System ─── */}
      <SectionContainer padding="lg">
        <BulletLabel>{content.system.label}</BulletLabel>

        <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight">
          {content.system.headline}
        </h2>

        <p className="mt-6 text-lg text-surface-600 max-w-3xl leading-relaxed">
          {content.system.body}
        </p>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {content.system.layers.map((layer) => (
            <div
              key={layer.number}
              className="relative rounded-2xl border border-surface-200 bg-white overflow-hidden"
            >
              {/* Layer header */}
              <div className="px-6 pt-6 pb-4 border-b border-surface-100">
                <span className="text-xs font-mono font-medium text-surface-400 uppercase tracking-wider">
                  Layer {layer.number}
                </span>
                <h3 className="mt-1 text-2xl font-medium text-surface-900">
                  {layer.title}
                </h3>
                <p className="mt-2 text-sm text-surface-500">{layer.subtitle}</p>
              </div>

              {/* Deliverables list */}
              <ul className="px-6 py-4 space-y-3">
                {layer.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-surface-600"
                  >
                    <svg
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500"
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
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* ─── 8. Testimonials ─── */}
      {displayTestimonials.length > 0 && (
        <SectionContainer className="bg-surface-50">
          <SectionHeader
            title="What our clients say"
            highlightWord="clients"
          />

          <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayTestimonials.map((testimonial) => (
              <Card key={testimonial.id} padding="lg" hover={false}>
                <svg
                  className="w-6 h-6 mb-4 text-surface-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                <blockquote
                  className="text-surface-700 leading-relaxed line-clamp-5 [&>p]:m-0"
                  dangerouslySetInnerHTML={{
                    __html: testimonial['testimonial-body']!,
                  }}
                />

                <div className="mt-4 pt-4 border-t border-surface-100 flex items-center gap-3">
                  <img
                    src={avatarImage(testimonial['profile-image']!.url)}
                    alt={testimonial.name}
                    width="80"
                    height="80"
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-medium text-sm text-surface-900">
                      {testimonial.name}
                    </div>
                    {testimonial.role && (
                      <div className="text-xs text-surface-500">
                        {testimonial.role}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </SectionContainer>
      )}

      {/* ─── 9. Case Studies ─── */}
      <SectionContainer>
        <BulletLabel>{content.caseStudies.label}</BulletLabel>
        <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
          {content.caseStudies.headline}
        </h2>

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.caseStudies.items.map((study) => (
            <Link
              key={study.slug}
              href={`/work/${study.slug}`}
              className="group block rounded-2xl border border-surface-200 bg-white p-8 transition-all duration-200 hover:border-surface-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
            >
              <p className="text-sm font-medium text-surface-500">
                {study.name}
              </p>
              <h3 className="mt-2 text-xl md:text-2xl font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                {study.metric}
              </h3>
              <p className="mt-3 text-surface-600 leading-relaxed">
                {study.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {study.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" href="/case-studies">
            {content.caseStudies.cta}
            <svg
              className="ml-2 w-4 h-4"
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
          </Button>
        </div>
      </SectionContainer>

      {/* ─── 10. FAQ ─── */}
      <FAQ
        title="Common questions"
        items={content.faq.items}
        showFooter
      />

      {/* ─── 11. Bottom CTA ─── */}
      <section className="bg-surface-900">
        <div className="py-24 md:py-32 lg:py-40">
          <div className="px-4 md:px-8 lg:px-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium leading-tight text-white">
                {content.bottomCta.headline}
              </h2>

              <p className="mt-6 text-lg md:text-xl text-surface-300">
                {content.bottomCta.body}
              </p>

              <div className="mt-10">
                <Button
                  variant="secondary"
                  size="lg"
                  calTrigger
                  className="px-8 rounded-full hover:-translate-y-0.5"
                >
                  {content.bottomCta.primaryCta}
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

              <p className="mt-6 text-sm text-surface-500">
                {content.bottomCta.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
