import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/assets';

/** Small shared pieces for the v11 homepage. Styles live in home-v11.css, scoped under .v11. */

export const img = (p: string) => asset(`/images/home-v11/${p}`);

export function Eyebrow({ children, dot, color }: { children: ReactNode; dot?: string; color?: string }) {
  return (
    <div className="v11-eyebrow" style={{ '--dot': dot, color } as CSSProperties}>
      <span>{children}</span>
    </div>
  );
}

export function H2({ html, className = '' }: { html: string; className?: string }) {
  return <h2 className={`v11-h2 ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function SectionHead({ eyebrow, heading, body, bodyWidth = 400 }: { eyebrow: string; heading: string; body?: string; bodyWidth?: number }) {
  return (
    <div className="v11-head">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <H2 html={heading} />
      </div>
      {body && <p style={{ width: bodyWidth }}>{body}</p>}
    </div>
  );
}

/** SectionHead for inner pages whose headings are markup (a span.ghost half) rather than editor HTML. Same markup and classes. */
export function SectionHeadNode({ eyebrow, title, body, bodyWidth = 420, right }: { eyebrow?: string; title: ReactNode; body?: ReactNode; bodyWidth?: number; right?: ReactNode }) {
  return (
    <div className="v11-head">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="v11-h2">{title}</h2>
      </div>
      {body && <p style={{ width: bodyWidth }}>{body}</p>}
      {right}
    </div>
  );
}

export const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M12 7H2M6 3L2 7l4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const ArrowUpRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9l6-6M4.5 3H9v4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export function ArrowLink({ href, children, size = 14.5, color }: { href: string; children: ReactNode; size?: number; color?: string }) {
  return (
    <Link href={href} className="v11-link" style={{ fontSize: size, color }}>
      <span>{children}</span>
      <ArrowRight />
    </Link>
  );
}

/** The proposal StatChip: the number as a solid tag, the words on one tinted shape. */
export function Chip({ metric, label, lead = true }: { metric: ReactNode; label: ReactNode; lead?: boolean }) {
  return (
    <div className={`v11-chip ${lead ? 'is-lead' : ''}`}>
      <span className="v11-chip-tag">{metric}</span>
      <span className="v11-chip-label">{label}</span>
    </div>
  );
}

export function LfMark({ size = 16 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/lf-logo.svg" alt="" width={size} height={size} className="v11-lfmark" style={{ width: size, height: size }} />;
}

export function Stars({ fill, size = 13 }: { fill: string; size?: number }) {
  const pts = '6.5,0.8 8.2,4.6 12.3,5 9.2,7.8 10.1,11.9 6.5,9.8 2.9,11.9 3.8,7.8 0.7,5 4.8,4.6';
  return (
    <span className="v11-stars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 13 13"><polygon points={pts} fill={fill} /></svg>
      ))}
    </span>
  );
}

/** Ratings shared by the testimonials and the footer; the icon and star colour are machinery, the copy comes from content. */
export const RATING_STYLE = [
  { icon: 'logos/fav-clutch.png', star: '#e5553a', href: 'https://clutch.co/profile/loudface' },
  { icon: 'logos/fav-google.png', star: '#4f7df0', href: null },
  { icon: 'logos/fav-trustpilot.png', star: '#1aa96b', href: 'https://www.trustpilot.com/review/loudface.co' },
];

/** A client's colour mixed toward white; k is the share of white. */
export function tint(hex: string, k: number) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `#${[r, g, b].map((v) => Math.round(v + (255 - v) * k).toString(16).padStart(2, '0')).join('')}`;
}

export const CAL = { 'data-cal-trigger': '' } as const;
