/**
 * Google AI Overviews service page (/services/ai-overviews) — v3 service
 * template, same shell as /services/geo-agency.
 *
 * Copy is the dual-verified article from the content engine (spine-id
 * a2a04f97-6633-4f55-ae3c-00f21c24a213, body sha256 6e36476d…, signed off by
 * two independent verifiers on 2026-09-20). It is an article, not slot copy, so
 * it rides the template's `body` slot verbatim via SERVICE_CONFIGS['ai-overviews']
 * and this page omits the deliverables / runway / exhibit / proof slots rather
 * than have the words rewritten to fit them. Any wording change goes back
 * through the content engine's verify loop first.
 *
 * seo-for-v3.css carries the `.svcv3 .sf-prose` reading block the body renders
 * into; it is additive `.sf-*` furniture and cannot collide with service-v3.css.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import '../../../seo-for-v3/seo-for-v3.css';
import { getServiceImages, getServiceConfig } from '../../../service-v3/data';
import { ServicePageV3 } from '../../../service-v3/ServicePageV3';
import { buildServiceJsonLd } from '../../../service-v3/jsonld';

const DESCRIPTION =
  'AI Overviews answers from the Google Search index. We make B2B SaaS pages retrievable for the fan-out queries behind it, and report visibility weekly.';

export const metadata: Metadata = {
  // Root layout applies `template: "%s | LoudFace"`, so do NOT add the suffix here.
  title: 'Google AI Overviews Optimization',
  description: DESCRIPTION,
  alternates: { canonical: '/services/ai-overviews' },
  openGraph: {
    title: 'Google AI Overviews Optimization | LoudFace',
    description: DESCRIPTION,
    type: 'website',
    url: '/services/ai-overviews',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Google AI Overviews Optimization' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Google AI Overviews Optimization | LoudFace',
    description: DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

export default async function AiOverviewsServicePage() {
  const config = getServiceConfig('ai-overviews')!;
  const images = await getServiceImages();
  const jsonLd = buildServiceJsonLd({
    slug: 'ai-overviews',
    serviceType: 'Google AI Overviews Optimization',
    name: 'Google AI Overviews Optimization for B2B SaaS',
    description: DESCRIPTION,
    breadcrumbName: 'Google AI Overviews Optimization',
    faq: config.faq.items,
  });

  return (
    <div className="svcv3">
      {jsonLd.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <ServicePageV3 config={config} images={images} />
    </div>
  );
}
