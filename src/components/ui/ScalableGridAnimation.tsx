'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Pages appear one at a time in a 4×2 grid, counting up.
 * Each tile is a clean mini-page wireframe (accent bar + content).
 * After filling, pauses, then fades and restarts.
 */

type TileStyle = {
  accent: string;
  headerW: string;
  hasImg: boolean;
  lines: number;
};

const TILES: TileStyle[] = [
  { accent: 'var(--color-primary-500)', headerW: '60%', hasImg: true, lines: 2 },
  { accent: 'var(--color-primary-400)', headerW: '45%', hasImg: false, lines: 3 },
  { accent: 'var(--color-primary-600)', headerW: '70%', hasImg: true, lines: 1 },
  { accent: 'var(--color-primary-400)', headerW: '50%', hasImg: true, lines: 2 },
  { accent: 'var(--color-primary-500)', headerW: '40%', hasImg: false, lines: 3 },
  { accent: 'var(--color-primary-600)', headerW: '65%', hasImg: true, lines: 2 },
  { accent: 'var(--color-primary-400)', headerW: '55%', hasImg: true, lines: 1 },
  { accent: 'var(--color-primary-500)', headerW: '48%', hasImg: false, lines: 3 },
];

const TOTAL = TILES.length;

function MiniPage({ style, visible }: { style: TileStyle; visible: boolean }) {
  return (
    <div
      className="rounded-lg overflow-hidden flex flex-col"
      style={{
        backgroundColor: visible ? 'rgba(255,255,255,0.93)' : 'transparent',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 400ms ease, transform 400ms cubic-bezier(.22,1,.36,1), background-color 300ms ease',
        boxShadow: visible ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {/* Accent bar */}
      <div style={{ height: 3, backgroundColor: style.accent }} />
      <div className="p-2 flex flex-col gap-1">
        {/* Header */}
        <div className="rounded-sm" style={{ height: 3, width: style.headerW, backgroundColor: 'var(--color-surface-700)' }} />
        {/* Image */}
        {style.hasImg && <div className="rounded-sm bg-surface-100" style={{ height: 12 }} />}
        {/* Lines */}
        {Array.from({ length: style.lines }, (_, i) => (
          <div key={i} className="rounded-sm" style={{ height: 2, width: `${80 - i * 18}%`, backgroundColor: 'var(--color-surface-200)' }} />
        ))}
      </div>
    </div>
  );
}

export function ScalableGridAnimation() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const cycle = useCallback(() => {
    let current = 0;
    setFading(false);
    setVisibleCount(0);

    // Add pages one at a time
    const addNext = () => {
      current++;
      setVisibleCount(current);
      if (current < TOTAL) {
        timerRef.current = setTimeout(addNext, 350);
      } else {
        // All visible — pause, then fade and restart
        timerRef.current = setTimeout(() => {
          setFading(true);
          timerRef.current = setTimeout(() => {
            setFading(false);
            setVisibleCount(0);
            timerRef.current = setTimeout(cycle, 400);
          }, 600);
        }, 1800);
      }
    };

    timerRef.current = setTimeout(addNext, 500);
  }, []);

  useEffect(() => {
    cycle();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cycle]);

  return (
    <div className="h-44 flex flex-col items-center justify-center" aria-hidden="true">
      {/* Counter */}
      <div className="flex items-baseline gap-1.5 mb-3" style={{ opacity: fading ? 0 : 1, transition: 'opacity 500ms ease' }}>
        <span className="text-2xl font-mono font-semibold text-white tabular-nums">
          {visibleCount}
        </span>
        <span className="text-xs text-surface-500 font-medium">
          {visibleCount === TOTAL ? 'pages & counting' : visibleCount === 1 ? 'page' : 'pages'}
        </span>
      </div>

      {/* Grid */}
      <div
        className="w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: 10,
          maxWidth: 310,
          height: 110,
          opacity: fading ? 0 : 1,
          transform: fading ? 'scale(0.95)' : 'scale(1)',
          transition: 'opacity 500ms ease, transform 500ms ease',
        }}
      >
        {TILES.map((tile, i) => (
          <MiniPage key={i} style={tile} visible={i < visibleCount} />
        ))}
      </div>
    </div>
  );
}
