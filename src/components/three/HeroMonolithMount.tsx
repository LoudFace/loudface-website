'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { asset } from '@/lib/assets';

const HeroMonolith = dynamic(
  () => import('./HeroMonolith').then((module) => module.HeroMonolith),
  {
    loading: () => <MonolithPoster />,
    ssr: false,
  },
);

function MonolithPoster() {
  return (
    <img
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover"
      src={asset('/images/monolith-poster.svg')}
    />
  );
}

/** Loads the WebGL artifact after hydration and keeps mobile on its static poster. */
export function HeroMonolithMount() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {isMobile ? <MonolithPoster /> : <HeroMonolith />}
    </div>
  );
}
