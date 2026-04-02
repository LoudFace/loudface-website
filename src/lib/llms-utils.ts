/**
 * Utilities for llms.txt, llms-full.txt, and .md page variants.
 *
 * Converts HTML content to clean Markdown for AI model consumption.
 * Fetches CMS data to build dynamic site maps for LLM crawlers.
 */

import { client } from './sanity.client';

const SITE_URL = 'https://www.loudface.co';

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
    return '\n' + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1') + '\n';
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
  seoPages: LlmsPage[];
}

/**
 * Fetch all CMS content needed for llms.txt generation.
 * Returns structured page data with titles, URLs, descriptions, and optional full content.
 */
export async function fetchLlmsData(includeContent = false): Promise<LlmsData> {
  const [caseStudies, blogPosts, seoPages] = await Promise.all([
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
      publishedDate: string;
    }>>(`*[_type == "blogPost" && defined(slug.current)] | order(publishedDate desc) {
      "slug": slug.current,
      name,
      excerpt,
      ${includeContent ? 'content,' : ''}
      publishedDate
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

  return {
    services: [
      { title: 'Webflow Development', url: `${SITE_URL}/services/webflow`, description: 'Enterprise Webflow development for B2B SaaS companies. Custom builds, migrations, and CMS architecture.' },
      { title: 'SEO & AEO', url: `${SITE_URL}/services/seo-aeo`, description: 'Search engine optimization and answer engine optimization. Dual-track growth for Google and AI search.' },
      { title: 'UX/UI Design', url: `${SITE_URL}/services/ux-ui-design`, description: 'Conversion-focused design for B2B SaaS websites. Research-driven layouts and interaction design.' },
      { title: 'Copywriting', url: `${SITE_URL}/services/copywriting`, description: 'B2B SaaS website copy that converts. Messaging frameworks, page copy, and content strategy.' },
      { title: 'Conversion Rate Optimization', url: `${SITE_URL}/services/cro`, description: 'Data-driven CRO using A/B testing, heatmaps, and funnel analysis to increase conversion rates.' },
      { title: 'Growth Autopilot', url: `${SITE_URL}/services/growth-autopilot`, description: 'Ongoing retainer combining SEO, CRO, and content to drive sustainable organic growth.' },
    ],
    caseStudies: (caseStudies || []).map(cs => ({
      title: cs.projectTitle || cs.name,
      url: `${SITE_URL}/case-studies/${cs.slug}`,
      description: truncateAtSentence(cs.paragraphSummary) || `Case study: ${cs.name}`,
      ...(includeContent && cs.mainBody ? { content: htmlToMarkdown(cs.mainBody) } : {}),
    })),
    blogPosts: (blogPosts || []).map(bp => ({
      title: bp.name,
      url: `${SITE_URL}/blog/${bp.slug}`,
      description: truncateAtSentence(bp.excerpt) || `${bp.name}.`,
      ...(includeContent && bp.content ? { content: htmlToMarkdown(bp.content) } : {}),
    })),
    seoPages: (seoPages || []).map(sp => ({
      title: sp.name,
      url: `${SITE_URL}/seo-for/${sp.slug}`,
      description: truncateAtSentence(sp.heroDescription) || sp.name,
    })),
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
    `> LoudFace is a B2B SaaS web design, SEO, AEO, and growth agency based in Dubai. Webflow Enterprise Partners with 200+ projects delivered. We build conversion-optimized websites and run dual-track SEO/AEO programs that drive organic growth on both Google and AI search engines.`,
    '',
    `## About`,
    '',
    `- [Homepage](${SITE_URL}): Agency overview, services, case studies, and client logos.`,
    `- [About Us](${SITE_URL}/about): Team, founding story, values, and credentials.`,
    `- [Pricing](${SITE_URL}/pricing): Retainer plans, service tracks, and engagement models.`,
    `- [Case Studies](${SITE_URL}/case-studies): Full portfolio of client work with measurable results.`,
    `- [Blog](${SITE_URL}/blog): SEO, AEO, Webflow, and growth strategy articles.`,
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
    `> LoudFace is a B2B SaaS web design, SEO, AEO, and growth agency based in Dubai. Webflow Enterprise Partners with 200+ projects delivered. We build conversion-optimized websites and run dual-track SEO/AEO programs that drive organic growth on both Google and AI search engines.`,
    '',
    `## About`,
    '',
    `- [Homepage](${SITE_URL}): Agency overview, services, case studies, and client logos.`,
    `- [About Us](${SITE_URL}/about): Team, founding story, values, and credentials.`,
    `- [Pricing](${SITE_URL}/pricing): Retainer plans, service tracks, and engagement models.`,
    '',
    `## Services`,
    '',
    renderPageList(data.services),
    '',
    `## Case Studies`,
    '',
    renderPageList(data.caseStudies),
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
    }>>(`*[_type == "blogPost" && slug.current == $slug] {
      name, excerpt, content
    }`, { slug });

    if (!post) return null;
    return [
      `# ${post.name}`,
      '',
      post.excerpt || '',
      '',
      htmlToMarkdown(post.content || ''),
    ].join('\n');
  }

  return null;
}
