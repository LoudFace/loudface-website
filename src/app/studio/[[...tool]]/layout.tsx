import type { Metadata, Viewport } from 'next';
import { metadata as studioMetadata, viewport as studioViewport } from 'next-sanity/studio';

/**
 * Studio Layout — reset to Sanity defaults.
 *
 * Site chrome is bypassed by the (site) route group, so the Studio renders
 * inside its own minimal layout. No CSS overrides, no density tweaks — the
 * Studio looks exactly the way Sanity ships it.
 *
 * If a CSS reset from globals.css ever bleeds into the Studio again, fix it
 * by scoping the reset away from `[data-testid="studio-layout"] *` rather
 * than adding overrides here. The Studio should remain pristine.
 */
export const metadata: Metadata = {
  ...studioMetadata,
  title: 'LoudFace CMS Studio',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  ...studioViewport,
  viewportFit: studioViewport.viewportFit as Viewport['viewportFit'],
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
