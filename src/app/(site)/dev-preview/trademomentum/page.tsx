/**
 * TradeMomentum case-study PREVIEW — the real page, real Sanity content.
 *
 * This is a static, single-slug mirror of `case-studies/[slug]/page.tsx` for
 * "trademomentum-niche-aeo-organic-growth" only. It exists so the new
 * `TradeMomentumInstruments` board can be judged inside the actual rendered
 * page (real hero, real body, real FAQ, real related work) instead of a mock.
 *
 * ONE substitution vs. the production template: the results band always
 * renders `<TradeMomentumInstruments />` (the board under design) instead of
 * `ResultsInstruments`/`ResultsLedger`. Everything else — data assembly,
 * section order, structured data — is copied as closely as possible from the
 * production file so this reads as the real page, not a stand-in.
 *
 * Not indexed. Production (`case-studies/[slug]/page.tsx`) is untouched.
 */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../../../case-detail-v3/case-detail-v3.css';
import './instruments.css';
import { fetchCaseStudyDetailData, fetchItemBySlug } from '@/lib/cms-data';
import { avatarImage, optimizeImage } from '@/lib/image-utils';
import { rewriteLegacyUrls, resolveServiceSlug } from '@/lib/seo-utils';
import { extractFAQFromHTML, buildFAQSchema, buildSpeakableSchema, buildReviewSchema, buildImageObject, buildOrganizationPublisher } from '@/lib/schema-utils';
import { autoLinkServiceMentions, buildHeadingWithId } from '@/lib/html-utils';
import type { CaseStudy, Client, Testimonial, Industry, Technology, ServiceCategory } from '@/lib/types';
import { FooterV3 } from '../../../home-v3/FooterV3';
import { HeroDetail } from '../../../case-detail-v3/HeroDetail';
import { BuildStory, type Fact, type Pill } from '../../../case-detail-v3/BuildStory';
import { ProofQuote } from '../../../case-detail-v3/ProofQuote';
import { FaqDetail } from '../../../case-detail-v3/FaqDetail';
import { RelatedWork, type RelatedCard } from '../../../case-detail-v3/RelatedWork';
import { CoverCTADetail } from '../../../case-detail-v3/CoverCTADetail';
import { parseResultTransition, type ResultStat } from '../../../case-detail-v3/helpers';
import { TradeMomentumInstruments } from './TradeMomentumInstruments';

const SLUG = 'trademomentum-niche-aeo-organic-growth';

export const metadata: Metadata = {
  title: 'TradeMomentum preview (instruments board) — not for indexing',
  robots: { index: false, follow: false },
};

// Extract TOC from main-body HTML (H2 ids for anchor links). Copied verbatim
// from the production template so the article body renders identically.
function extractTocAndAddIds(html: string | undefined): { toc: { id: string; text: string }[]; html: string } {
  if (!html) return { toc: [], html: '' };

  let normalized = html.replace(/<h1([^>]*)>(.*?)<\/h1>/gi, '<h2$1>$2</h2>');
  normalized = normalized.replace(/http:\/\/loudface\.co/g, 'https://www.loudface.co');
  normalized = rewriteLegacyUrls(normalized);
  normalized = normalized.replace(/[“”]/g, '"');
  normalized = normalized.replace(/[‘’]/g, "'");
  normalized = normalized.replace(/<script\b/gi, '&lt;script');
  normalized = normalized.replace(/<\/script>/gi, '&lt;/script&gt;');
  normalized = normalized.replace(/src="<(https?:\/\/[^">]+)>"/g, 'src="$1"');
  normalized = normalized.replace(/href="<(https?:\/\/[^">]+)>"/g, 'href="$1"');
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
    return buildHeadingWithId('h2', attrs, id, content);
  });

  return { toc, html: processedHtml };
}

export default async function TradeMomentumPreviewPage() {
  const [cmsData, study] = await Promise.all([
    fetchCaseStudyDetailData(),
    fetchItemBySlug<CaseStudy>('case-studies', SLUG),
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

  const projectTitle = study['project-title'] || study.name;

  const transition = parseResultTransition(study['result-1---number']);
  const result1: ResultStat = { number: study['result-1---number'], title: study['result-1---title'] };
  const result2: ResultStat | undefined = study['result-2---number']
    ? { number: study['result-2---number'], title: study['result-2---title'] ?? '' }
    : undefined;

  const clientLogoUrl = client?.['light-logo']?.url ? optimizeImage(client['light-logo'].url, 120) : undefined;

  const servicePills: Pill[] = services.map((s) => ({ name: s.name, href: `/services/${resolveServiceSlug(s.slug)}` }));
  const techPills: Pill[] = technologies.map((t) => ({ name: t.name, href: '/case-studies' }));
  const facts: Fact[] = [];
  if (client?.name) facts.push({ k: 'Client', v: client.name });
  if (industry?.name) facts.push({ k: 'Industry', v: industry.name });
  if (study.country) facts.push({ k: 'Country', v: study.country });
  if (study['company-size']) facts.push({ k: 'Team size', v: `${study['company-size']} employees` });

  const { toc, html: processedBody } = (() => {
    let body = study['main-body'] || '';
    body = body.replace(/^(\s*(?:<p[^>]*>.*?<\/p>\s*)?)<figure[^>]*>[\s\S]*?<\/figure>/, '$1');
    return extractTocAndAddIds(body);
  })();
  const linkedBody = autoLinkServiceMentions(processedBody);

  const testimonialQuote = testimonial?.['testimonial-body'];
  const avatarUrl = testimonial?.['profile-image']?.url ? avatarImage(testimonial['profile-image'].url) : undefined;

  const relatedStudies = (() => {
    const others = caseStudies.filter((s) => s.slug !== SLUG);
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

  // ── Structured data (kept for parity; harmless since robots is noindex) ──
  const canonicalUrl = `https://www.loudface.co/case-studies/${SLUG}`;

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
      {/* Structured Data — kept for parity with production; page is noindex regardless. */}
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

        {/* THE ONE SUBSTITUTION: the board under design, instead of
            ResultsInstruments/ResultsLedger. */}
        <TradeMomentumInstruments />

        <BuildStory bodyHtml={linkedBody} toc={toc} services={servicePills} technologies={techPills} facts={facts} />

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
