/**
 * services-v3 data layer.
 *
 * Case-study SCREENSHOTS (hero work-wall + the three exhibits) come LIVE from
 * Sanity by slug via the homepage's getHomeV3Images helper — the same slug set
 * and query the homepage SelectedWork uses, so the images survive asset
 * re-uploads. Components append their own crop params and fall back to the
 * hardcoded CDN URL when a slug is absent, so a fetch failure or missing doc can
 * never blank an image. Re-exported here under a services-facing name so the
 * page + components read from one place.
 *
 * FAQ items live here too so the page can emit the FAQPage JSON-LD from the same
 * source of truth the accordion renders.
 */
export { getHomeV3Images as getServicesImages, type HomeImages as ServicesImages } from '../home-v3/data';

export interface ServicesFaqItem {
  q: string;
  a: string; // plain text — feeds the FAQPage schema
  aHtml?: string; // optional rich variant (<strong>) — feeds the accordion
}

/** FAQ content — single source for the accordion AND the FAQPage JSON-LD. */
export const SERVICES_FAQ: ServicesFaqItem[] = [
  {
    q: 'Can I hire you for just one service?',
    a: 'Yes. Most engagements start on one track — a Webflow build, or the SEO/AEO + GEO program — and add the other whenever it makes sense. Because it’s the same team either way, nothing gets re-briefed when you scale up.',
  },
  {
    q: 'What’s the real difference between SEO/AEO and GEO?',
    a: 'SEO/AEO makes your own pages visible in search and AI answers — measured in rankings and citations of your URLs. GEO makes AI engines recommend you by name when buyers ask who to hire — measured as share of answer. Related work, different scoreboards. The panel above lays it out side by side.',
    aHtml:
      '<strong>SEO/AEO</strong> makes your own pages visible in search and AI answers — measured in rankings and citations of your URLs. <strong>GEO</strong> makes AI engines recommend you by name when buyers ask who to hire — measured as share of answer. Related work, different scoreboards. The panel above lays it out side by side.',
  },
  {
    q: 'Do the build team and the growth team actually talk?',
    a: 'They’re the same team. The people who ship your site are the people who run its SEO, conversion, and AI-visibility work — so the site is built to be found and to convert from day one, not retrofitted later.',
  },
  {
    q: 'How fast do you respond?',
    a: 'Within about two hours during working hours. You get one team and a direct line, not a ticket queue that routes your question to whoever’s free.',
  },
  {
    q: 'How do we start?',
    a: 'A 30-minute strategy call. We look at your site together and tell you which of the seven services it actually needs — and which to skip — and where they’d move the needle first. No pitch deck.',
  },
];

/**
 * The seven services, in the two-track order they appear in the directory.
 * Single source for the ServicesIndex directory rows AND the ItemList JSON-LD.
 */
export interface ServiceEntry {
  slug: string; // child route under /services
  name: string;
  blurb: string;
  track: 'build' | 'grow';
}

export const SERVICES: ServiceEntry[] = [
  { slug: 'webflow', name: 'Webflow design & development', blurb: 'Scalable builds optimized for performance', track: 'build' },
  { slug: 'ux-ui-design', name: 'UX/UI design', blurb: 'Conversion-focused design systems', track: 'build' },
  { slug: 'cro', name: 'Conversion rate optimization', blurb: 'Data-driven optimization that converts', track: 'build' },
  { slug: 'copywriting', name: 'Copywriting', blurb: 'Persuasive content that connects', track: 'build' },
  { slug: 'seo-aeo', name: 'SEO & AEO', blurb: 'Visibility across search and AI engines', track: 'grow' },
  { slug: 'geo', name: 'Generative Engine Optimization', blurb: 'Get cited by ChatGPT, Perplexity & AI Overviews', track: 'grow' },
  { slug: 'growth-autopilot', name: 'Growth Autopilot', blurb: 'SEO, AEO & CRO as one integrated system', track: 'grow' },
];
