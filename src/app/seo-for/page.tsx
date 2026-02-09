/**
 * SEO Services by Industry — Hub/Listing Page
 *
 * Pillar page linking to all /seo-for/[slug] pages.
 * Drives internal linking equity for the programmatic SEO hub.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchSeoPages, getAccessToken } from '@/lib/cms-data';
import {
  Button,
  SectionContainer,
  SectionHeader,
} from '@/components/ui';
import { CTA } from '@/components/sections';
import type { SeoPage } from '@/lib/types';

export const metadata: Metadata = {
  title: 'SEO Services by Industry',
  description:
    'Industry-specific SEO strategies that drive real results. Discover how LoudFace tailors search optimization for your sector.',
  alternates: {
    canonical: '/seo-for',
  },
  openGraph: {
    title: 'SEO Services by Industry | LoudFace',
    description:
      'Industry-specific SEO strategies that drive real results. Discover how LoudFace tailors search optimization for your sector.',
    type: 'website',
    url: '/seo-for',
  },
};

export default async function SeoForHubPage() {
  const accessToken = getAccessToken();
  const seoPages: SeoPage[] = accessToken
    ? await fetchSeoPages(accessToken)
    : [];

  return (
    <>
      {/* Hero */}
      <SectionContainer padding="lg">
        <SectionHeader
          as="h1"
          title="SEO Services by Industry"
          highlightWord="Industry"
          subtitle="Every industry has unique search dynamics. We build SEO strategies tailored to your sector — not one-size-fits-all playbooks."
        />

        <p className="mt-8 max-w-2xl text-surface-600 text-lg leading-relaxed">
          Generic SEO playbooks treat every business the same. But an e-commerce brand competing against Amazon faces completely different search challenges than a healthcare practice navigating HIPAA or a SaaS company fighting for product-led keywords. We build strategies around your industry&apos;s specific dynamics.
        </p>

        <div className="mt-8">
          <Button variant="primary" size="lg" calTrigger>
            Get a free SEO audit
          </Button>
        </div>
      </SectionContainer>

      {/* Industry Grid */}
      {seoPages.length > 0 && (
        <SectionContainer>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {seoPages.map((page) => (
              <Link
                key={page.slug}
                href={`/seo-for/${page.slug}`}
                className="group block bg-white rounded-xl border border-surface-200 overflow-hidden
                  transition-all duration-200 hover:border-surface-300 hover:shadow-md
                  focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
              >
                <div className="p-6">
                  <h2 className="text-lg font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                    {page['hero-headline'] || page.name}
                  </h2>
                  {page['hero-subtitle'] && (
                    <p className="mt-2 text-sm text-surface-600 line-clamp-2">
                      {page['hero-subtitle']}
                    </p>
                  )}
                  {page['hero-description'] && (
                    <p className="mt-2 text-sm text-surface-500 line-clamp-2">
                      {page['hero-description']}
                    </p>
                  )}
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
            ))}
          </div>
        </SectionContainer>
      )}

      {/* CTA */}
      <CTA
        title="Don't See Your Industry?"
        subtitle="We work across all sectors. Book a call and we'll build a custom SEO strategy for your business."
      />
    </>
  );
}
