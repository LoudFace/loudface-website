/**
 * Hero variant preview — the review door for homepage experiments.
 *
 * `/preview/hero` shows the control hero, `/preview/hero?v=b` shows the
 * challenger, both on the real page composition with the real chrome. This
 * exists so a copy or design variant can be looked at on the live domain
 * BEFORE it is shown to a single visitor.
 *
 * Deliberately separate from `/`:
 * - `/` keeps rendering statically with the control hero. Reading request-time
 *   input there would opt the homepage out of static rendering for every real
 *   visitor, purely to serve a preview.
 * - This route is noindex/nofollow, so it can never be crawled, indexed, or
 *   counted as duplicate content against the homepage.
 *
 * It is a manual override only: it assigns nobody to a variant and records no
 * experiment exposure, so opening it cannot pollute a running test.
 */
import type { Metadata } from 'next';
import '../../../home-v3/home-v3.css';
import { HomeV3Body } from '../../../home-v3/HomeV3Body';
import type { HeroVariant } from '../../../home-v3/HeroV3';
import { HomepageV3Scripts } from '../../../homepage-v3/Scripts';
import { getHomeV3Images } from '../../../home-v3/data';

export const metadata: Metadata = {
  title: 'Hero variant preview',
  robots: { index: false, follow: false, nocache: true },
};

export default async function HeroPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const heroVariant: HeroVariant = v === 'b' || v === 'test' ? 'test' : 'control';
  const images = await getHomeV3Images();

  return (
    <>
      <div
        style={{
          position: 'fixed', insetInline: 0, top: 0, zIndex: 9999,
          background: heroVariant === 'test' ? '#b3541e' : '#333',
          color: '#fff', font: '600 12px/1 ui-sans-serif, system-ui, sans-serif',
          letterSpacing: '.08em', textTransform: 'uppercase',
          padding: '7px 12px', textAlign: 'center',
        }}
      >
        Preview — not live · {heroVariant === 'test' ? 'Version B (challenger)' : 'Version A (live copy)'}
      </div>
      <HomeV3Body images={images} heroVariant={heroVariant} />
      <HomepageV3Scripts />
    </>
  );
}
