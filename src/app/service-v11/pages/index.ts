import type { ExtrasFn } from '../types';
import { aiOverviews } from './ai-overviews';
import { copywriting } from './copywriting';
import { cro } from './cro';
import { geoAgency } from './geo-agency';
import { growthAutopilot } from './growth-autopilot';
import { organicGrowth } from './organic-growth';
import { seoAeo } from './seo-aeo';
import { uxUiDesign } from './ux-ui-design';
import { webflow } from './webflow';

/** Each service page's own picture, proof and signature section, by slug. */
export const EXTRAS: Record<string, ExtrasFn> = {
  webflow,
  'ux-ui-design': uxUiDesign,
  cro,
  copywriting,
  'seo-aeo': seoAeo,
  'organic-growth': organicGrowth,
  'geo-agency': geoAgency,
  'ai-overviews': aiOverviews,
  'growth-autopilot': growthAutopilot,
};
