'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Shows a fixed-size drawing (a chart, a product window) at its true size, and zooms it down as a whole when
 * its column is narrower. Product UI shrinks like a screenshot instead of reflowing into something that never
 * existed. Below `min` it stops shrinking and the column scrolls sideways instead.
 */
export function FitScale({ width, min = 0, children, className = '' }: { width: number; min?: number; children: ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);

  useEffect(() => {
    const o = outer.current;
    if (!o) return;
    const fit = () => setS(Math.max(min, Math.min(1, o.clientWidth / width)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    return () => ro.disconnect();
  }, [width, min]);

  return (
    <div ref={outer} className={`v11-fit ${className}`}>
      <div style={{ width, zoom: s < 1 ? s : undefined }}>{children}</div>
    </div>
  );
}
