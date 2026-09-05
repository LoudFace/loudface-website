'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * One continuous tinted shape that hugs a run of inline content line by line:
 * the first row is as wide as the tag plus its words, the next rows as wide as
 * their words, and the rows are joined — an outline, not a stack of strips.
 *
 * The browser lays the text out; we read each line box, merge the boxes per
 * row, union them into a stepped polygon, round every corner (convex and
 * concave alike), and paint the path behind the text. Re-measured on resize.
 */
export function HugShape({
  children,
  className = '',
  fill,
  pad = 6,
  radius = 9,
}: {
  children: ReactNode;
  className?: string;
  fill: string;
  pad?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const hostRef = useRef<HTMLSpanElement>(null);
  const [geom, setGeom] = useState<{ d: string; w: number; h: number; x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const hostEl = hostRef.current;
    if (!el || !hostEl) return;

    const measure = () => {
      const host = hostEl.getBoundingClientRect();
      // Per-fragment boxes: a text node yields one rect per line it spans; an
      // element (the tag) yields its own box. Ranging over the whole span
      // would also return the span's overall box and poison the rows.
      const rects: DOMRect[] = [];
      el.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const range = document.createRange();
          range.selectNodeContents(node);
          rects.push(...Array.from(range.getClientRects()));
        } else if (node instanceof HTMLElement && !(node instanceof SVGElement) && node.tagName !== 'svg') {
          rects.push(node.getBoundingClientRect());
        }
      });
      const usable = rects.filter((r) => r.width > 0 && r.height > 0);
      if (usable.length === 0) return setGeom(null);

      // Merge fragments into rows by their vertical centre.
      const rows: { top: number; bottom: number; left: number; right: number }[] = [];
      for (const r of usable) {
        const cy = r.top + r.height / 2;
        const row = rows.find((q) => cy > q.top - 2 && cy < q.bottom + 2);
        if (row) {
          row.left = Math.min(row.left, r.left);
          row.right = Math.max(row.right, r.right);
          row.top = Math.min(row.top, r.top);
          row.bottom = Math.max(row.bottom, r.bottom);
        } else rows.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
      }
      rows.sort((a, b) => a.top - b.top);
      // Rows share edges so the shape is one piece.
      for (let i = 1; i < rows.length; i++) {
        const mid = (rows[i - 1].bottom + rows[i].top) / 2;
        rows[i - 1].bottom = mid;
        rows[i].top = mid;
      }

      const x0 = Math.min(...rows.map((r) => r.left)) - pad - host.left;
      const y0 = rows[0].top - pad - host.top;
      const box = rows.map((r) => ({
        l: r.left - pad - host.left - x0,
        r: r.right + pad - host.left - x0,
        t: r.top - pad - host.top - y0,
        b: r.bottom + pad - host.top - y0,
      }));
      // Adjacent rows overlap by 2*pad after padding; keep the seams shared.
      for (let i = 1; i < box.length; i++) {
        const seam = (box[i - 1].b + box[i].t) / 2;
        box[i - 1].b = seam;
        box[i].t = seam;
      }

      // Stepped outline, clockwise: down the right side, back up the left.
      const pts: [number, number][] = [];
      pts.push([box[0].l, box[0].t], [box[0].r, box[0].t]);
      for (let i = 0; i < box.length; i++) {
        pts.push([box[i].r, box[i].b]);
        if (i + 1 < box.length) pts.push([box[i + 1].r, box[i + 1].t]);
      }
      pts.push([box[box.length - 1].l, box[box.length - 1].b]);
      for (let i = box.length - 1; i > 0; i--) {
        pts.push([box[i].l, box[i].t]);
        pts.push([box[i - 1].l, box[i - 1].b]);
      }

      // Drop zero-length steps (rows of equal width), then round every corner.
      const clean = pts.filter((p, i) => {
        const q = pts[(i + 1) % pts.length];
        return Math.abs(p[0] - q[0]) > 0.5 || Math.abs(p[1] - q[1]) > 0.5;
      });
      const n = clean.length;
      let d = '';
      for (let i = 0; i < n; i++) {
        const prev = clean[(i - 1 + n) % n], cur = clean[i], next = clean[(i + 1) % n];
        const len = (a: [number, number], b: [number, number]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
        const r = Math.min(radius, len(prev, cur) / 2, len(cur, next) / 2);
        const uIn = [(cur[0] - prev[0]) / len(prev, cur), (cur[1] - prev[1]) / len(prev, cur)];
        const uOut = [(next[0] - cur[0]) / len(cur, next), (next[1] - cur[1]) / len(cur, next)];
        const a = [cur[0] - uIn[0] * r, cur[1] - uIn[1] * r];
        const b = [cur[0] + uOut[0] * r, cur[1] + uOut[1] * r];
        d += (i === 0 ? `M${a[0]} ${a[1]}` : `L${a[0]} ${a[1]}`) + `Q${cur[0]} ${cur[1]} ${b[0]} ${b[1]}`;
      }
      d += 'Z';

      const w = Math.max(...box.map((b) => b.r));
      const h = box[box.length - 1].b;
      setGeom({ d, w, h, x: x0, y: y0 });
    };

    measure();
    // The web fonts change every line break; measure again once they are in.
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(hostEl);
    window.addEventListener('resize', measure);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pad, radius, children]);

  return (
    <span ref={hostRef} className="relative isolate block">
      {geom && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -z-10"
          style={{ left: geom.x, top: geom.y, width: geom.w, height: geom.h }}
          width={geom.w}
          height={geom.h}
          viewBox={`0 0 ${geom.w} ${geom.h}`}
        >
          <path d={geom.d} fill={fill} />
        </svg>
      )}
      <span ref={ref} className={className}>
        {children}
      </span>
    </span>
  );
}
