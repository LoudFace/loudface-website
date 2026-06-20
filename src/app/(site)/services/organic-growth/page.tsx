/**
 * Organic Growth Service Pillar Page
 *
 * Post-pivot anchor page for "B2B SaaS organic growth agency, stack-agnostic."
 * Conversion destination for the counter-listicle and other listicle-pattern
 * pieces that target organic-growth-agency intent prompts.
 *
 * v1: content inlined. Refactor to src/data/content/services-organic-growth.json
 * if the page is iterated on heavily.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SectionContainer,
  SectionHeader,
  Card,
  Button,
} from '@/components/ui';
import { CTA } from '@/components/sections';

export const metadata: Metadata = {
  title: 'Organic Growth for B2B SaaS',
  description:
    'Stack-agnostic SEO, AEO, and conversion design built for the AI search era. We help B2B SaaS companies grow organic pipeline without paid media. 90-day lift window.',
  alternates: { canonical: '/services/organic-growth' },
  openGraph: {
    title: 'Organic Growth for B2B SaaS | LoudFace',
    description:
      'Stack-agnostic SEO, AEO, and conversion design built for the AI search era. We help B2B SaaS companies grow organic pipeline without paid media. 90-day lift window.',
    type: 'website',
    url: '/services/organic-growth',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Organic Growth' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Organic Growth for B2B SaaS | LoudFace',
    description:
      'Stack-agnostic SEO, AEO, and conversion design built for the AI search era. 90-day lift window. No paid media.',
    images: ['/opengraph-image'],
  },
};

const faqs = [
  {
    q: 'What does "stack-agnostic" actually mean?',
    a: 'We work on whatever your site is built on. Next.js, Webflow, headless WordPress, custom React, Astro. We do not require a replatform. Our deliverables are the SEO, AEO, content engine, and CRO work, not a CMS migration. About 60% of our engagements run on the client\'s existing stack.',
  },
  {
    q: 'Why no paid media?',
    a: 'Paid CAC keeps climbing while AI search shifts more buyer research to zero-click answers. Organic pipeline compounds, and pieces that earn AI citations earn pipeline for months. Paid is a separate discipline. We focus on what we are best at, and refer paid out when it makes sense.',
  },
  {
    q: 'How is this different from a traditional SEO retainer?',
    a: 'Traditional retainers were built for Google SERPs. We start with AI search visibility because that is where most B2B research now begins. The content engine produces year-stamped listicles, AEO playbooks, and comparison pages tuned for ChatGPT, Perplexity, and Google AI Mode citations alongside conventional SERP rankings.',
  },
  {
    q: 'What is the 90-day lift window?',
    a: 'In 90 days you should see measurable AI citation lift on at least 3 tracked buyer prompts and traditional SERP movement on 5-10 commercial-intent keywords. If you do not, we have a hard conversation about fit. We do not run quiet 12-month contracts where work compounds out of sight.',
  },
  {
    q: 'How do you measure AI search visibility?',
    a: 'We track per-prompt citation share across ChatGPT, Perplexity, Claude, Google AI Mode, and others using Peec AI. You get a baseline audit before you sign, and you see the same dashboard we do. No vanity metrics. The number that matters is what percentage of buyer prompts your brand wins.',
  },
  {
    q: 'Who is this not for?',
    a: 'You are looking for a paid-media agency, you need a website rebuild as the primary deliverable, you publish 20+ pieces of generic content per month, or you measure SEO success in raw traffic instead of pipeline. We are a fit for B2B SaaS with $5M-$50M ARR who want fewer, sharper pieces that earn AI citations and convert.',
  },
];

export default async function OrganicGrowthPage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Organic Growth for B2B SaaS',
    description:
      'Stack-agnostic SEO, AEO, and conversion design for B2B SaaS companies. We help brands win pipeline through AI search citations and traditional organic traffic, without paid media.',
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: 'Organic Growth Marketing',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.loudface.co/services' },
      { '@type': 'ListItem', position: 3, name: 'Organic Growth' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <SectionContainer padding="lg">
        <div className="max-w-3xl">
          <span className="inline-block text-2xs font-medium uppercase tracking-wider text-primary-600 mb-4">
            Organic Growth System
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900">
            Organic growth for <span className="text-primary-600">B2B SaaS</span>, built for the AI search era.
          </h1>
          <p className="mt-6 text-lg text-surface-600">
            Stack-agnostic SEO, AEO, and conversion design. No paid media. 90-day lift window. We help B2B SaaS companies earn pipeline through citations in ChatGPT, Perplexity, and Google AI Mode alongside traditional organic traffic.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="primary" size="lg" href="/audit">
              Get a free AI visibility audit
            </Button>
            <Button variant="ghost" size="lg" href="/pricing">
              See pricing
            </Button>
          </div>
        </div>
      </SectionContainer>

      {/* The problem */}
      <SectionContainer className="bg-surface-50">
        <SectionHeader
          title="Traditional SEO retainers were built for a Google that no longer exists."
          highlightWord="Google"
          subtitle="B2B buyers start research in AI assistants. The brands that win the next decade are the ones that get cited in those answers, not the ones that rank #1 on a SERP nobody clicks."
        />
        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-medium text-surface-900">Paid CAC keeps rising</h3>
            <p className="mt-2 text-surface-600">
              Performance ads worked when supply outpaced competition. That window closed. Organic compounding is the only channel where each piece of work makes the next one easier.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-medium text-surface-900">AI search ate the funnel</h3>
            <p className="mt-2 text-surface-600">
              Buyers now ask ChatGPT &quot;best AEO agency for fintech&quot; and shortlist from the answer. If you are not cited there, the deal starts without you on the list.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-medium text-surface-900">Fragmented retainers do not compound</h3>
            <p className="mt-2 text-surface-600">
              SEO agency, content agency, CRO consultant, schema vendor. Five logins, five reports, no system. We replace the stack with one team that ships against one shared measurement.
            </p>
          </Card>
        </div>
      </SectionContainer>

      {/* Our approach */}
      <SectionContainer>
        <SectionHeader
          title="One system. Four moves. Stack-agnostic."
          highlightWord="Stack-agnostic"
          subtitle="We do not require a replatform. We work on Next.js, Webflow, headless WordPress, custom React, whatever you have. The system is the deliverable, not the CMS."
        />
        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <span className="text-2xs font-medium uppercase tracking-wider text-primary-600">01 — Audit</span>
            <h3 className="mt-2 text-lg font-medium text-surface-900">Baseline AI visibility and SERP position</h3>
            <p className="mt-2 text-surface-600">
              We pull your current citation share across ChatGPT, Perplexity, Claude, and Google AI Mode for the buyer prompts your ICP actually asks. Same for traditional SERP. You see the floor before you sign.
            </p>
          </Card>
          <Card>
            <span className="text-2xs font-medium uppercase tracking-wider text-primary-600">02 — Strategy</span>
            <h3 className="mt-2 text-lg font-medium text-surface-900">Pattern-led content roadmap</h3>
            <p className="mt-2 text-surface-600">
              Year-stamped listicles, AEO playbooks, comparison pages, industry pages. Each piece is mapped to a buyer prompt with measurable competition, not a keyword volume number.
            </p>
          </Card>
          <Card>
            <span className="text-2xs font-medium uppercase tracking-wider text-primary-600">03 — Ship</span>
            <h3 className="mt-2 text-lg font-medium text-surface-900">Production-grade pieces, not blog filler</h3>
            <p className="mt-2 text-surface-600">
              FAQPage schema. Direct-answer TL;DR blocks. Comparison tables. Verified claims with sources. Internal-link maps grounded in your actual site, not invented URLs.
            </p>
          </Card>
          <Card>
            <span className="text-2xs font-medium uppercase tracking-wider text-primary-600">04 — Compound</span>
            <h3 className="mt-2 text-lg font-medium text-surface-900">Conversion testing and refresh cadence</h3>
            <p className="mt-2 text-surface-600">
              Monthly refresh against the same prompts. CRO testing on the pages that draw qualified traffic. Pieces that earn citations earn pipeline for 12-18 months when maintained.
            </p>
          </Card>
        </div>
      </SectionContainer>

      {/* Proof */}
      <SectionContainer className="bg-surface-50">
        <SectionHeader
          title="What this looks like in production"
          highlightWord="production"
          subtitle="Two case studies and our public content engine. Same playbook, different stacks."
        />
        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/case-studies/toku-ai-cited-pipeline"
            className="group block bg-white rounded-xl border border-surface-200 p-6 transition-all duration-300 hover:border-surface-300 hover:shadow-md"
          >
            <span className="text-2xs font-medium uppercase tracking-wider text-primary-600">Case study</span>
            <h3 className="mt-2 text-lg font-medium text-surface-900 group-hover:text-primary-600 transition-colors">Toku — AI-cited pipeline</h3>
            <p className="mt-2 text-surface-600">
              86% Peec visibility on tracked crypto-payroll prompts. Read the build.
            </p>
          </Link>
          <Link
            href="/case-studies/hoxhunt"
            className="group block bg-white rounded-xl border border-surface-200 p-6 transition-all duration-300 hover:border-surface-300 hover:shadow-md"
          >
            <span className="text-2xs font-medium uppercase tracking-wider text-primary-600">Case study</span>
            <h3 className="mt-2 text-lg font-medium text-surface-900 group-hover:text-primary-600 transition-colors">Hoxhunt — cybersecurity AEO</h3>
            <p className="mt-2 text-surface-600">
              Niche AEO playbook in a vertical where retrieval favors specialist content.
            </p>
          </Link>
          <Link
            href="/blog"
            className="group block bg-white rounded-xl border border-surface-200 p-6 transition-all duration-300 hover:border-surface-300 hover:shadow-md"
          >
            <span className="text-2xs font-medium uppercase tracking-wider text-primary-600">The engine, in public</span>
            <h3 className="mt-2 text-lg font-medium text-surface-900 group-hover:text-primary-600 transition-colors">Our blog ships the same playbook</h3>
            <p className="mt-2 text-surface-600">
              We use LoudFace.co as the testing surface for every pattern we deploy with clients. The blog shows the work.
            </p>
          </Link>
        </div>
      </SectionContainer>

      {/* FAQ */}
      <SectionContainer>
        <SectionHeader
          title="Frequently asked questions"
          highlightWord="questions"
        />
        <div className="mt-8 lg:mt-12 max-w-3xl mx-auto space-y-4">
          {faqs.map(({ q, a }) => (
            <Card key={q} hover={false}>
              <h3 className="text-lg font-medium text-surface-900">{q}</h3>
              <p className="mt-2 text-surface-600">{a}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <CTA />
    </>
  );
}
