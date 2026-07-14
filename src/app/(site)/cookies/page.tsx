import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionContainer } from '@/components/ui';
import { CookiePreferences } from '@/components/CookiePreferences';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'The cookies loudface.co actually sets — analytics, B2B visitor identification, and consent — with controls to turn tracking off at any time.',
  alternates: {
    canonical: '/cookies',
  },
  openGraph: {
    title: 'Cookie Policy | LoudFace',
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
    title: 'Cookie Policy | LoudFace',
    description: 'The cookies loudface.co actually sets — analytics, B2B visitor identification, and consent — with controls to turn tracking off at any time.',
    images: ['/opengraph-image'],
  },
};

const cookieRows = [
  {
    name: 'lf_consent',
    provider: 'LoudFace',
    category: 'Essential',
    purpose: 'Remembers your cookie choice so we don’t ask again.',
    duration: '12 months',
  },
  {
    name: 'ph_* ',
    provider: 'PostHog',
    category: 'Analytics',
    purpose: 'Tells our analytics which pageviews and sessions belong together.',
    duration: 'Up to 12 months',
  },
  {
    name: '_reb2b*',
    provider: 'RB2B',
    category: 'Visitor identification',
    purpose:
      'Session identifiers used to match US-based business visitors against RB2B’s database.',
    duration: 'Session',
  },
  {
    name: 'Google tags',
    provider: 'Google Tag Manager',
    category: 'Analytics',
    purpose:
      'Tag Manager itself sets no cookies; measurement tags loaded through it may set Google cookies (e.g. _ga, _gcl_*).',
    duration: 'Varies by tag',
  },
  {
    name: 'Cal.com',
    provider: 'Cal.com',
    category: 'Functional',
    purpose: 'Set only when you open the booking widget, to make scheduling work.',
    duration: 'Varies',
  },
];

export default function CookiePolicyPage() {
  return (
    <SectionContainer padding="lg">
      <article className="max-w-3xl mx-auto prose-policy">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
          Cookie Policy
        </h1>
        <p className="mt-2 text-sm text-surface-500">Last updated: July 2026</p>

        <div className="mt-10 space-y-10 text-surface-600 text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">1. Introduction</h2>
            <p>
              LOUDFACE - FZCO uses cookies and similar technologies on loudface.co for three
              things: remembering your consent choice, analytics, and identifying which businesses
              visit the Site. This page lists all of them and gives you the controls.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">2. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device to store data that can be recalled
              by a web server in the domain that placed the cookie. &ldquo;Similar
              technologies&rdquo; covers things like browser localStorage, which some of our tools
              use for the same purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              3. Cookies We Use
            </h2>
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-sm text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-surface-200 text-surface-900">
                    <th scope="col" className="py-3 pr-4 font-medium">Cookie</th>
                    <th scope="col" className="py-3 pr-4 font-medium">Provider</th>
                    <th scope="col" className="py-3 pr-4 font-medium">Category</th>
                    <th scope="col" className="py-3 pr-4 font-medium">Purpose</th>
                    <th scope="col" className="py-3 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieRows.map((row) => (
                    <tr key={row.name} className="border-b border-surface-200 align-top">
                      <td className="py-3 pr-4 font-medium text-surface-900 whitespace-nowrap">{row.name}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{row.provider}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{row.category}</td>
                      <td className="py-3 pr-4">{row.purpose}</td>
                      <td className="py-3 whitespace-nowrap">{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              Everything except <strong className="text-surface-900">lf_consent</strong> and the
              Cal.com functional cookies is optional and only runs when tracking is allowed for
              you (Section 4).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              4. Your Choices
            </h2>
            <p className="mb-3">
              If you&rsquo;re visiting from the EEA, UK, or Switzerland, nothing optional runs
              until you allow it — most pages ask via a consent banner, and pages without one
              simply leave tracking off. Everywhere else these tools run by default, in line with
              US disclosure standards, and you can turn them off right here:
            </p>
            <div className="not-prose my-6">
              <CookiePreferences />
            </div>
            <p className="mb-3">
              We also honor the{' '}
              <a
                href="https://globalprivacycontrol.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Global Privacy Control
              </a>{' '}
              browser signal: if your browser sends it and you haven&rsquo;t explicitly accepted,
              we treat it as an opt-out.
            </p>
            <p>
              To remove yourself from RB2B&rsquo;s identification database entirely (beyond this
              site), use{' '}
              <a
                href="https://app.retention.com/optout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                RB2B&rsquo;s opt-out form
              </a>
              . And most browsers let you block or delete cookies in their settings — though
              blocking essential ones may break parts of the Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              5. Third-Party Policies
            </h2>
            <p>
              Details on how each provider handles data:{' '}
              <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">PostHog</a>
              {', '}
              <a href="https://www.rb2b.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">RB2B</a>
              {', '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">Google</a>
              {', '}
              <a href="https://cal.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">Cal.com</a>
              . How we handle it is in our{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">
              6. Changes to This Cookie Policy
            </h2>
            <p>
              We may update this policy periodically — for instance when we add or remove a tool.
              Changes appear on this page with an updated &ldquo;Last updated&rdquo; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-surface-900 mb-3">7. Contact Us</h2>
            <p>
              Questions about cookies on this Site:{' '}
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
