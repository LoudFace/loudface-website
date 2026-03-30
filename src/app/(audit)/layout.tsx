import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'AI Visibility Audit | LoudFace',
    template: '%s | LoudFace',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Hide site chrome (Header, Footer, Webflow badge) on audit pages */}
      <style>{`
        header, footer, [aria-label="Webflow Enterprise Partner"],
        .skip-link { display: none !important; }
        body { background-color: var(--color-surface-950); color: var(--color-surface-300); overflow: hidden; }
      `}</style>
      {children}
    </>
  );
}
