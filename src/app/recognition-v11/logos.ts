/**
 * Publisher marks and list captures for the Recognition page (2026-10-30).
 *
 * Marks: each publisher's own site icon, read with openbrand (openbrand.sh/api/extract) on 2026-10-30, the largest
 * square favicon or touch icon it returned (Google's favicon service only where that was larger), redrawn to 128px PNG
 * in public/images/recognition/logos/<domain>.png. openbrand found a wordmark for only 12 of the 45 sites, so every
 * publisher shows its icon beside its name set in type (Citant added 2026-10-30, same way). `null`: no usable mark (a 16px favicon, or a site builder's
 * icon in place of the publisher's), so the name stands alone. Never draw a stand-in.
 *
 * Names: Sanity's `publisher` is sometimes the bare domain. These are the names the sites use for themselves
 * (openbrand's brandName, or the publisher name the site puts in its own page titles).
 */

export const MARKS: Record<string, string | null> = {
  '009.agency': '009.agency', 'airanked.ai': 'airanked.ai', 'arobis.ai': 'arobis.ai', 'austinheaton.com': 'austinheaton.com',
  'avenuez.com': 'avenuez.com', 'bluelinks.agency': 'bluelinks.agency', 'breakingb2b.com': 'breakingb2b.com',
  'brixagency.com': 'brixagency.com', 'broadcastwell.com': 'broadcastwell.com', 'businessdailymedia.com': 'businessdailymedia.com',
  'citant.ai': 'citant.ai', 'citelead.com': 'citelead.com', 'danishleadco.io': 'danishleadco.io', 'deepoceanstudio.com': 'deepoceanstudio.com',
  'devmarklab.com': 'devmarklab.com', 'drmattlynch.com': null, 'geekchamp.com': 'geekchamp.com',
  'geoagencyindex.com': 'geoagencyindex.com', 'growpad.pro': 'growpad.pro', 'growthpartnerindex.com': 'growthpartnerindex.com',
  'gtm8020.com': null, 'hackernoon.com': 'hackernoon.com', 'higoodie.com': 'higoodie.com', 'itechguides.com': 'itechguides.com',
  'joinappear.com': 'joinappear.com', 'knownwise.com': 'knownwise.com', 'linkee.ai': 'linkee.ai', 'maximuslabs.ai': 'maximuslabs.ai',
  'mentionbench.com': 'mentionbench.com', 'miraa.io': 'miraa.io', 'mobilestalk.net': 'mobilestalk.net',
  'nathanojaokomo.com': 'nathanojaokomo.com', 'noudar.ai': 'noudar.ai', 'overflow.agency': 'overflow.agency',
  'peppereffect.com': 'peppereffect.com', 'rankability.com': 'rankability.com', 'ranktracker.com': 'ranktracker.com',
  'saashero.net': null, 'saassoftwarecore.com': 'saassoftwarecore.com', 'shortlistreport.com': 'shortlistreport.com',
  'skale.so': 'skale.so', 'sourcerankai.com': 'sourcerankai.com', 'topgeoagencies.net': 'topgeoagencies.net',
  'tripledart.com': 'tripledart.com', 'verticality.co': 'verticality.co', 'whatifdesign.co': 'whatifdesign.co',
};

export const NAMES: Record<string, string> = {
  'breakingb2b.com': 'Breaking B2B', 'arobis.ai': 'Arobis AI', 'tripledart.com': 'TripleDart', 'maximuslabs.ai': 'MaximusLabs',
  'nathanojaokomo.com': 'Nathan Ojaokomo', 'gtm8020.com': 'GTM 8020', 'joinappear.com': 'Appear', 'linkee.ai': 'Linkee AI',
  'whatifdesign.co': 'What if Design', 'brixagency.com': 'BRIX Agency', 'broadcastwell.com': 'Broadcastwell',
  'peppereffect.com': 'peppereffect', 'noudar.ai': 'Noudar AI', 'austinheaton.com': 'Austin Heaton', 'knownwise.com': 'Knownwise',
  'ranktracker.com': 'Ranktracker', 'businessdailymedia.com': 'Business Daily Media', 'hackernoon.com': 'HackerNoon',
  'overflow.agency': 'Overflow Agency',
};

/**
 * Our top honour as its publisher shows it: TripleDart's fintech list, "1. LoudFace" above TripleDart's own entry.
 * Captured 2026-10-30 at 2x with design-directions capture_sites.mjs (consent banners hidden, never accepted), cut to an
 * 820px column (the list's whole text column, so no line is cut) with crop_site.py, shown at 680px (0.83x). `heroBox` is the entry heading in
 * display px, measured from the page's own text box. Raw capture: design-lab/concepts/2026-10-30-recognition/live/.
 * `heroPhone`: the same entry captured with a 390px viewport (the list's own phone layout) for screens under 768px.
 * Keyed by host and path without protocol, www or trailing slash (the sync may store either spelling).
 */
export const SHOTS: Record<string, { hero?: string; heroPhone?: string; heroBox?: Box; card?: string; cardPhone?: string; cardH?: number; cardBox?: Box; cardFor?: 'fintech' | 'saas' | 'aeo' | 'geo' | 'other' }> = {
  'tripledart.com/blog/fintech-aeo-agencies': { hero: 'tripledart-hero.jpg', heroPhone: 'tripledart-hero-phone.jpg', heroBox: { x: 17, y: 29, w: 81, h: 17 } },
  // "What we are recognised for": one entry per topic as the publisher shows it, with its verdict: the list's whole text
  // column at 600px wide (scale beside each), cut from the entry heading to where the entry ends, above any picture or
  // the next entry. HackerNoon's column is 1020px, so its body text is small; its verdict is the heading.
  // `cardPhone`: under 768px, the same entry captured at the list's own 390px layout, cut to the heading and verdict
  // only, so its text stays at 12px or more.
  'verticality.co/blog/best-ai-visibility-agencies-for-fintech': { card: 'verticality-entry.jpg', cardPhone: 'verticality-entry-phone.jpg', cardH: 247, cardBox: { x: 19, y: 18, w: 95, h: 19 }, cardFor: 'fintech' }, // 0.80
  'skale.so/saas-marketing/agencies': { card: 'skale-entry.jpg', cardPhone: 'skale-entry-phone.jpg', cardH: 91, cardBox: { x: 21, y: 19, w: 558, h: 61 }, cardFor: 'saas' }, // 0.88
  'danishleadco.io/blog/aeo-agencies-for-fintech': { card: 'danishleadco-entry.jpg', cardPhone: 'danishleadco-entry-phone.jpg', cardH: 199, cardBox: { x: 19, y: 18, w: 101, h: 23 }, cardFor: 'aeo' }, // 0.80
  'airanked.ai/guides/best-geo-agencies': { card: 'airanked-entry.jpg', cardPhone: 'airanked-entry-phone.jpg', cardH: 85, cardBox: { x: 19, y: 17, w: 562, h: 53 }, cardFor: 'geo' }, // 0.79
  'hackernoon.com/best-aeo-agencies-for-developer-tool-companies': { card: 'hackernoon-entry.jpg', cardPhone: 'hackernoon-entry-phone.jpg', cardH: 145, cardBox: { x: 13, y: 12, w: 383, h: 20 }, cardFor: 'other' }, // 0.56
};

export interface Box { x: number; y: number; w: number; h: number }
