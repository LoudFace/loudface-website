import type { Metadata } from 'next';
import { HeroMonolithMount } from '@/components/three/HeroMonolithMount';

export const metadata: Metadata = {
  title: 'Monolith preview',
  robots: {
    follow: false,
    index: false,
  },
};

/** Standalone, full-viewport composition for visual QA of the hero artifact. */
export default function MonolithPreviewPage() {
  return (
    <div className="fixed inset-0 z-[60]" style={{ backgroundColor: 'var(--color-surface-950)' }}>
      <HeroMonolithMount />
    </div>
  );
}
