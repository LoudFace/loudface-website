import type { Metadata, Viewport } from 'next';
import { metadata as studioMetadata, viewport as studioViewport } from 'next-sanity/studio';

/**
 * Studio Layout
 * The Sanity Studio is mounted at /studio. Because this route sits at app
 * root (sibling to (site)/), the site chrome is *not* inherited.
 *
 * globals.css still applies (it's loaded by the root layout), but the
 * @layer base resets there mostly affect element selectors which Sanity's
 * styled-components classes (.csjtMq etc.) override anyway. The few that
 * leak through are reset here in a tight scope.
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
  return (
    <>
      {/* Tight scope: only fix the rules from globals.css @layer base that
          Sanity's own CSS doesn't override at a higher specificity, plus an
          opt-in density bump because Sanity v5 ships a noticeably compact
          UI (21px icons in 25×25 toolbar buttons). The numbers below match
          roughly the v3/v4 density that most editors prefer. */}
      <style>{`
        body { background-color: #fff; overflow: hidden; }

        /* --- Globals.css resets that leak in --- */
        [data-testid="studio-layout"] svg {
          max-width: none;
          vertical-align: middle;
        }
        [data-testid="studio-layout"] a {
          color: revert;
          text-decoration: revert;
        }
        [data-testid="studio-layout"] ul,
        [data-testid="studio-layout"] ol {
          list-style: revert;
          margin: revert;
          padding: revert;
        }

        /* --- Density bump: enlarge Sanity v5's compact icons + buttons --- */
        /* Bump every Sanity icon ~14% (21px → 24px). They use width="1em"
           so changing font-size on the wrapper resizes them in one place. */
        [data-testid="studio-layout"] [data-sanity-icon] {
          font-size: 1.5rem !important;
          margin: -0.5rem !important;
        }

        /* Make icon-only buttons in the toolbar a more clickable size.
           Sanity's compact 25×25 hit area is too cramped for daily editing. */
        [data-testid="studio-navbar"] button,
        [data-testid="studio-navbar"] a[data-ui="Button"] {
          min-height: 2rem;
        }

        /* Give the navbar a touch more breathing room. */
        [data-testid="studio-navbar"] {
          padding: 0.875rem !important;
        }
      `}</style>
      <div className="fixed inset-0 z-[9999]" style={{ margin: 0 }}>
        {children}
      </div>
    </>
  );
}
