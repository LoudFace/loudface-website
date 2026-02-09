import type { Metadata } from 'next';
import { SectionContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How LoudFace uses cookies and tracking technologies. Read our full cookie policy.',
  alternates: {
    canonical: '/cookies',
  },
};

export default function CookiePolicyPage() {
  return (
    <SectionContainer padding="lg">
      <article className="max-w-3xl mx-auto prose-policy">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
          Cookie Policy
        </h1>
        <p className="mt-2 text-sm text-surface-500">Last updated: February 2026</p>

        <div className="mt-10 space-y-10 text-surface-600 text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">1. Introduction</h2>
            <p>
              LOUDFACE - FZCO uses cookies and similar tracking technologies to enhance your
              experience on loudface.co.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              2. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files placed on your device to store data that can be recalled
              by a web server in the domain that placed the cookie.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              3. Types of Cookies We Use
            </h2>
            <p>
              <strong className="text-surface-900">Analytics Cookies:</strong> We use cookies from
              third parties like Google Analytics to collect information about how visitors use our
              Site. These cookies help us understand website traffic and usage patterns.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              4. How We Use Cookies
            </h2>
            <p>
              <strong className="text-surface-900">To Analyze Usage:</strong> Cookies help us
              analyze how users interact with our Site, allowing us to improve functionality and user
              experience.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">5. Managing Cookies</h2>
            <p>
              Most web browsers automatically accept cookies, but you can modify your browser
              settings to decline cookies if you prefer. Please note that disabling cookies may
              affect the functionality of the Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              6. Third-Party Cookies
            </h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We have no
              control over these cookies. Please refer to the respective privacy policies of these
              third-party services for more information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              7. Changes to This Cookie Policy
            </h2>
            <p>
              We may update our Cookie Policy periodically. Any changes will be posted on this page
              with an updated &ldquo;Last updated&rdquo; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:{' '}
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
