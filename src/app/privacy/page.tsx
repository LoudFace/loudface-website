import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How LoudFace collects, uses, and protects your personal information. Read our full privacy policy.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <SectionContainer padding="lg">
      <article className="max-w-3xl mx-auto prose-policy">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-surface-500">Last updated: February 2026</p>

        <div className="mt-10 space-y-10 text-surface-600 text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">1. Introduction</h2>
            <p>
              LOUDFACE - FZCO (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates
              loudface.co (the &ldquo;Site&rdquo;). We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy describes how we collect,
              use, and disclose your information when you use our Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              <strong className="text-surface-900">Personal Information:</strong> When you fill out
              a booking form to schedule a call with us, we collect personal information such as your
              name and email address.
            </p>
            <p>
              <strong className="text-surface-900">Cookies and Tracking Technologies:</strong> We
              use cookies and similar tracking technologies to monitor activity on our Site. This
              includes the use of Google Analytics and other analytical tools to gather non-personal
              information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-surface-900">To Schedule Appointments:</strong> We use your
                personal information to arrange and manage bookings.
              </li>
              <li>
                <strong className="text-surface-900">Communication:</strong> To contact you with
                updates or information regarding your appointment or our services.
              </li>
              <li>
                <strong className="text-surface-900">Analytics:</strong> To analyze usage and
                improve our Site and services.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              4. Third-Party Services
            </h2>
            <p className="mb-3">
              We utilize Cal.com for our booking forms. Your information may be shared with Cal.com
              as part of the scheduling process.
            </p>
            <p>
              Google Analytics and other analytical tools may collect information about your usage of
              our Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">5. Cookies Policy</h2>
            <p>
              For detailed information on the cookies we use and your choices regarding cookies,
              please refer to our{' '}
              <Link href="/cookies" className="text-primary-600 hover:text-primary-700 underline">
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">6. Data Security</h2>
            <p>
              We prioritize the security of your personal information and use trusted tools to
              protect it. However, please be aware that no method of transmission over the internet
              is entirely secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">7. User Rights</h2>
            <p>
              Currently, we do not offer options for users to access, modify, or delete personal
              information collected through the booking forms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              8. Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. Any changes will be posted on this
              page with an updated &ldquo;Last updated&rdquo; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{' '}
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
