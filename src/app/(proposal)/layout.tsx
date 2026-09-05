import type { Metadata } from 'next';
import { headers } from 'next/headers';
import '../globals.css';
import './proposal.css';
import { countryRequiresConsent } from '@/lib/consent';

/**
 * (proposal) layout — the chrome-free surface behind /p/<token>.
 *
 * No header, no footer, no Cal embed, no consent banner: a proposal is a
 * document, not a marketing page, and every extra element is one more thing
 * that can print badly or distract from the price.
 *
 * `data-lf-cr` carries the same consent verdict the (site) layout computes.
 * PostHog reads it (see src/lib/consent.ts) and stays off for EEA/UK/CH
 * readers who have not already accepted on loudface.co. Same policy as the
 * rest of the site, just without the banner.
 *
 * The route group is not part of the URL — (proposal)/p/[token] serves
 * /p/<token>.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ProposalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const country =
    requestHeaders.get('cf-ipcountry') ?? requestHeaders.get('x-vercel-ip-country');

  return (
    <div
      className="proposal-surface font-sans antialiased bg-surface-50 text-surface-950 min-h-screen"
      data-lf-cr={countryRequiresConsent(country) ? '1' : '0'}
    >
      {children}
    </div>
  );
}
