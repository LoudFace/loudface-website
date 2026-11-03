/**
 * Utilities for llms.txt, llms-full.txt, and .md page variants.
 *
 * Converts HTML content to clean Markdown for AI model consumption.
 * Fetches CMS data to build dynamic site maps for LLM crawlers.
 */

import nextConfig from '../../next.config';
import { client } from './sanity.client';
import { BLOG_NOT_MOVED_TO_RESEARCH } from './blog-exclusion';
import { parseChartSpecText } from './research-spec';
import type { ChartSpec } from '../app/research-v11/contract';

const SITE_URL = 'https://www.loudface.co';

/**
 * One-line description of the agency, as stated TO AI ENGINES.
 *
 * Stated once because it was previously written out twice, and both copies still described the
 * pre-May-2026 positioning: "web design agency … Webflow Enterprise Partners". LoudFace
 * repositioned to a stack-agnostic B2B SaaS organic growth agency on 2026-05-20 and
 * down-positioned Webflow to a delivery capability. This is the single file whose entire job is
 * telling a model what LoudFace is, so a stale sentence here is not cosmetic — it is the answer.
 */
const AGENCY_SUMMARY =
  'LoudFace is a B2B SaaS organic growth agency. We make brands discoverable across both Google and AI search — SEO, answer engine optimization (AEO), and content run as one compounding system, measured as share of answer across ChatGPT, Claude, Perplexity and Google AI Overviews. Stack-agnostic: we build on Next.js, Sanity and Webflow. Based in Dubai, 200+ projects delivered.';

/**
 * Paths that 301/308 elsewhere, from next.config.ts — the same single source of truth
 * sitemap (src/lib/sitemap-entries.ts) filters against.
 *
 * llms.txt previously listed every published Sanity doc, including 19 folded posts that
 * redirect away (measured 2026-08-25). Every one of those is a wasted fetch for a crawler and a
 * dead citation target for a model — the exact failure the sitemap already guards against, on
 * the file that exists purely for machines.
 */
async function redirectedPaths(): Promise<Set<string>> {
  try {
    const rules = (await nextConfig.redirects?.()) ?? [];
    return new Set(rules.map((rule) => rule.source));
  } catch (err) {
    // A broken redirects() must not take the whole index down; listing a redirect is a
    // degradation, serving nothing is an outage. Log loudly and fall through unfiltered.
    console.error('[llms] could not read redirects, serving unfiltered:', err);
    return new Set();
  }
}

/** Drop any page whose path is a known redirect source. */
function withoutRedirects<T extends { url: string }>(pages: T[], redirects: Set<string>): T[] {
  return pages.filter((p) => !redirects.has(p.url.replace(SITE_URL, '')));
}

/* ── HTML → Markdown ──────────────────────────────────────────── */

/**
 * Convert CMS HTML content to clean Markdown.
 * Handles headings, paragraphs, links, lists, tables, bold, italic, blockquotes.
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let md = html;

  // Normalize whitespace between tags
  md = md.replace(/>\s+</g, '>\n<');

  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const text = content.replace(/<\/?p[^>]*>/gi, '').trim();
    return '\n> ' + text.split('\n').join('\n> ') + '\n';
  });

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[][] = [];
    const rowMatches = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    for (const row of rowMatches) {
      const cells = (row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || []).map(
        (cell: string) => cell.replace(/<\/?t[hd][^>]*>/gi, '').replace(/<[^>]+>/g, '').trim()
      );
      rows.push(cells);
    }
    if (rows.length === 0) return '';

    const colCount = Math.max(...rows.map(r => r.length));
    const lines: string[] = [];
    rows.forEach((row, i) => {
      const padded = Array.from({ length: colCount }, (_, j) => row[j] || '');
      lines.push('| ' + padded.join(' | ') + ' |');
      if (i === 0) {
        lines.push('| ' + padded.map(() => '---').join(' | ') + ' |');
      }
    });
    return '\n' + lines.join('\n') + '\n';
  });

  // Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    return '\n' + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n') + '\n';
  });
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let i = 0;
    return '\n' + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m: string, text: string) => `${++i}. ${text}\n`) + '\n';
  });

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Bold / italic / emphasis
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Paragraphs and line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&mdash;/g, '—');
  md = md.replace(/&ndash;/g, '–');
  md = md.replace(/&hellip;/g, '…');
  md = md.replace(/&copy;/g, '©');
  md = md.replace(/&reg;/g, '®');
  md = md.replace(/&trade;/g, '™');
  md = md.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

  // Clean up excessive newlines
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

/**
 * Truncate text at a sentence boundary within maxLen characters.
 * Falls back to word boundary if no sentence break is found.
 */
function truncateAtSentence(text: string, maxLen = 200): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;

  // Try to cut at a sentence boundary (. ! ?)
  const chunk = clean.slice(0, maxLen);
  const lastSentence = Math.max(
    chunk.lastIndexOf('. '),
    chunk.lastIndexOf('! '),
    chunk.lastIndexOf('? '),
    chunk.lastIndexOf('.\n'),
    chunk.lastIndexOf('!\n'),
    chunk.lastIndexOf('?\n'),
  );
  if (lastSentence > maxLen * 0.4) {
    return clean.slice(0, lastSentence + 1);
  }

  // Fall back to word boundary
  const lastSpace = chunk.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.4) {
    return clean.slice(0, lastSpace) + '…';
  }

  return chunk + '…';
}

/* ── CMS Data for llms.txt ────────────────────────────────────── */

interface LlmsPage {
  title: string;
  url: string;
  description: string;
  content?: string; // full markdown content (for llms-full.txt)
}

interface LlmsData {
  services: LlmsPage[];
  caseStudies: LlmsPage[];
  blogPosts: LlmsPage[];
  research: LlmsPage[];
  seoPages: LlmsPage[];
}

/** A research paper as the llms readers fetch it. */
interface ResearchMarkdownSource {
  slug: string;
  name: string;
  paperTitle?: string;
  headlineFinding?: string;
  sampleSummary?: string;
  dataWindow?: string;
  engines?: string[];
  keyTakeaways?: string[];
  content?: string;
  methodology?: string;
  limitations?: string;
  appendix?: string;
  figures?: Array<{ title?: string; source?: string; note?: string; spec?: string }>;
}

const RESEARCH_MARKDOWN_FIELDS = `"slug": slug.current, name, paperTitle, headlineFinding, sampleSummary, dataWindow, engines,
      keyTakeaways, content, methodology, limitations, appendix, figures[]{ title, source, note, spec }`;

/**
 * Fetch all CMS content needed for llms.txt generation.
 * Returns structured page data with titles, URLs, descriptions, and optional full content.
 */
export async function fetchLlmsData(includeContent = false): Promise<LlmsData> {
  const [caseStudies, blogPosts, research, seoPages] = await Promise.all([
    client.fetch<Array<{
      slug: string;
      name: string;
      projectTitle: string;
      paragraphSummary: string;
      mainBody: string;
    }>>(`*[_type == "caseStudy" && defined(slug.current) && defined(paragraphSummary)] | order(_createdAt desc) {
      "slug": slug.current,
      name,
      "projectTitle": projectTitle,
      "paragraphSummary": paragraphSummary,
      ${includeContent ? '"mainBody": mainBody,' : ''}
    }`),
    client.fetch<Array<{
      slug: string;
      name: string;
      excerpt: string;
      content: string;
      directAnswer?: string;
      publishedDate: string;
    }>>(`*[_type == "blogPost" && defined(slug.current) && ${BLOG_NOT_MOVED_TO_RESEARCH}] | order(publishedDate desc) {
      "slug": slug.current,
      name,
      excerpt,
      ${includeContent ? 'content, directAnswer,' : ''}
      publishedDate
    }`),
    client.fetch<Array<ResearchMarkdownSource & { excerpt?: string }>>(
      `*[_type == "research" && defined(slug.current)] | order(publishedDate desc) {
      ${includeContent ? RESEARCH_MARKDOWN_FIELDS : '"slug": slug.current, name, headlineFinding'},
      excerpt
    }`),
    client.fetch<Array<{
      slug: string;
      name: string;
      heroDescription: string;
    }>>(`*[_type == "seoPage" && defined(slug.current)] | order(displayOrder asc) {
      "slug": slug.current,
      name,
      "heroDescription": heroDescription
    }`),
  ]);

  const redirects = await redirectedPaths();

  return {
    // Ordered by the service hierarchy set on 2026-05-20, not alphabetically or by legacy. A model
    // reading this list top-down infers what the agency leads with, so SEO/AEO leads and Webflow
    // sits where it belongs — a delivery capability, offered but no longer the identity.
    services: [
      { title: 'SEO & AEO', url: `${SITE_URL}/services/seo-aeo`, description: 'Search engine optimization and answer engine optimization. Dual-track growth for Google and AI search. The flagship service.' },
      { title: 'Organic Growth', url: `${SITE_URL}/services/organic-growth`, description: 'SEO, AEO, content and CRO run as one compounding system for B2B SaaS.' },
      { title: 'Generative Engine Optimization (GEO)', url: `${SITE_URL}/services/geo-agency`, description: 'AI-native generative engine optimization agency for B2B SaaS. Get cited in ChatGPT, Perplexity, and Google AI Overviews, measured as share of answer.' },
      { title: 'Google AI Overviews Optimization', url: `${SITE_URL}/services/ai-overviews`, description: 'Google AI Overviews optimization for B2B SaaS. Retrieval and extraction work on Google\u2019s own surface, reported per prompt every week.' },
      { title: 'Copywriting', url: `${SITE_URL}/services/copywriting`, description: 'B2B SaaS website copy that converts. Messaging frameworks, page copy, and content strategy.' },
      { title: 'Conversion Rate Optimization', url: `${SITE_URL}/services/cro`, description: 'Data-driven CRO using A/B testing, heatmaps, and funnel analysis to increase conversion rates.' },
      { title: 'UX/UI Design', url: `${SITE_URL}/services/ux-ui-design`, description: 'Conversion-focused design for B2B SaaS websites. Research-driven layouts and interaction design.' },
      { title: 'Webflow Development', url: `${SITE_URL}/services/webflow`, description: 'Enterprise Webflow development for B2B SaaS companies. Custom builds, migrations, and CMS architecture. One of several stacks we deliver on.' },
      { title: 'Growth Autopilot', url: `${SITE_URL}/services/growth-autopilot`, description: 'Ongoing retainer combining SEO, AEO, CRO and content to drive sustainable organic growth.' },
    ],
    caseStudies: withoutRedirects((caseStudies || []).map(cs => ({
      title: cs.projectTitle || cs.name,
      url: `${SITE_URL}/case-studies/${cs.slug}`,
      description: truncateAtSentence(cs.paragraphSummary) || `Case study: ${cs.name}`,
      ...(includeContent && cs.mainBody ? { content: htmlToMarkdown(cs.mainBody) } : {}),
    })), redirects),
    blogPosts: withoutRedirects((blogPosts || []).map(bp => ({
      title: bp.name,
      url: `${SITE_URL}/blog/${bp.slug}`,
      description: truncateAtSentence(bp.excerpt) || `${bp.name}.`,
      ...(includeContent && bp.content ? { content: blogPostMarkdown(bp.directAnswer, bp.content) } : {}),
    })), redirects),
    research: withoutRedirects((research || []).map(paper => ({
      title: paper.name,
      url: `${SITE_URL}/research/${paper.slug}`,
      description: truncateAtSentence(paper.headlineFinding || paper.excerpt || '') || `${paper.name}.`,
      ...(includeContent ? { content: researchMarkdownBody(paper) } : {}),
    })), redirects),
    seoPages: withoutRedirects((seoPages || []).map(sp => ({
      title: sp.name,
      url: `${SITE_URL}/seo-for/${sp.slug}`,
      description: truncateAtSentence(sp.heroDescription) || sp.name,
    })), redirects),
  };
}

/* ── Generators ───────────────────────────────────────────────── */

function renderPageList(pages: LlmsPage[]): string {
  return pages.map(p => `- [${p.title}](${p.url}): ${p.description}`).join('\n');
}

/**
 * Generate llms.txt content — table of contents for AI models.
 */
export async function generateLlmsTxt(): Promise<string> {
  const data = await fetchLlmsData(false);

  const sections: string[] = [
    `# LoudFace`,
    '',
    `> ${AGENCY_SUMMARY}`,
    '',
    `## About`,
    '',
    `- [Homepage](${SITE_URL}): Agency overview, services, case studies, and client logos.`,
    `- [About Us](${SITE_URL}/about): Team, founding story, values, and credentials.`,
    `- [Pricing](${SITE_URL}/pricing): Retainer plans, service tracks, and engagement models.`,
    `- [Methodology](${SITE_URL}/methodology): The Answer Chain, the eight-stage GEO method LoudFace runs, measured against revenue.`,
    `- [Recognition](${SITE_URL}/recognition): Outside agency lists and rankings that name LoudFace, where each places us, the publishers' verdicts, and how often AI engines name us.`,
    `- [Case Studies](${SITE_URL}/case-studies): Full portfolio of client work with measurable results.`,
    `- [Blog](${SITE_URL}/blog): SEO, AEO, GEO, and organic growth strategy articles.`,
    `- [Research](${SITE_URL}/research): LoudFace's original research papers on AI search and B2B SaaS marketing, each with its sample, method, limitations and figures.`,
    `- [AI Instructions](${SITE_URL}/ai-instructions): Canonical, machine-readable fact sheet — what LoudFace does, who it fits, proof numbers, and FAQs. Start here.`,
    '',
    `## Services`,
    '',
    renderPageList(data.services),
    '',
  ];

  if (data.seoPages.length > 0) {
    sections.push(`## Industry Pages`, '', renderPageList(data.seoPages), '');
  }

  if (data.caseStudies.length > 0) {
    sections.push(`## Case Studies`, '', renderPageList(data.caseStudies), '');
  }

  if (data.research.length > 0) {
    sections.push(`## Research`, '', renderPageList(data.research), '');
  }

  if (data.blogPosts.length > 0) {
    sections.push(`## Blog Posts`, '', renderPageList(data.blogPosts), '');
  }

  return sections.join('\n');
}

/**
 * Generate llms-full.txt — full site content for AI models.
 */
export async function generateLlmsFullTxt(): Promise<string> {
  const data = await fetchLlmsData(true);

  const sections: string[] = [
    `# LoudFace`,
    '',
    `> ${AGENCY_SUMMARY}`,
    '',
    `## About`,
    '',
    `- [Homepage](${SITE_URL}): Agency overview, services, case studies, and client logos.`,
    `- [About Us](${SITE_URL}/about): Team, founding story, values, and credentials.`,
    `- [Pricing](${SITE_URL}/pricing): Retainer plans, service tracks, and engagement models.`,
    `- [Methodology](${SITE_URL}/methodology): The Answer Chain, the eight-stage GEO method LoudFace runs, measured against revenue.`,
    `- [Recognition](${SITE_URL}/recognition): Outside agency lists and rankings that name LoudFace, where each places us, the publishers' verdicts, and how often AI engines name us.`,
    `- [Research](${SITE_URL}/research): LoudFace's original research papers on AI search and B2B SaaS marketing, each with its sample, method, limitations and figures.`,
    '',
    `## Services`,
    '',
    renderPageList(data.services),
    '',
    `## Case Studies`,
    '',
    renderPageList(data.caseStudies),
    '',
    `## Research`,
    '',
    renderPageList(data.research),
    '',
    `## Blog Posts`,
    '',
    renderPageList(data.blogPosts),
  ];

  // Append full content for case studies
  for (const cs of data.caseStudies) {
    if (cs.content) {
      sections.push('', '---', '', `# ${cs.title}`, '', `URL: ${cs.url}`, '', cs.content);
    }
  }

  // Append full content for research papers
  for (const paper of data.research) {
    if (paper.content) {
      sections.push('', '---', '', `# ${paper.title}`, '', `URL: ${paper.url}`, '', paper.content);
    }
  }

  // Append full content for blog posts
  for (const bp of data.blogPosts) {
    if (bp.content) {
      sections.push('', '---', '', `# ${bp.title}`, '', `URL: ${bp.url}`, '', bp.content);
    }
  }

  return sections.join('\n');
}

/**
 * Generate Markdown for a specific page path.
 * Returns null if the path doesn't match a known page.
 */
export async function generatePageMarkdown(path: string): Promise<string | null> {
  // Case study
  const csMatch = path.match(/^\/case-studies\/([^/]+)$/);
  if (csMatch) {
    const slug = csMatch[1];
    const [study] = await client.fetch<Array<{
      name: string;
      projectTitle: string;
      paragraphSummary: string;
      mainBody: string;
    }>>(`*[_type == "caseStudy" && slug.current == $slug] {
      name, "projectTitle": projectTitle, "paragraphSummary": paragraphSummary, mainBody
    }`, { slug });

    if (!study) return null;
    const title = study.projectTitle || study.name;
    return [
      `# ${title}`,
      '',
      study.paragraphSummary || '',
      '',
      htmlToMarkdown(study.mainBody || ''),
    ].join('\n');
  }

  // Blog post
  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    const [post] = await client.fetch<Array<{
      name: string;
      excerpt: string;
      content: string;
      directAnswer?: string;
    }>>(`*[_type == "blogPost" && slug.current == $slug && ${BLOG_NOT_MOVED_TO_RESEARCH}] {
      name, excerpt, content, directAnswer
    }`, { slug });

    if (!post) return null;
    return [
      `# ${post.name}`,
      '',
      post.excerpt || '',
      '',
      blogPostMarkdown(post.directAnswer, post.content || ''),
    ].join('\n');
  }

  // Research paper
  const researchMatch = path.match(/^\/research\/([^/]+)$/);
  if (researchMatch) {
    const slug = researchMatch[1];
    const [paper] = await client.fetch<ResearchMarkdownSource[]>(
      `*[_type == "research" && slug.current == $slug] { ${RESEARCH_MARKDOWN_FIELDS} }`,
      { slug },
    );
    if (!paper) return null;
    return [`# ${paper.name}`, '', researchMarkdownBody(paper)].join('\n');
  }

  return null;
}

/**
 * A research paper as Markdown: the finding, the sample, the takeaways, the body, every figure as a table of its
 * numbers, then the method and the limitations. Used by /research/<slug>.md and llms-full.txt. A figure whose spec
 * does not parse throws (naming the paper and figure), the same as the HTML page, so the Markdown route answers 503
 * instead of caching a paper without its numbers.
 */
function researchMarkdownBody(paper: ResearchMarkdownSource): string {
  const out: string[] = [];
  if (paper.paperTitle && paper.paperTitle !== paper.name) out.push(`*${paper.paperTitle}*`, '');
  if (paper.headlineFinding) out.push(`**The finding:** ${paper.headlineFinding.trim()}`, '');
  const facts = [
    paper.sampleSummary ? `- Sample: ${paper.sampleSummary}` : null,
    paper.dataWindow ? `- Data window: ${paper.dataWindow}` : null,
    paper.engines?.length ? `- Engines: ${paper.engines.join(', ')}` : null,
  ].filter((line): line is string => line !== null);
  if (facts.length) out.push(...facts, '');
  if (paper.keyTakeaways?.length) out.push('## Key takeaways', '', ...paper.keyTakeaways.map((t) => `- ${t}`), '');
  if (paper.content) out.push(htmlToMarkdown(paper.content), '');
  const figures = (paper.figures || []).filter((figure) => figure.spec);
  if (figures.length) {
    out.push('## Figures', '');
    figures.forEach((figure, i) => {
      const spec = parseChartSpecText(figure.spec, `Research paper "${paper.slug}", figure "${figure.title || i + 1}"`);
      out.push(`### Figure ${i + 1}: ${figure.title || ''}`.trim(), '', chartSpecMarkdown(spec), '');
      if (figure.source) out.push(figure.source, '');
      if (figure.note) out.push(figure.note, '');
    });
  }
  if (paper.methodology) out.push('## Method', '', htmlToMarkdown(paper.methodology), '');
  if (paper.limitations) out.push('## Limitations', '', htmlToMarkdown(paper.limitations), '');
  if (paper.appendix) out.push('## Appendix', '', htmlToMarkdown(paper.appendix), '');
  return out.join('\n').trim();
}

/** A chart's numbers as a Markdown table, the text twin of the accessible table the page draws under each figure. */
function chartSpecMarkdown(spec: ChartSpec): string {
  const pct = (unit: string | undefined) => (v: string | number) => (typeof v === 'number' && unit === '%' ? `${v}%` : String(v));
  const table = (head: string[], rows: (string | number)[][]) =>
    [head, head.map(() => '---'), ...rows.map((r) => r.map(String))].map((r) => `| ${r.join(' | ')} |`).join('\n');
  switch (spec.type) {
    case 'bars': {
      const f = pct(spec.unit);
      const notes = spec.rows.some((r) => r[2]);
      return table(notes ? ['', 'Value', 'Count'] : ['', 'Value'], spec.rows.map((r) => (notes ? [r[0], f(r[1]), r[2] ?? ''] : [r[0], f(r[1])])));
    }
    case 'columns': {
      const f = pct(spec.unit);
      return table(['', 'Value'], spec.rows.map((r) => [r[0], f(r[1])]));
    }
    case 'funnel':
      return table(['Step', 'Count'], spec.rows.map((r) => [r[0], r[1]]));
    case 'split':
      return table(['', 'Share'], [[spec.a[0], `${spec.a[1]}%`], [spec.b[0], `${spec.b[1]}%`]]);
    case 'matrix':
      return table(['', ...spec.cols], spec.rows.map((r) => [r[0], ...r[1]]));
    case 'list':
      return table(['', ''], spec.rows.map((r) => [r[0], r[1]]));
    case 'dots':
      return table(['', ...spec.cols], spec.rows.map((r) => [r[0], ...r[1]]));
    case 'table': {
      const f = pct(spec.unit);
      return table(spec.cols, spec.rows.map((r) => r.map((cell, i) => (i === spec.bar ? f(cell) : cell))));
    }
    case 'multiples': {
      const f = pct(spec.unit);
      return table(['', ...spec.keys], spec.groups.map((g) => [g[0], ...g[1].map(f)]));
    }
    case 'slope':
      return table(['', spec.from, spec.to], spec.rows.map((r) => [r[0], r[1], r[2]]));
  }
}

/**
 * A blog post's Markdown body, opening with its short answer as the HTML page does (2026-10-09). The answer is a
 * separate Sanity field, so until then both Markdown copies (/blog/<slug>.md and llms-full.txt) left it out.
 */
function blogPostMarkdown(directAnswer: string | undefined, contentHtml: string): string {
  const answer = directAnswer?.trim();
  const body = htmlToMarkdown(contentHtml);
  return answer ? `**The short answer:** ${answer}\n\n${body}` : body;
}
