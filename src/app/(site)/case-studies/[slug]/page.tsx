/**
 * Case Study Detail Page — v3 design (componentized).
 *
 * Faithful port of the approved "before-after" detail concept, rebuilt as a
 * DYNAMIC template that renders all live studies from their Sanity fields.
 * Structure: electric hero (two-state OR single-state result object) → results
 * ledger → build story (article + sticky sidebar) → night charts act →
 * testimonial proof → key-insights FAQ → related marquee + cards → cover CTA →
 * FooterV3. Composed inside the (site) group so it inherits the shared Header
 * (dark-hero variant, wired in (site)/layout.tsx for /case-studies/*) + PostHog/
 * GTM/Cal chrome; the shared Footer is suppressed there so only FooterV3 renders.
 *
 * Bespoke styling is case-detail-v3.css, route-scoped here and isolated under
 * `.csv3` via :where() so it can't leak onto the shared chrome. Every section
 * binds to Sanity fields and degrades cleanly when a field is sparse (2nd/3rd
 * stat, charts, testimonial, tech pills, industry badge all optional).
 *
 * CLAIMS: every stat shown comes from the study's own Sanity result fields with
 * the client named — no invented numbers, no hardcoded per-study copy. The
 * two-state hero only appears when the lead result itself encodes a before→after
 * transition (e.g. "0 → 86%"); otherwise it degrades to a single-state card.
 *
 * SEO: generateMetadata truncates title ≤60 / description ≤160 via seo-utils;
 * BreadcrumbList + Article + FAQPage + Speakable + Review JSON-LD are all
 * preserved from the previous template; exactly one <h1> (the hero).
 */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../../../case-detail-v3/case-detail-v3.css';
import { fetchCollection, fetchHomepageData, fetchItemBySlug } from '@/lib/cms-data';
import { avatarImage, optimizeImage } from '@/lib/image-utils';
import {
  buildNoIndexMetadata,
  buildPageMetadata,
  truncateSeoTitle,
  truncateSeoDescription,
  rewriteLegacyUrls,
  resolveServiceSlug,
} from '@/lib/seo-utils';
import {
  extractFAQFromHTML,
  buildFAQSchema,
  buildSpeakableSchema,
  buildReviewSchema,
  buildImageObject,
  buildOrganizationPublisher,
} from '@/lib/schema-utils';
import { autoLinkServiceMentions } from '@/lib/html-utils';
import type {
  CaseStudy,
  Client,
  Testimonial,
  Industry,
  Technology,
  ServiceCategory,
} from '@/lib/types';
import { FooterV3 } from '../../../home-v3/FooterV3';
import { HeroDetail } from '../../../case-detail-v3/HeroDetail';
import { ResultsLedger } from '../../../case-detail-v3/ResultsLedger';
import { BuildStory, type Fact, type Pill } from '../../../case-detail-v3/BuildStory';
import { NightCharts } from '../../../case-detail-v3/NightCharts';
import { ProofQuote } from '../../../case-detail-v3/ProofQuote';
import { FaqDetail } from '../../../case-detail-v3/FaqDetail';
import { RelatedWork, type RelatedCard } from '../../../case-detail-v3/RelatedWork';
import { CoverCTADetail } from '../../../case-detail-v3/CoverCTADetail';
import { parseResultTransition, collectResults, stripTags, type ResultStat } from '../../../case-detail-v3/helpers';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await fetchCollection<Record<string, unknown>>('case-studies');
  return items
    .filter((item) => item.slug)
    .map((item) => ({
      slug: item.slug as string,
    }));
}

// Extract TOC from main-body HTML (H2 ids for anchor links). Structurally the
// same normalization the old template used, incl. stripping a redundant lead
// <figure> since the hero already carries the visual header.
function extractTocAndAddIds(html: string | undefined): { toc: { id: string; text: string }[]; html: string } {
  if (!html) return { toc: [], html: '' };

  // Downgrade any H1 tags in CMS content to H2 (page already has an H1)
  let normalized = html.replace(/<h1([^>]*)>(.*?)<\/h1>/gi, '<h2$1>$2</h2>');

  // Fix any HTTP links to our domain that should be HTTPS
  normalized = normalized.replace(/http:\/\/loudface\.co/g, 'https://www.loudface.co');

  // Rewrite legacy internal URLs to canonical paths (eliminates 308 redirect chains)
  normalized = rewriteLegacyUrls(normalized);

  // Replace curly/smart quotes with straight quotes in HTML attributes
  normalized = normalized.replace(/[“”]/g, '"');
  normalized = normalized.replace(/[‘’]/g, "'");

  // Escape <script> tags in CMS rich text so they display as code, not execute
  normalized = normalized.replace(/<script\b/gi, '&lt;script');
  normalized = normalized.replace(/<\/script>/gi, '&lt;/script&gt;');

  // Fix malformed URLs from CMS rich text: <https://example.com> → https://example.com
  normalized = normalized.replace(/src="<(https?:\/\/[^">]+)>"/g, 'src="$1"');
  normalized = normalized.replace(/href="<(https?:\/\/[^">]+)>"/g, 'href="$1"');

  // Add alt text to CMS images that have empty, missing, or Webflow placeholder alt attributes
  normalized = normalized.replace(
    /<img([^>]*?)alt="(__wf_reserved_inherit)?"([^>]*?)>/gi,
    '<img$1alt="Case study image"$3>',
  );
  normalized = normalized.replace(
    /<img(?![^>]*alt=)([^>]*?)>/gi,
    '<img alt="Case study image"$1>',
  );

  const toc: { id: string; text: string }[] = [];
  let index = 0;

  const processedHtml = normalized.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_match, attrs, content) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const id = `section-${index++}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    toc.push({ id, text });
    return `<h2${attrs} id="${id}">${content}</h2>`;
  });

  return { toc, html: processedHtml };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const study = await fetchItemBySlug<CaseStudy>('case-studies', slug);

  if (!study) {
    return buildNoIndexMetadata('Case Study Not Found');
  }

  const rawTitle = study['project-title'] || study.name;
  const title = truncateSeoTitle(rawTitle);
  const summary = study['paragraph-summary']?.replace(/\s+/g, ' ').trim();
  // Truncate CMS summary to SERP limits; if too short, extend with contextual suffix
  let description = truncateSeoDescription(summary);
  if (!description) {
    const base = summary
      ? `${summary} See how LoudFace helped ${study.name} achieve measurable results with our design and development approach.`
      : `See how LoudFace helped ${study.name} achieve measurable results. Full case study with approach, metrics, and outcomes.`;
    description = truncateSeoDescription(base) || base;
  }

  const imageUrl = study['main-project-image-thumbnail']?.url;

  return buildPageMetadata({
    title,
    description,
    canonicalPath: `/case-studies/${slug}`,
    type: 'article',
    imageUrl,
  });
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;

  const [cmsData, study] = await Promise.all([
    fetchHomepageData(),
    fetchItemBySlug<CaseStudy>('case-studies', slug),
  ]);

  const {
    caseStudies,
    clients: clientsMap,
    testimonials: testimonialsMap,
    allTestimonials,
    industries: industriesMap,
    technologies: technologiesMap,
    serviceCategories: serviceCategoriesMap,
  } = cmsData;

  if (!study) {
    notFound();
  }

  // ── Resolvers ──────────────────────────────────────────────
  const getClient = (id: string | undefined): Client | undefined => (id ? clientsMap.get(id) : undefined);
  const getIndustry = (id: string | undefined): Industry | undefined => (id ? industriesMap.get(id) : undefined);
  const getTechnologies = (ids: string[] | undefined): Technology[] =>
    !ids ? [] : ids.map((id) => technologiesMap.get(id)).filter((t): t is Technology => !!t);
  const getServices = (ids: string[] | undefined): ServiceCategory[] =>
    !ids ? [] : ids.map((id) => serviceCategoriesMap.get(id)).filter((s): s is ServiceCategory => !!s);
  const getTestimonial = (caseStudyId: string): Testimonial | undefined => {
    const indexed = testimonialsMap.get(caseStudyId);
    if (indexed) return indexed;
    if (study?.testimonial) return allTestimonials.find((t) => t.id === study.testimonial);
    return undefined;
  };

  // ── Resolved data ──────────────────────────────────────────
  const client = getClient(study.client);
  const industry = getIndustry(study.industry);
  const technologies = getTechnologies(study.technologies);
  const services = getServices(study['services-provided']);
  const testimonial = getTestimonial(study.id);

  const clientColor = study['client-color'] || 'var(--color-primary-500)';
  const projectTitle = study['project-title'] || study.name;

  // Hero object binding: two-state when the lead result encodes a transition.
  const results = collectResults(study);
  const transition = parseResultTransition(study['result-1---number']);
  const result1: ResultStat = { number: study['result-1---number'], title: study['result-1---title'] };
  const result2: ResultStat | undefined = study['result-2---number']
    ? { number: study['result-2---number'], title: study['result-2---title'] ?? '' }
    : undefined;

  const clientLogoUrl = client?.['light-logo']?.url ? optimizeImage(client['light-logo'].url, 120) : undefined;

  // Sidebar bindings — services link to real pages; tech pills link to the
  // gallery (the old ?tech= querystring was a dead link target, so drop it).
  const servicePills: Pill[] = services.map((s) => ({ name: s.name, href: `/services/${resolveServiceSlug(s.slug)}` }));
  const techPills: Pill[] = technologies.map((t) => ({ name: t.name, href: '/case-studies' }));
  const facts: Fact[] = [];
  if (client?.name) facts.push({ k: 'Client', v: client.name });
  if (industry?.name) facts.push({ k: 'Industry', v: industry.name });
  if (study.country) facts.push({ k: 'Country', v: study.country });
  if (study['company-size']) facts.push({ k: 'Team size', v: `${study['company-size']} employees` });

  // Article body → processed HTML + TOC ids, then auto-link first service mentions.
  const { toc, html: processedBody } = (() => {
    let body = study['main-body'] || '';
    body = body.replace(/^(\s*(?:<p[^>]*>.*?<\/p>\s*)?)<figure[^>]*>[\s\S]*?<\/figure>/, '$1');
    return extractTocAndAddIds(body);
  })();
  const linkedBody = autoLinkServiceMentions(processedBody);

  // Charts (night act) — only when present; growth curve stays axis-free.
  const charts = study.charts ?? [];
  const hasGrowthCurve = charts.some((c) => c.chartType === 'growthCurve');

  // Testimonial (proof) — only when a resolvable quote body exists.
  const testimonialQuote = testimonial?.['testimonial-body'];
  const avatarUrl = testimonial?.['profile-image']?.url ? avatarImage(testimonial['profile-image'].url) : undefined;

  // Related work — reuse the industry(+3)/service(+2) scoring util.
  const relatedStudies = (() => {
    const others = caseStudies.filter((s) => s.slug !== slug);
    if (others.length <= 3) return others.slice(0, 3);
    const studyIndustries = study.industries || (study.industry ? [study.industry] : []);
    const studyServices = study['services-provided'] || [];
    return others
      .map((s) => {
        let score = 0;
        const sIndustries = s.industries || (s.industry ? [s.industry] : []);
        const sServices = s['services-provided'] || [];
        for (const ind of sIndustries) if (studyIndustries.includes(ind)) score += 3;
        for (const svc of sServices) if (studyServices.includes(svc)) score += 2;
        return { study: s, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.study);
  })();

  const relatedCards: RelatedCard[] = relatedStudies.map((r) => {
    const rClient = getClient(r.client);
    const rIndustry = getIndustry(r.industry);
    return {
      slug: r.slug,
      title: r['project-title'] || r.name,
      clientName: rClient?.name,
      clientColor: r['client-color'] || 'var(--color-primary-500)',
      resultNumber: r['result-1---number'],
      resultTitle: r['result-1---title'],
      tag: rIndustry?.name || r.disciplines?.[0],
    };
  });

  const marqueeNames = Array.from(
    new Set(caseStudies.map((s) => getClient(s.client)?.name).filter(Boolean) as string[]),
  ).slice(0, 12);

  // ── Structured data (BreadcrumbList + Article + FAQPage + Speakable + Review) ──
  const canonicalUrl = `https://www.loudface.co/case-studies/${slug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Case Studies', item: 'https://www.loudface.co/case-studies' },
      { '@type': 'ListItem', position: 3, name: projectTitle },
    ],
  };

  const caseStudyImage = buildImageObject(study['main-project-image-thumbnail']?.url);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: projectTitle,
    url: canonicalUrl,
    description: study['paragraph-summary'] || `Case study: ${projectTitle}`,
    ...(caseStudyImage && { image: caseStudyImage }),
    ...(study._createdAt && { datePublished: study._createdAt }),
    ...(study._updatedAt && { dateModified: study._updatedAt }),
    author: { '@type': 'Organization', name: 'LoudFace', url: 'https://www.loudface.co' },
    publisher: buildOrganizationPublisher(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
  };

  // FAQ: prefer hand-written CMS FAQ, fall back to auto-extracted from H2 headings
  const faqItems = study.faq?.length ? study.faq : extractFAQFromHTML(study['main-body']);
  const faqSchema = buildFAQSchema(faqItems);
  const speakableSchema = buildSpeakableSchema(projectTitle, canonicalUrl);

  const reviewSchema = testimonialQuote
    ? buildReviewSchema(
        { name: testimonial!.name, role: testimonial!.role, quote: testimonialQuote },
        client?.name || study.name,
      )
    : null;

  return (
    <>
      {/* Structured Data — native script tags for SSR visibility to crawlers */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />
      {reviewSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      )}

      {/* .csv3 scopes the bespoke resets so they can't touch the shared Header/Footer/Cal chrome. */}
      <div className="csv3">
        <HeroDetail
          projectTitle={projectTitle}
          summary={study['paragraph-summary']}
          clientName={client?.name}
          clientLogoUrl={clientLogoUrl}
          industryName={industry?.name}
          country={study.country}
          transition={transition}
          result1={result1}
          result2={result2}
        />

        <ResultsLedger results={results} />

        <BuildStory bodyHtml={linkedBody} toc={toc} services={servicePills} technologies={techPills} facts={facts} />

        {charts.length > 0 && <NightCharts charts={charts} accentColor={clientColor} hasGrowthCurve={hasGrowthCurve} />}

        {testimonialQuote && (
          <ProofQuote quoteHtml={testimonialQuote} name={testimonial?.name} role={testimonial?.role} avatarUrl={avatarUrl} />
        )}

        {faqItems.length >= 2 && <FaqDetail items={faqItems} clientName={client?.name} />}

        <RelatedWork cards={relatedCards} marqueeNames={marqueeNames} />

        <CoverCTADetail clientName={client?.name} />

        <FooterV3 />
      </div>
    </>
  );
}
