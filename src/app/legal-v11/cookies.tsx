/**
 * The Cookie Policy text, moved verbatim out of src/app/(site)/cookies/page.tsx on 2026-09-26 so the live page
 * (LegalPageV3) and the v11 template (LegalPageV11) read one copy. Compliance copy: no rewording without a legal read.
 */
import Link from 'next/link';
import { CookiePreferences } from '@/components/CookiePreferences';
import type { LegalSection, LegalView } from '../legal-v3/LegalPageV3';

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

const SECTIONS: LegalSection[] = [
  {
    id: 'introduction',
    heading: '1. Introduction',
    body: (
      <p>
        LOUDFACE - FZCO uses cookies and similar technologies on loudface.co for three things:
        remembering your consent choice, analytics, and identifying which businesses visit the
        Site. This page lists all of them and gives you the controls.
      </p>
    ),
  },
  {
    id: 'what-are-cookies',
    heading: '2. What Are Cookies?',
    body: (
      <p>
        Cookies are small text files placed on your device to store data that can be recalled by a
        web server in the domain that placed the cookie. &ldquo;Similar technologies&rdquo; covers
        things like browser localStorage, which some of our tools use for the same purposes.
      </p>
    ),
  },
  {
    id: 'cookies-we-use',
    heading: '3. Cookies We Use',
    body: (
      <>
        <div className="sf-tablewrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Cookie</th>
                <th scope="col">Provider</th>
                <th scope="col">Category</th>
                <th scope="col">Purpose</th>
                <th scope="col">Duration</th>
              </tr>
            </thead>
            <tbody>
              {cookieRows.map((row) => (
                <tr key={row.name}>
                  <td data-label="Cookie">{row.name}</td>
                  <td data-label="Provider">{row.provider}</td>
                  <td data-label="Category">{row.category}</td>
                  <td data-label="Purpose">{row.purpose}</td>
                  <td data-label="Duration">{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Everything except <strong>lf_consent</strong> and the Cal.com functional cookies is
          optional and only runs when tracking is allowed for you (Section 4).
        </p>
      </>
    ),
  },
  {
    id: 'your-choices',
    heading: '4. Your Choices',
    body: (
      <>
        <p>
          If you&rsquo;re visiting from the EEA, UK, or Switzerland, nothing optional runs until you
          allow it — most pages ask via a consent banner, and pages without one simply leave tracking
          off. Everywhere else these tools run by default, in line with US disclosure standards, and
          you can turn them off right here:
        </p>
        <div className="lg-prefs">
          <CookiePreferences />
        </div>
        <p>
          We also honor the{' '}
          <a href="https://globalprivacycontrol.org" target="_blank" rel="noopener noreferrer">
            Global Privacy Control
          </a>{' '}
          browser signal: if your browser sends it and you haven&rsquo;t explicitly accepted, we treat
          it as an opt-out.
        </p>
        <p>
          To remove yourself from RB2B&rsquo;s identification database entirely (beyond this site),
          use{' '}
          <a href="https://app.retention.com/optout" target="_blank" rel="noopener noreferrer">
            RB2B&rsquo;s opt-out form
          </a>
          . And most browsers let you block or delete cookies in their settings — though blocking
          essential ones may break parts of the Site.
        </p>
      </>
    ),
  },
  {
    id: 'third-party-policies',
    heading: '5. Third-Party Policies',
    body: (
      <p>
        Details on how each provider handles data:{' '}
        <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">PostHog</a>
        {', '}
        <a href="https://www.rb2b.com/privacy-policy" target="_blank" rel="noopener noreferrer">RB2B</a>
        {', '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google</a>
        {', '}
        <a href="https://cal.com/privacy" target="_blank" rel="noopener noreferrer">Cal.com</a>
        . How we handle it is in our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: 'changes-to-this-cookie-policy',
    heading: '6. Changes to This Cookie Policy',
    body: (
      <p>
        We may update this policy periodically — for instance when we add or remove a tool. Changes
        appear on this page with an updated &ldquo;Last updated&rdquo; date.
      </p>
    ),
  },
  {
    id: 'contact-us',
    heading: '7. Contact Us',
    body: (
      <p>
        Questions about cookies on this Site:{' '}
        <a href="mailto:hello@loudface.co">hello@loudface.co</a>
      </p>
    ),
  },
];

export const COOKIES_VIEW: LegalView = {
          eyebrow: 'Legal',
          h1: 'Cookie Policy',
          lastUpdated: 'July 2026',
          sections: SECTIONS,
        };
