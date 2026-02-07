'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Chunky retro pixel grid that morphs between mobile / tablet / desktop
 * layouts with a staggered wave dissolve animation.
 */

const COLS = 7;
const ROWS = 6;

type PixelState = { color: string; on: boolean };
type Layout = PixelState[][];

// Color tokens
const BRAND = 'var(--color-primary-600)';
const BRAND_MID = 'var(--color-primary-400)';
const BRAND_LIGHT = 'var(--color-primary-200)';
const CONTENT = 'var(--color-surface-400)';
const CONTENT_LIGHT = 'var(--color-surface-300)';
const OFF = 'var(--color-surface-100)';

function blank(): Layout {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ color: OFF, on: false })),
  );
}

function fill(
  grid: Layout,
  r1: number, c1: number,
  r2: number, c2: number,
  color: string,
) {
  for (let r = r1; r <= Math.min(r2, ROWS - 1); r++) {
    for (let c = c1; c <= Math.min(c2, COLS - 1); c++) {
      grid[r][c] = { color, on: true };
    }
  }
}

// ── Mobile: narrow centered stack ───────────────────────────────
function mobileLayout(): Layout {
  const g = blank();
  fill(g, 0, 2, 0, 4, BRAND);         // nav
  fill(g, 1, 1, 2, 5, BRAND_LIGHT);   // hero
  fill(g, 1, 2, 1, 4, BRAND_MID);     // hero accent
  fill(g, 3, 1, 3, 5, CONTENT);       // card 1
  fill(g, 4, 1, 4, 5, CONTENT_LIGHT); // card 2
  fill(g, 5, 2, 5, 4, BRAND);         // CTA
  return g;
}

// ── Tablet: two-column split ────────────────────────────────────
function tabletLayout(): Layout {
  const g = blank();
  fill(g, 0, 0, 0, 6, BRAND);         // full nav
  fill(g, 1, 0, 2, 3, BRAND_LIGHT);   // hero left
  fill(g, 1, 1, 1, 2, BRAND_MID);     // hero accent
  fill(g, 1, 4, 2, 6, CONTENT_LIGHT); // hero image
  fill(g, 3, 0, 4, 3, CONTENT);       // card left
  fill(g, 3, 4, 4, 6, CONTENT);       // card right
  fill(g, 5, 2, 5, 4, BRAND);         // CTA
  return g;
}

// ── Desktop: three-column grid ──────────────────────────────────
function desktopLayout(): Layout {
  const g = blank();
  fill(g, 0, 0, 0, 6, BRAND);         // full nav
  fill(g, 1, 0, 2, 3, BRAND_LIGHT);   // hero left
  fill(g, 1, 0, 1, 2, BRAND_MID);     // hero accent
  fill(g, 1, 4, 2, 6, CONTENT_LIGHT); // hero image
  fill(g, 3, 0, 4, 1, CONTENT);       // card 1
  fill(g, 3, 3, 4, 4, CONTENT);       // card 2 (gap col 2)
  fill(g, 3, 5, 4, 6, CONTENT);       // card 3
  fill(g, 5, 1, 5, 5, BRAND);         // CTA
  return g;
}

const LAYOUTS = [mobileLayout, tabletLayout, desktopLayout];

export function PixelBreakpointAnimation() {
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [grid, setGrid] = useState<Layout>(mobileLayout);
  const [phase, setPhase] = useState<'idle' | 'dissolve' | 'reform'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const morph = useCallback((nextIdx: number) => {
    setPhase('dissolve');
    timerRef.current = setTimeout(() => {
      setGrid(LAYOUTS[nextIdx]());
      setLayoutIndex(nextIdx);
      setPhase('reform');
      timerRef.current = setTimeout(() => setPhase('idle'), 450);
    }, 380);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLayoutIndex((prev) => {
        const next = (prev + 1) % LAYOUTS.length;
        morph(next);
        return prev;
      });
    }, 2600);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [morph]);

  const cR = (ROWS - 1) / 2;
  const cC = (COLS - 1) / 2;
  const maxDist = Math.sqrt(cR ** 2 + cC ** 2);

  return (
    <div className="h-40 rounded-xl bg-surface-50 border border-surface-100 flex flex-col items-center justify-center gap-2 p-4 overflow-hidden select-none">
      {/* Pixel grid — fixed height so dissolve animation can't collapse it */}
      <div
        className="w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          gap: '4px',
          maxWidth: 220,
          height: 112,
        }}
        aria-hidden="true"
      >
        {grid.flatMap((row, r) =>
          row.map((cell, c) => {
            const dist = Math.sqrt((r - cR) ** 2 + (c - cC) ** 2) / maxDist;
            let transform = 'scale(1)';
            let opacity = cell.on ? 1 : 0.35;
            let delay = 0;

            if (phase === 'dissolve') {
              transform = `scale(0) rotate(${(r * COLS + c) % 3 === 0 ? 90 : (r + c) % 2 ? 45 : -45}deg)`;
              opacity = 0;
              delay = dist * 180;
            } else if (phase === 'reform') {
              delay = (1 - dist) * 180;
            }

            return (
              <div
                key={`${r}-${c}`}
                className="rounded-sm w-full h-full"
                style={{
                  backgroundColor: cell.color,
                  opacity,
                  transform,
                  transition: `transform 320ms cubic-bezier(.34,1.56,.64,1) ${delay}ms, opacity 280ms ease ${delay}ms, background-color 350ms ease ${delay}ms`,
                }}
              />
            );
          }),
        )}
      </div>

      {/* Breakpoint dots */}
      <div className="flex items-center gap-2">
        {LAYOUTS.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === layoutIndex
                ? 'w-4 h-1.5 bg-primary-500'
                : 'w-1.5 h-1.5 bg-surface-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
