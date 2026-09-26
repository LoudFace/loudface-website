import type { ReactNode } from 'react';
import type { HomeV11Content } from '@/lib/content-utils';
import type { ServiceConfig } from '../service-v3/data';
import type { HomeV11Data } from '../home-v11/data';

/** What each service page adds to the shared template: its picture, its proof and its one signature section. */
export interface ServiceExtras {
  /** Replaces the client screenshot on the stage, when the page's picture is not a website. */
  heroArt?: ReactNode;
  heroCard: ReactNode;
  heroCardWide?: boolean;
  band: { k: string; v: string; s: string }[];
  /** One short label and one piece of product UI per program tile, in the config's tile order. */
  tiles?: { tag: string; art?: ReactNode }[];
  /** The page's proof grid (client videos, quotes, figures), shown after the FAQ as social proof. */
  results?: { eyebrow?: string; title?: ReactNode; lede?: string; cells: ReactNode };
  /** Set when the signature section already uses the config's proof heading, so the charts take the homepage's. */
  chartsUseHomeHead?: boolean;
  signature?: { eyebrow: string; title: ReactNode; lede?: ReactNode; node: ReactNode; ground?: 'warm' | 'white' };
  /** Further page-specific sections, after the signature. */
  more?: { key: string; eyebrow?: string; title: ReactNode; lede?: ReactNode; node: ReactNode }[];
  /** Rendered instead of the verified long-form body's plain prose block. */
  body?: ReactNode;
}

export interface ExtrasCtx {
  config: ServiceConfig;
  home: HomeV11Content;
  data: HomeV11Data | null;
  images: Record<string, string>;
}

export type ExtrasFn = (ctx: ExtrasCtx) => ServiceExtras;
