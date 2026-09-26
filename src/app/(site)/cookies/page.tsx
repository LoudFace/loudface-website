/**
 * Cookie Policy — on the v11 legal template since 2026-09-26 (migrated to v3 on 2026-08-01).
 *
 * The policy TEXT and cookie inventory are unchanged, clause and row for row:
 * this migration only moves them off the pre-v3 light layout (SectionContainer
 * + `prose-policy` + hardcoded Tailwind colors) and onto the shared LegalPageV3
 * template, so the page carries the v3 chrome (dark Header, FooterV3), the
 * electric opening band, and the two-font type system.
 *
 * Nothing here may be reworded without a legal read — the consent behavior,
 * tracking disclosures, provider details, retention periods, and opt-out paths
 * are compliance copy, not marketing copy. Links and the cookie table now use
 * the shared `.sf-body` treatment instead of per-element Tailwind classes.
 *
 * Description, canonical, OG and Twitter blocks are preserved verbatim. The
 * only metadata change is the <title>, lengthened from 24 to 54 characters on
 * the SEO audit's finding (the bare "Cookie Policy" wasted half the SERP line).
 */
import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/svc.css';
import '../../legal-v11/legal.css';
import { getHomeV11Content, getLegalV11Content } from '@/lib/content-utils';
import { LegalPageV11 } from '../../legal-v11/LegalPageV11';
import { COOKIES_VIEW } from '../../legal-v11/cookies';

export const metadata: Metadata = {
  // 54 chars with the layout's " | LoudFace" suffix — the bare "Cookie Policy"
  // was 24 and left half the SERP line unused (SEO audit, 2026-08-01).
  title: 'Cookie Policy: Tracking, Consent & Controls',
  description:
    'The cookies loudface.co actually sets — analytics, B2B visitor identification, and consent — with controls to turn tracking off at any time.',
  alternates: {
    canonical: '/cookies',
  },
  openGraph: {
    title: 'Cookie Policy: Tracking, Consent & Controls | LoudFace',
    description: 'The cookies loudface.co actually sets — analytics, B2B visitor identification, and consent — with controls to turn tracking off at any time.',
    type: 'website',
    url: '/cookies',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Cookie Policy' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Cookie Policy: Tracking, Consent & Controls | LoudFace',
    description: 'The cookies loudface.co actually sets — analytics, B2B visitor identification, and consent — with controls to turn tracking off at any time.',
    images: ['/opengraph-image'],
  },
};

export default async function CookiePolicyPage() {
  const [home, c] = await Promise.all([getHomeV11Content(), getLegalV11Content()]);
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Cookie Policy' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LegalPageV11 view={COOKIES_VIEW} home={home} labels={c.labels} />
    </>
  );
}
