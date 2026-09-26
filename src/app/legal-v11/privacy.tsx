/**
 * The Privacy Policy text, moved verbatim out of src/app/(site)/privacy/page.tsx on 2026-09-26 so the live page
 * (LegalPageV3) and the v11 template (LegalPageV11) read one copy. Compliance copy: no rewording without a legal read.
 */
import Link from 'next/link';
import type { LegalSection, LegalView } from '../legal-v3/LegalPageV3';

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

const SECTIONS: LegalSection[] = [
  {
    id: 'who-we-are',
    heading: '1. Who We Are',
    body: (
      <p>
        LOUDFACE - FZCO (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates
        loudface.co (the &ldquo;Site&rdquo;). We are the data controller for the personal
        information described in this policy. Questions go to{' '}
        <a href="mailto:hello@loudface.co">hello@loudface.co</a>.
      </p>
    ),
  },
  {
    id: 'information-we-collect',
    heading: '2. Information We Collect',
    body: (
      <>
        <p>
          <strong>Information you give us:</strong> When you fill out a form on the Site — booking a
          call, applying to our partner program, or registering for a webinar — we collect what you
          enter: typically your name, email address, company, and anything you write in a message
          field.
        </p>
        <p>
          <strong>Information collected automatically:</strong> With your consent where required
          (see Section 4), we use cookies and similar technologies to collect your IP address, pages
          viewed, referrer, and device and browser details. Our analytics runs on PostHog and tags
          loaded through Google Tag Manager.
        </p>
        <p>
          <strong>B2B visitor identification:</strong> We use RB2B, a service that matches the IP
          address and browsing behavior of visitors located in the United States against its
          database to tell us which businesses — and in some cases which individual professionals
          (name, business email, LinkedIn profile) — have visited the Site. RB2B only attempts to
          identify US-based visitors. You can remove yourself from RB2B&rsquo;s database at{' '}
          <a href="https://app.retention.com/optout" target="_blank" rel="noopener noreferrer">
            app.retention.com/optout
          </a>
          , and stop the tool from running on this Site at all via our{' '}
          <Link href="/cookies">Cookie Policy</Link> page.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    heading: '3. How We Use Your Information',
    body: (
      <ul>
        <li>
          <strong>To respond and schedule:</strong> arranging the calls you book, processing partner
          applications, and running webinars you register for.
        </li>
        <li>
          <strong>To improve the Site:</strong> analyzing how visitors use our pages so we can fix
          what doesn&rsquo;t work.
        </li>
        <li>
          <strong>For B2B outreach:</strong> contacting companies (and the professionals RB2B
          identifies) whose visit suggests our services are relevant to them.
        </li>
        <li>
          <strong>To keep the Site secure</strong> and defend against abuse.
        </li>
      </ul>
    ),
  },
  {
    id: 'legal-bases',
    heading: '4. Legal Bases and Consent',
    body: (
      <>
        <p>
          Where the GDPR or similar laws apply, we rely on: <strong>consent</strong> for analytics
          and tracking cookies — for visitors in the EEA, UK, and Switzerland, nothing non-essential
          loads without opt-in consent, which most pages request via a consent banner (pages without
          the banner simply leave tracking off); <strong>performance of a contract</strong> for
          handling bookings and applications; and <strong>legitimate interests</strong> for Site
          security and for business-to-business outreach where the law permits it.
        </p>
        <p>
          You can withdraw consent at any time on our <Link href="/cookies">Cookie Policy</Link>{' '}
          page. We also honor the Global Privacy Control browser signal as an opt-out.
        </p>
      </>
    ),
  },
  {
    id: 'third-party-services',
    heading: '5. Third-Party Services',
    body: (
      <>
        <p>These services process data on our behalf or receive it as part of providing the Site:</p>
        <ul>
          {thirdParties.map((service) => (
            <li key={service.name}>
              <a href={service.href} target="_blank" rel="noopener noreferrer">
                <strong>{service.name}</strong>
              </a>
              {' — '}
              {service.purpose}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'international-transfers',
    heading: '6. International Transfers',
    body: (
      <p>
        Some of the providers above process data in the United States and other countries outside
        your own. Where required, these transfers rely on appropriate safeguards such as standard
        contractual clauses in our agreements with those providers.
      </p>
    ),
  },
  {
    id: 'data-retention',
    heading: '7. Data Retention',
    body: (
      <p>
        We keep form submissions for as long as we&rsquo;re in contact with you or need them for the
        purpose you submitted them for, then delete them. Analytics and visitor identification data
        is retained according to each provider&rsquo;s policy, linked above. If you ask us to delete
        your data (Section 8), we also pass the request to the relevant providers.
      </p>
    ),
  },
  {
    id: 'your-rights',
    heading: '8. Your Rights',
    body: (
      <>
        <p>
          Depending on where you live, you have the right to access, correct, delete, or receive a
          copy of your personal information, to restrict or object to how we process it, and to
          withdraw consent at any time without affecting prior processing.
        </p>
        <p>
          To exercise any of these rights, email{' '}
          <a href="mailto:hello@loudface.co">hello@loudface.co</a> — we respond within 30 days. If
          you&rsquo;re in the EEA or UK and believe we haven&rsquo;t resolved your concern, you can
          complain to your local data protection authority.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    heading: '9. Cookies',
    body: (
      <p>
        For the full list of cookies we use, what they do, and the controls for turning them off,
        see our <Link href="/cookies">Cookie Policy</Link>.
      </p>
    ),
  },
  {
    id: 'data-security',
    heading: '10. Data Security',
    body: (
      <p>
        We limit access to personal information to the people and services that need it, and the
        Site is served over HTTPS end to end. No method of transmission over the internet is
        entirely secure, though — we can&rsquo;t promise absolute security, and we don&rsquo;t.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: '11. Changes to This Privacy Policy',
    body: (
      <p>
        We may update this policy from time to time. Changes appear on this page with an updated
        &ldquo;Last updated&rdquo; date; material changes get a notice on the Site.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: '12. Contact Us',
    body: (
      <p>
        LOUDFACE - FZCO · <a href="mailto:hello@loudface.co">hello@loudface.co</a>
      </p>
    ),
  },
];

export const PRIVACY_VIEW: LegalView = {
          eyebrow: 'Legal',
          h1: 'Privacy Policy',
          sub: 'What we collect, who we share it with, and how to make us stop.',
          lastUpdated: 'July 2026',
          sections: SECTIONS,
        };
