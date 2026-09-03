/**
 * /methodology: the Answer Chain methodology page.
 *
 * Route shape copies /pricing and /services/geo-agency exactly: the public URL
 * comes from the `(site)` route group (the group name is not part of the URL),
 * and the page composes section components that live in `src/app/methodology-v3/`
 * with a route-scoped stylesheet. That is why this file is short: it wires
 * metadata, structured data and the concept together, nothing else.
 *
 * Chrome: the shared (site) Header renders in its dark-hero variant and the
 * shared Footer is suppressed, both registered for `/methodology` in
 * SiteChrome.tsx + (site)/layout.tsx, so the page ships the same v3 FooterV3 the
 * homepage, About and Pricing do. Shared chrome is transcribed, never redesigned.
 *
 * CONCEPT SWITCH: three concepts were built for this page and the pick is
 * Arnel's. Concept A is wired here as the default; B and C render at
 * /dev-preview/methodology-b and /dev-preview/methodology-c. Switching the pick
 * is one import plus one element below.
 *
 * The copy is approved and fixed: see methodology-v3/data.tsx for the trail.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../methodology-v3/methodology-base.css';
import '../../methodology-v3/concept-a.css';
import { MethodologyConceptA } from '../../methodology-v3/concepts/ConceptA';
import { buildMethodologyJsonLd } from '../../methodology-v3/jsonld';
import { MethodologyScripts } from '../../methodology-v3/Scripts';

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

export default function MethodologyPage() {
  const jsonLd = buildMethodologyJsonLd();

  return (
    <div className="mth mth-a">
      {jsonLd.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <MethodologyConceptA />
      <MethodologyScripts />
    </div>
  );
}
