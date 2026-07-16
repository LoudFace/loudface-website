/**
 * Case Studies Gallery Page — v3 design (componentized).
 *
 * Faithful port of the approved work-v3 "marquee-stage" concept. Composed from
 * the work-v3 section components inside the (site) group so it inherits the
 * shared Header/Footer + PostHog/GTM/Cal chrome. The shared Header renders in
 * its dark-hero variant on /case-studies (wired in (site)/layout.tsx), and the
 * shared Footer is suppressed there so only the v3 FooterV3 (same component as
 * the homepage/About/Pricing/Services) renders. Bespoke styling is work-v3.css,
 * imported route-scoped here and scoped under .wkv3 via :where() so it can't
 * leak onto shared chrome.
 *
 * DATA: the HERO marquee tabs are the four curated flagships (Toku, Dimer, LIQID,
 * Eraser), screenshots resolved from Sanity by slug (getWorkImages) with CDN
 * fallbacks. Everything BELOW the hero — the archive grid + discipline filters —
 * is driven entirely by LIVE Sanity data via fetchCaseStudyIndexData(), which
 * already filters HIDDEN_CASE_STUDY_SLUGS. Every study still renders server-side in the
 * default "All" view, so crawlers / AI engines see the full gallery; the filter
 * toggles group visibility client-side.
 *
 * CLAIMS: the hero + proof chrome carry only sourced/safe stats (200+, Toku
 * 0 → 86%, Dimer 288%, 4+ yrs, ~2h). The old page's unsourced hero stats
 * (147% / 3.2x from work.json) are gone. Per-card stats come from Sanity exactly
 * as they render on the live gallery today (source of truth is Studio).
 *
 * SEO: metadata/canonical preserved from the previous gallery page; the
 * CollectionPage + ItemList and BreadcrumbList JSON-LD are ported and driven by
 * the resolved cards; one <h1> (the hero).
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../work-v3/work-v3.css';
import { fetchCaseStudyIndexData } from '@/lib/cms-data';
import { asset } from '@/lib/assets';
import { optimizeImage } from '@/lib/image-utils';
import type { CaseStudy, Client, Industry, Technology } from '@/lib/types';
import { getWorkImages } from '../../work-v3/data';
import { HeroWork } from '../../work-v3/HeroWork';
import { LogosMarquee } from '../../work-v3/LogosMarquee';
import { Archive, type ArchiveCard } from '../../work-v3/Archive';
import { Proof } from '../../work-v3/Proof';
import { Receipts } from '../../work-v3/Receipts';
import { CoverCTA } from '../../work-v3/CoverCTA';
import { FooterV3 } from '../../home-v3/FooterV3';
import { WorkV3Scripts } from '../../work-v3/Scripts';

const SITE = 'https://www.loudface.co';

// Display order: lead with current offering, web design & branding last.
const DISCIPLINE_ORDER = [
  'AI Search & Organic Growth',
  'Conversion Optimization',
  'Web Design & Branding',
];
const FALLBACK_DISCIPLINE = 'Web Design & Branding';

export const metadata: Metadata = {
  title: 'Our Work | Case Studies & Portfolio',
  description:
    "LoudFace case studies across AI search & organic growth, conversion optimization, and web design & branding — real results: AI citations, conversion lifts, and launches.",
  alternates: { canonical: '/case-studies' },
  openGraph: {
    title: 'Case Studies & Portfolio | LoudFace',
    description:
      "LoudFace case studies across AI search & organic growth, conversion optimization, and web design & branding.",
    type: 'website',
    url: '/case-studies',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Case Studies' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Case Studies & Portfolio | LoudFace',
    description:
      "LoudFace case studies across AI search & organic growth, conversion optimization, and web design & branding.",
    images: ['/opengraph-image'],
  },
};

const disciplineRank = (d: string) => {
  const i = DISCIPLINE_ORDER.indexOf(d);
  return i === -1 ? DISCIPLINE_ORDER.length : i;
};

/** Decorative fake-browser-bar label: prefer the real domain, else the client, else the slug. */
function barLabel(link: string | undefined, clientName: string | undefined, slug: string): string {
  if (link) {
    try {
      const u = new URL(link.startsWith('http') ? link : `https://${link}`);
      return u.hostname.replace(/^www\./, '');
    } catch {
      /* fall through */
    }
  }
  if (clientName) return clientName.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return slug;
}

export default async function WorkPage() {
  const [cmsData, images] = await Promise.all([fetchCaseStudyIndexData(), getWorkImages()]);

  const {
    caseStudies: rawCaseStudies,
    clients: clientsMap,
    industries: industriesMap,
    technologies: technologiesMap,
  } = cmsData;

  const caseStudies = rawCaseStudies as (CaseStudy & { id: string })[];

  const getClient = (id?: string): Client | undefined => (id ? clientsMap.get(id) : undefined);
  const getIndustry = (id?: string): Industry | undefined => (id ? industriesMap.get(id) : undefined);
  const getTechnologies = (techIds?: string[]): Technology[] =>
    !techIds || !Array.isArray(techIds)
      ? []
      : techIds.map((id) => technologiesMap.get(id)).filter((t): t is Technology => t !== undefined);

  // Resolve + order: by discipline (current offering first), then featured-first.
  const cards: ArchiveCard[] = caseStudies
    .filter((s) => s.slug)
    .map((study) => {
      const client = getClient(study.client);
      const industry = getIndustry(study.industry);
      const technologies = getTechnologies(study.technologies as string[] | undefined);
      // next/image now builds the srcset, so hand it the LARGEST crop rather than
      // caseStudyThumbnail().src (w=800). That 800 was only ever the fallback `src`;
      // the hand-rolled srcset it shipped alongside went up to w=1200, which is what
      // retina desktop actually loads today. Feeding next/image the 800 would cap
      // delivery at 800 and render BLURRIER than today on those screens — the
      // optimizer never upscales. Same 16:10 crop box, just the top rung of it.
      const thumbMax = optimizeImage(
        study['main-project-image-thumbnail']?.url,
        1200,
        80,
        'webp',
        750,
      );
      const disciplines =
        Array.isArray(study.disciplines) && study.disciplines.length
          ? study.disciplines
          : [FALLBACK_DISCIPLINE];
      const websiteLink = (study as { 'website-link'?: string })['website-link'];

      return {
        slug: study.slug,
        title: study['project-title'] || study.name,
        summary: study['paragraph-summary'],
        disciplines,
        thumbSrc: thumbMax || asset('/images/placeholder.webp'),
        thumbAlt: study['main-project-image-thumbnail']?.alt || study['project-title'] || study.name,
        industryName: industry?.name,
        technologies: technologies.map((t) => t.name),
        barLabel: barLabel(websiteLink, client?.name, study.slug),
        clientName: client?.name,
        result1Number: study['result-1---number'],
        result1Title: study['result-1---title'],
        result2Number: study['result-2---number'],
        result2Title: study['result-2---title'],
        featured: study.featured,
      } satisfies ArchiveCard;
    })
    .sort((a, b) => {
      const byDiscipline = disciplineRank(a.disciplines[0]) - disciplineRank(b.disciplines[0]);
      if (byDiscipline !== 0) return byDiscipline;
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });

  const total = cards.length;
  const namedClients = cards.filter((c) => c.clientName).length;

  // Structured data — every study, in display order.
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Case Studies',
    description: "LoudFace's portfolio across AI search, conversion, and web design & branding.",
    url: `${SITE}/case-studies`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: cards.map((card, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE}/case-studies/${card.slug}`,
        name: card.title,
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Case Studies' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* .wkv3 scopes the bespoke resets so they can't touch the shared Header/Footer/Cal chrome. */}
      <div className="wkv3">
        <HeroWork images={images} total={total} />
        <LogosMarquee />
        {total === 0 ? (
          <section className="arch" id="archive" aria-label="All case studies">
            <div className="container">
              <p className="arch-sub">No case studies found. Check back soon.</p>
            </div>
          </section>
        ) : (
          <Archive cards={cards} disciplineOrder={DISCIPLINE_ORDER} total={total} />
        )}
        <Proof />
        <Receipts total={total} namedClients={namedClients} />
        <CoverCTA images={images} />
        {/* Shared v3 footer — rendered inside .wkv3 so the re-scoped .ft footer CSS
            in work-v3.css applies with full isolation (home-v3.css is NOT imported here). */}
        <FooterV3 />
      </div>

      <WorkV3Scripts />
    </>
  );
}
