import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How LoudFace collects, uses, and protects your personal information — including analytics, B2B visitor identification, your GDPR rights, and how to opt out.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | LoudFace',
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
    title: 'Privacy Policy | LoudFace',
    description: 'How LoudFace collects, uses, and protects your personal information — including analytics, B2B visitor identification, your GDPR rights, and how to opt out.',
    images: ['/opengraph-image'],
  },
};

const thirdParties = [
  {
    name: 'Cal.com',
    purpose: 'Scheduling. Receives your name and email when you book a call.',
    href: 'https://cal.com/privacy',
  },
  {
    name: 'PostHog',
    purpose: 'Product analytics. Receives usage events and device information; hosted in the United States.',
    href: 'https://posthog.com/privacy',
  },
  {
    name: 'Google Tag Manager',
    purpose: 'Loads our measurement tags. Tags delivered through it may set Google cookies.',
    href: 'https://policies.google.com/privacy',
  },
  {
    name: 'RB2B',
    purpose: 'B2B visitor identification. Matches IP address and browsing behavior of US-based visitors against its database to give us business contact profiles.',
    href: 'https://www.rb2b.com/privacy-policy',
  },
  {
    name: 'Vercel',
    purpose: 'Hosting. Processes server logs, including IP addresses, to serve and secure the Site.',
    href: 'https://vercel.com/legal/privacy-policy',
  },
  {
    name: 'Cloudflare',
    purpose: 'Content delivery and security. Processes IP addresses to route and protect traffic.',
    href: 'https://www.cloudflare.com/privacypolicy/',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <SectionContainer padding="lg">
      <article className="max-w-3xl mx-auto prose-policy">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-surface-500">Last updated: July 2026</p>

        <div className="mt-10 space-y-10 text-surface-600 text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">1. Who We Are</h2>
            <p>
              LOUDFACE - FZCO (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates
              loudface.co (the &ldquo;Site&rdquo;). We are the data controller for the personal
              information described in this policy. Questions go to{' '}
              <a
                href="mailto:hello@loudface.co"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                hello@loudface.co
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              <strong className="text-surface-900">Information you give us:</strong> When you fill
              out a form on the Site — booking a call, applying to our partner program, or
              registering for a webinar — we collect what you enter: typically your name, email
              address, company, and anything you write in a message field.
            </p>
            <p className="mb-3">
              <strong className="text-surface-900">Information collected automatically:</strong>{' '}
              With your consent where required (see Section 4), we use cookies and similar
              technologies to collect your IP address, pages viewed, referrer, and device and
              browser details. Our analytics runs on PostHog and tags loaded through Google Tag
              Manager.
            </p>
            <p>
              <strong className="text-surface-900">B2B visitor identification:</strong> We use
              RB2B, a service that matches the IP address and browsing behavior of visitors located
              in the United States against its database to tell us which businesses — and in some
              cases which individual professionals (name, business email, LinkedIn profile) — have
              visited the Site. RB2B only attempts to identify US-based visitors. You can remove
              yourself from RB2B&rsquo;s database at{' '}
              <a
                href="https://app.retention.com/optout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                app.retention.com/optout
              </a>
              , and stop the tool from running on this Site at all via our{' '}
              <Link href="/cookies" className="text-primary-600 hover:text-primary-700 underline">
                Cookie Policy
              </Link>{' '}
              page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-surface-900">To respond and schedule:</strong> arranging
                the calls you book, processing partner applications, and running webinars you
                register for.
              </li>
              <li>
                <strong className="text-surface-900">To improve the Site:</strong> analyzing how
                visitors use our pages so we can fix what doesn&rsquo;t work.
              </li>
              <li>
                <strong className="text-surface-900">For B2B outreach:</strong> contacting
                companies (and the professionals RB2B identifies) whose visit suggests our services
                are relevant to them.
              </li>
              <li>
                <strong className="text-surface-900">To keep the Site secure</strong> and defend
                against abuse.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              4. Legal Bases and Consent
            </h2>
            <p className="mb-3">
              Where the GDPR or similar laws apply, we rely on: <strong className="text-surface-900">consent</strong>{' '}
              for analytics and tracking cookies — for visitors in the EEA, UK, and Switzerland,
              nothing non-essential loads without opt-in consent, which most pages request via a
              consent banner (pages without the banner simply leave tracking off);{' '}
              <strong className="text-surface-900">performance of a contract</strong> for handling
              bookings and applications; and{' '}
              <strong className="text-surface-900">legitimate interests</strong> for Site security
              and for business-to-business outreach where the law permits it.
            </p>
            <p>
              You can withdraw consent at any time on our{' '}
              <Link href="/cookies" className="text-primary-600 hover:text-primary-700 underline">
                Cookie Policy
              </Link>{' '}
              page. We also honor the Global Privacy Control browser signal as an opt-out.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              5. Third-Party Services
            </h2>
            <p className="mb-4">
              These services process data on our behalf or receive it as part of providing the
              Site:
            </p>
            <ul className="space-y-3">
              {thirdParties.map((service) => (
                <li key={service.name}>
                  <a
                    href={service.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline font-medium"
                  >
                    {service.name}
                  </a>
                  <span className="text-surface-600"> — {service.purpose}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              6. International Transfers
            </h2>
            <p>
              Some of the providers above process data in the United States and other countries
              outside your own. Where required, these transfers rely on appropriate safeguards such
              as standard contractual clauses in our agreements with those providers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">7. Data Retention</h2>
            <p>
              We keep form submissions for as long as we&rsquo;re in contact with you or need them
              for the purpose you submitted them for, then delete them. Analytics and visitor
              identification data is retained according to each provider&rsquo;s policy, linked
              above. If you ask us to delete your data (Section 8), we also pass the request to the
              relevant providers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">8. Your Rights</h2>
            <p className="mb-3">
              Depending on where you live, you have the right to access, correct, delete, or
              receive a copy of your personal information, to restrict or object to how we process
              it, and to withdraw consent at any time without affecting prior processing.
            </p>
            <p>
              To exercise any of these rights, email{' '}
              <a
                href="mailto:hello@loudface.co"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                hello@loudface.co
              </a>{' '}
              — we respond within 30 days. If you&rsquo;re in the EEA or UK and believe we
              haven&rsquo;t resolved your concern, you can complain to your local data protection
              authority.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">9. Cookies</h2>
            <p>
              For the full list of cookies we use, what they do, and the controls for turning them
              off, see our{' '}
              <Link href="/cookies" className="text-primary-600 hover:text-primary-700 underline">
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">10. Data Security</h2>
            <p>
              We limit access to personal information to the people and services that need it, and
              the Site is served over HTTPS end to end. No method of transmission over the internet
              is entirely secure, though — we can&rsquo;t promise absolute security, and we
              don&rsquo;t.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              11. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this policy from time to time. Changes appear on this page with an
              updated &ldquo;Last updated&rdquo; date; material changes get a notice on the Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">12. Contact Us</h2>
            <p>
              LOUDFACE - FZCO ·{' '}
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
