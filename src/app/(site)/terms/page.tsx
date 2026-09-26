/**
 * Terms of Service — on the v11 legal template since 2026-09-26 (migrated to v3 on 2026-08-01).
 *
 * The terms TEXT is unchanged, clause for clause: this migration only moves it
 * off the pre-v3 light layout (SectionContainer + `prose-policy` + hardcoded
 * Tailwind link colors) and onto the shared LegalPageV3 template, so the page
 * carries the v3 chrome (dark Header, FooterV3), the electric opening band, and
 * the two-font type system.
 *
 * Nothing here may be reworded without a legal read — the acceptable-use,
 * intellectual-property, liability, termination, and governing-law clauses are
 * compliance copy, not marketing copy. Links are now plain <a> elements inside
 * `.sf-body`, which styles them (indigo, underlined) from the stylesheet instead
 * of per-element classes.
 *
 * Description, canonical, OG and Twitter blocks are preserved verbatim. The
 * only metadata change is the <title>, lengthened from 27 to 52 characters on
 * the SEO audit's finding (the bare "Terms of Service" wasted half the SERP line).
 */
import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/svc.css';
import '../../legal-v11/legal.css';
import { getHomeV11Content, getLegalV11Content } from '@/lib/content-utils';
import { LegalPageV11 } from '../../legal-v11/LegalPageV11';
import { TERMS_VIEW } from '../../legal-v11/terms';

export const metadata: Metadata = {
  // 52 chars with the layout's " | LoudFace" suffix — the bare "Terms of Service"
  // was 27 and left half the SERP line unused (SEO audit, 2026-08-01).
  title: 'Terms of Service: Use, Rights & Liability',
  description:
    'Terms and conditions governing the use of loudface.co and LoudFace services. Covers intellectual property, liability, payments, and dispute resolution.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service: Use, Rights & Liability | LoudFace',
    description: 'Terms and conditions governing the use of loudface.co and LoudFace services. Covers intellectual property, liability, payments, and dispute resolution.',
    type: 'website',
    url: '/terms',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Terms of Service' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Terms of Service: Use, Rights & Liability | LoudFace',
    description: 'Terms and conditions governing the use of loudface.co and LoudFace services. Covers intellectual property, liability, payments, and dispute resolution.',
    images: ['/opengraph-image'],
  },
};

export default async function TermsOfServicePage() {
  const [home, c] = await Promise.all([getHomeV11Content(), getLegalV11Content()]);
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Terms of Service' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LegalPageV11 view={TERMS_VIEW} home={home} labels={c.labels} />
    </>
  );
}
