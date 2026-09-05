import type { Metadata, Viewport } from 'next';
import { metadata as studioMetadata, viewport as studioViewport } from 'next-sanity/studio';

/**
 * Proposals Studio layout — same shape as the main Studio layout: Sanity's own
 * chrome, no globals.css, never indexed.
 */
export const metadata: Metadata = {
  ...studioMetadata,
  title: 'LoudFace Proposals Studio',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  ...studioViewport,
  viewportFit: studioViewport.viewportFit as Viewport['viewportFit'],
};

export default function ProposalsStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
