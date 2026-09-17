import type { Metadata } from 'next';
import { headers } from 'next/headers';
import '../globals.css';
import '../(proposal)/proposal.css';
import { countryRequiresConsent } from '@/lib/consent';

/**
 * (audit-report) layout — the chrome-free surface behind /a/<token>.
 *
 * Deliberately the same surface as a proposal: it reuses proposal.css, which
 * carries the print rules. Clients forward these as PDFs, so Cmd+P is a real
 * output format and the audit gets it for free rather than growing a second,
 * drifting copy of the same rules.
 *
 * The route group is not part of the URL — (audit-report)/a/[token] serves
 * /a/<token>. It is a separate group from (audit), which serves the automated
 * lead-magnet deck at /audit/<id>.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AuditReportLayout({
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
