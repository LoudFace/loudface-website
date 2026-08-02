/**
 * Terms of Service — migrated to v3 on 2026-08-01.
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
import '../../service-v3/service-v3.css';
import '../../seo-for-v3/seo-for-v3.css';
import '../../legal-v3/legal-v3.css';
import { LegalPageV3 } from '../../legal-v3/LegalPageV3';
import type { LegalSection } from '../../legal-v3/LegalPageV3';

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

const SECTIONS: LegalSection[] = [
  {
    id: 'acceptance-of-terms',
    heading: '1. Acceptance of Terms',
    body: (
      <p>
        By accessing and using loudface.co, you accept and agree to be bound by these Terms of
        Service.
      </p>
    ),
  },
  {
    id: 'our-services',
    heading: '2. Our Services',
    body: (
      <p>
        LOUDFACE - FZCO provides design, development, SEO, and other marketing services.
      </p>
    ),
  },
  {
    id: 'user-obligations',
    heading: '3. User Obligations',
    body: (
      <ul>
        <li>
          <strong>Compliance:</strong> You agree to comply with all applicable laws and regulations
          when using our Site.
        </li>
        <li>
          <strong>Respect Intellectual Property:</strong> You must respect all intellectual property
          rights associated with content on our Site.
        </li>
        <li>
          <strong>No Spamming:</strong> Unauthorized advertising, promotional materials, or any form
          of solicitation is prohibited.
        </li>
      </ul>
    ),
  },
  {
    id: 'prohibited-activities',
    heading: '4. Prohibited Activities',
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>
            Engage in hacking, phishing, or any harmful activities intended to damage or interfere
            with our Site.
          </li>
          <li>Upload or transmit viruses or malicious code.</li>
          <li>Attempt to gain unauthorized access to any portion of the Site.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'intellectual-property-rights',
    heading: '5. Intellectual Property Rights',
    body: (
      <p>
        All content on the Site, including text, graphics, logos, and images, is the property of
        LOUDFACE - FZCO and is protected by copyright and other intellectual property laws.
      </p>
    ),
  },
  {
    id: 'limitation-of-liability',
    heading: '6. Limitation of Liability',
    body: (
      <p>
        Under no circumstances shall LOUDFACE - FZCO be liable for any direct, indirect, incidental,
        special, or consequential damages resulting from your use of the Site or inability to access
        the Site.
      </p>
    ),
  },
  {
    id: 'termination',
    heading: '7. Termination',
    body: (
      <p>
        We reserve the right to terminate or suspend your access to the Site at our sole discretion,
        without prior notice, for conduct that we believe violates these Terms or is harmful to other
        users.
      </p>
    ),
  },
  {
    id: 'governing-law',
    heading: '8. Governing Law',
    body: (
      <p>
        These Terms shall be governed by and construed in accordance with the laws of Dubai, UAE,
        without regard to its conflict of law provisions.
      </p>
    ),
  },
  {
    id: 'changes-to-terms',
    heading: '9. Changes to Terms',
    body: (
      <p>
        We may modify these Terms of Service at any time. Your continued use of the Site after any
        such changes constitutes your acceptance of the new Terms.
      </p>
    ),
  },
  {
    id: 'contact-us',
    heading: '10. Contact Us',
    body: (
      <p>
        For any questions regarding these Terms, please contact us at:{' '}
        <a href="mailto:hello@loudface.co">hello@loudface.co</a>
      </p>
    ),
  },
];

export default function TermsOfServicePage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Terms of Service' },
    ],
  };

  return (
    <div className="svcv3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LegalPageV3
        view={{
          eyebrow: 'Legal',
          h1: 'Terms of Service',
          lastUpdated: 'February 2026',
          sections: SECTIONS,
        }}
      />
    </div>
  );
}
