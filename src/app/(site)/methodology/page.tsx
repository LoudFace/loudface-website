/**
 * Methodology — v11 (switched 2026-09-26).
 *
 * Composed from src/app/methodology-v11 inside the (site) group. The words are the approved, hash-verified copy in
 * methodology-v3/data.tsx; methodology-v11.json holds the labels and chart figures; the start section reuses the
 * audit landing's example report window (ai-audit.json). SEO metadata and the JSON-LD (buildMethodologyJsonLd, built
 * from the same approved copy) are unchanged.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/svc.css';
import '../../service-v11/cro-sections.css';
import '../../audit-v11/audit.css';
import '../../methodology-v11/methodology.css';
import { getAiAuditContent, getHomeV11Content, getMethodologyV11Content } from '@/lib/content-utils';
import { buildMethodologyJsonLd } from '../../methodology-v3/jsonld';
import { MethodologyV11 } from '../../methodology-v11/MethodologyV11';

const DESCRIPTION =
  'The Answer Chain is LoudFace’s eight-stage GEO method for getting a B2B SaaS named in AI answers, measured against revenue outcomes rather than vanity metrics. Engagements start from $5,000 a month.';

export const metadata: Metadata = {
  // The root layout applies `template: "%s | LoudFace"`, so no suffix here.
  title: 'The Answer Chain: our AI search methodology',
  description: DESCRIPTION,
  alternates: { canonical: '/methodology' },
  openGraph: {
    title: 'The Answer Chain: how LoudFace gets a B2B SaaS named in AI answers | LoudFace',
    description: DESCRIPTION,
    type: 'article',
    url: '/methodology',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      { url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace methodology: the Answer Chain' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'The Answer Chain: how LoudFace gets a B2B SaaS named in AI answers | LoudFace',
    description: DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

export default async function MethodologyPage() {
  const jsonLd = buildMethodologyJsonLd();
  const [c, home, audit] = await Promise.all([getMethodologyV11Content(), getHomeV11Content(), getAiAuditContent()]);

  return (
    <>
      {jsonLd.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <MethodologyV11 c={c} home={home} audit={audit} />
    </>
  );
}
