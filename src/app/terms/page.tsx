import type { Metadata } from 'next';
import { SectionContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms and conditions for using loudface.co. Read our full terms of service.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsOfServicePage() {
  return (
    <SectionContainer padding="lg">
      <article className="max-w-3xl mx-auto prose-policy">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-surface-500">Last updated: February 2026</p>

        <div className="mt-10 space-y-10 text-surface-600 text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using loudface.co, you accept and agree to be bound by these Terms of
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">2. Our Services</h2>
            <p>
              LOUDFACE - FZCO provides design, development, SEO, and other marketing services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">3. User Obligations</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-surface-900">Compliance:</strong> You agree to comply with
                all applicable laws and regulations when using our Site.
              </li>
              <li>
                <strong className="text-surface-900">Respect Intellectual Property:</strong> You
                must respect all intellectual property rights associated with content on our Site.
              </li>
              <li>
                <strong className="text-surface-900">No Spamming:</strong> Unauthorized advertising,
                promotional materials, or any form of solicitation is prohibited.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              4. Prohibited Activities
            </h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Engage in hacking, phishing, or any harmful activities intended to damage or
                interfere with our Site.
              </li>
              <li>Upload or transmit viruses or malicious code.</li>
              <li>Attempt to gain unauthorized access to any portion of the Site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              5. Intellectual Property Rights
            </h2>
            <p>
              All content on the Site, including text, graphics, logos, and images, is the property
              of LOUDFACE - FZCO and is protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              6. Limitation of Liability
            </h2>
            <p>
              Under no circumstances shall LOUDFACE - FZCO be liable for any direct, indirect,
              incidental, special, or consequential damages resulting from your use of the Site or
              inability to access the Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">7. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your access to the Site at our sole
              discretion, without prior notice, for conduct that we believe violates these Terms or
              is harmful to other users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">8. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Dubai,
              UAE, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">9. Changes to Terms</h2>
            <p>
              We may modify these Terms of Service at any time. Your continued use of the Site after
              any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">10. Contact Us</h2>
            <p>
              For any questions regarding these Terms, please contact us at:{' '}
              <a
                href="mailto:hello@loudface.co"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                hello@loudface.co
              </a>
            </p>
          </section>
        </div>
      </article>
    </SectionContainer>
  );
}
