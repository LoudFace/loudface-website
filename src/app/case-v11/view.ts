import 'server-only';
import { fetchCaseStudyDetailData, fetchItemBySlug } from '@/lib/cms-data';
import { avatarImage, optimizeImage } from '@/lib/image-utils';
import { rewriteLegacyUrls, resolveServiceSlug } from '@/lib/seo-utils';
import { extractFAQFromHTML } from '@/lib/schema-utils';
import { autoLinkServiceMentions, buildHeadingWithId } from '@/lib/html-utils';
import type { CaseStudy, Client, Testimonial, Industry, Technology, ServiceCategory } from '@/lib/types';
import { parseResultTransition, collectResults, type ResultStat } from '../case-detail-v3/helpers';
import type { RelatedCard } from '../case-detail-v3/RelatedWork';

/**
 * The case study's data, prepared exactly as the live /case-studies/[slug] page prepares it (same resolvers,
 * same body normalisation, same related-work scoring), for the v11 template. Copied, not shared, until v11
 * replaces the live page; then the live page imports this and its own copy goes.
 */

type Fact = { k: string; v: string };
type Pill = { name: string; href: string };

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
    // buildHeadingWithId strips the id the CMS export already carries. Appending
    // ours without that emitted `<h2 id="" id="section-0-x">`; the parser keeps the
    // FIRST id, so every TOC anchor on this page silently resolved to nothing.
    return buildHeadingWithId('h2', attrs, id, content);
  });

  return { toc, html: processedHtml };
}

export async function getCaseView(slug: string) {
  const [cmsData, study] = await Promise.all([fetchCaseStudyDetailData(), fetchItemBySlug<CaseStudy>('case-studies', slug)]);
  const {
    caseStudies,
    clients: clientsMap,
    testimonials: testimonialsMap,
    allTestimonials,
    industries: industriesMap,
    technologies: technologiesMap,
    serviceCategories: serviceCategoriesMap,
  } = cmsData;
  if (!study) return null;

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

  // Charts — when present they fuse with the results ledger directly after the
  // hero (2026-08-19 redesign); the growth curve stays axis-free.
  const charts = study.charts ?? [];

  // InstrumentsBoard — the generalised TradeMomentum chart board. It replaces
  // ResultsInstruments/ResultsLedger only once a study has enough of it filled
  // in to look intentional rather than sparse: at least two of the four
  // chartable fields. One field alone (say, only a topic-climb chart) still
  // falls through to the plain results band below.
  const instruments = study.instruments;
  const instrumentsFieldCount = instruments
    ? [instruments.topicClimb, instruments.rankOverTime, instruments.engineBeforeAfter, instruments.indexedTrend]
        .filter(Boolean).length
    : 0;
  const showInstrumentsBoard = instrumentsFieldCount >= 2;

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

  const faqItems = study.faq?.length ? study.faq : extractFAQFromHTML(study['main-body']);
  const heroImage = study['main-project-image-thumbnail']?.url;
  const relatedImages = Object.fromEntries(relatedStudies.map((r) => [r.slug, r['main-project-image-thumbnail']?.url]));

  return {
    study, client, industry, projectTitle, clientColor, results, transition, result1, result2, clientLogoUrl,
    servicePills, techPills, facts, toc, linkedBody, instruments, testimonial, testimonialQuote, avatarUrl,
    relatedCards, relatedImages, faqItems, heroImage, charts, showInstrumentsBoard,
  };
}

export type CaseView = NonNullable<Awaited<ReturnType<typeof getCaseView>>>;
export type { Fact, Pill, ResultStat };
