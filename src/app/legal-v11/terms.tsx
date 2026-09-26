/**
 * The Terms of Service text, moved verbatim out of src/app/(site)/terms/page.tsx on 2026-09-26 so the live page
 * (LegalPageV3) and the v11 template (LegalPageV11) read one copy. Compliance copy: no rewording without a legal read.
 */
import type { LegalSection, LegalView } from '../legal-v3/LegalPageV3';

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

export const TERMS_VIEW: LegalView = {
          eyebrow: 'Legal',
          h1: 'Terms of Service',
          lastUpdated: 'February 2026',
          sections: SECTIONS,
        };
