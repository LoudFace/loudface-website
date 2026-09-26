/**
 * Privacy Policy — on the v11 legal template since 2026-09-26 (migrated to v3 on 2026-08-01).
 *
 * The policy TEXT is unchanged, clause for clause: this migration only moves it
 * off the pre-v3 light layout (SectionContainer + `prose-policy` + hardcoded
 * Tailwind link colors) and onto the shared LegalPageV3 template, so the page
 * carries the v3 chrome (dark Header, FooterV3), the electric opening band, and
 * the two-font type system.
 *
 * Nothing here may be reworded without a legal read — the GDPR bases, the RB2B
 * disclosure, and the named sub-processors are compliance copy, not marketing
 * copy. Links are now plain <a>/<Link> inside `.sf-body`, which styles them
 * (indigo, underlined) from the stylesheet instead of per-element classes.
 *
 * Description, canonical, OG and Twitter blocks are preserved verbatim. The
 * only metadata change is the <title>, lengthened from 25 to 54 characters on
 * the SEO audit's finding (the bare "Privacy Policy" wasted half the SERP line).
 */
import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/svc.css';
import '../../legal-v11/legal.css';
import { getHomeV11Content, getLegalV11Content } from '@/lib/content-utils';
import { LegalPageV11 } from '../../legal-v11/LegalPageV11';
import { PRIVACY_VIEW } from '../../legal-v11/privacy';

export const metadata: Metadata = {
  // 54 chars with the layout's " | LoudFace" suffix — the bare "Privacy Policy"
  // was 25 and left half the SERP line unused (SEO audit, 2026-08-01).
  title: 'Privacy Policy: Data, Cookies & Your Rights',
  description:
    'How LoudFace collects, uses, and protects your personal information — including analytics, B2B visitor identification, your GDPR rights, and how to opt out.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy: Data, Cookies & Your Rights | LoudFace',
    description: 'How LoudFace collects, uses, and protects your personal information — including analytics, B2B visitor identification, your GDPR rights, and how to opt out.',
    type: 'website',
    url: '/privacy',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Privacy Policy' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Privacy Policy: Data, Cookies & Your Rights | LoudFace',
    description: 'How LoudFace collects, uses, and protects your personal information — including analytics, B2B visitor identification, your GDPR rights, and how to opt out.',
    images: ['/opengraph-image'],
  },
};

export default async function PrivacyPolicyPage() {
  const [home, c] = await Promise.all([getHomeV11Content(), getLegalV11Content()]);
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Privacy Policy' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LegalPageV11 view={PRIVACY_VIEW} home={home} labels={c.labels} />
    </>
  );
}
