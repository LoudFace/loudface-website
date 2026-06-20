#!/usr/bin/env node
/**
 * Ship "Best AEO Agency for Fintech Companies in 2026 (Ranked)" to Sanity production.
 * Run from project root: node scripts/ship-best-aeo-agency-fintech-companies-2026.mjs
 *
 * Source: Notion calendar entry 36bb6339-4d10-819d-b1dc-d97abeb6549b
 * Loop step: /ship-content. The Sanity webhook chain (revalidate + IndexNow)
 * will fire automatically when this mutation lands.
 *
 * Differs from previous ship scripts in two ways:
 *   1) Strips inline ## FAQ from markdown BEFORE HTML conversion (per 2026-05-24 fix)
 *   2) Sets `directAnswer` so the TL;DR block renders above body content
 *
 * Skale headcount confirmed ~30 (per their team page, patched from ~50 earlier today).
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const ROOT = '/Users/arnel/Code Projects/LoudFace Agency/loudface-website';

// Load .env.local
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .map(l => l.trim().match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map(m => [m[1], m[2]])
);

const sanity = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

if (!env.SANITY_API_TOKEN) {
  console.error('Missing SANITY_API_TOKEN');
  process.exit(1);
}

const SLUG = 'best-aeo-agency-fintech-companies-2026';
const DOC_ID = `blogPost-${SLUG}`;
const DRAFT_PATH = path.join(ROOT, '.claude/drafts/best-aeo-agency-fintech-companies-2026.md');

// -----------------------------------------------------------------------------
// 1. Read source markdown
// -----------------------------------------------------------------------------
let md = fs.readFileSync(DRAFT_PATH, 'utf8');

// Drop the H1 (page renders title separately)
md = md.replace(/^#\s+.+\n+/, '');

// -----------------------------------------------------------------------------
// 2. Extract FAQ entries (and strip the FAQ section from markdown)
// -----------------------------------------------------------------------------
const faqMatch = md.match(/##\s+(?:FAQ|FAQs|Frequently\s+[Aa]sked\s+[Qq]uestions?)\s*\n([\s\S]*?)(?=\n##\s+|$)/i);
let faqs = [];
if (faqMatch) {
  const faqBlock = faqMatch[1];
  // Each Q is "### question" followed by paragraph(s) until next ### or end
  const qRegex = /###\s+(.+?)\n+([\s\S]*?)(?=\n###\s+|$)/g;
  let m;
  let idx = 0;
  while ((m = qRegex.exec(faqBlock)) !== null) {
    const question = m[1].trim();
    const answer = m[2].trim()
      // strip stray markdown emphasis/code in answers
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      // collapse markdown links into plain "text (url)" for plaintext answer storage
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
    faqs.push({
      _type: 'object',
      _key: `faq${idx}`,
      question,
      answer,
    });
    idx++;
  }
  // Now strip the FAQ section from the markdown so it's not rendered inline
  md = md.replace(/##\s+(?:FAQ|FAQs|Frequently\s+[Aa]sked\s+[Qq]uestions?)\s*\n[\s\S]*?(?=\n##\s+|$)/i, '');
}

if (faqs.length === 0) {
  console.warn('⚠️  No FAQ entries extracted — check FAQ regex');
}

// -----------------------------------------------------------------------------
// 3. Pull the directAnswer (TL;DR) — first paragraph of body
//
// IMPORTANT: also strip the first paragraph from `md` so it doesn't render
// inside the body, otherwise the page shows the TL;DR block + the same
// paragraph again as the body's lead (the 2026-05-25 duplication bug).
// -----------------------------------------------------------------------------
const paras = md.trim().split(/\n\n/);
let leadIdx = 0;
while (leadIdx < paras.length && paras[leadIdx].trim() === '') leadIdx++;
const directAnswer = paras[leadIdx].trim();
md = paras.slice(leadIdx + 1).join('\n\n');

// -----------------------------------------------------------------------------
// 4. Convert markdown → HTML (lightweight; matches existing ship-script style)
// -----------------------------------------------------------------------------
function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function inlineMd(s) {
  // Order matters: links first (so we don't double-escape inside them), then bold, then italics, then code
  // Links: [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
  // Bold: **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic: *text* but only when surrounded by non-* (avoid clobbering bold residuals)
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  // Inline code: `text`
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  return s;
}

function mdToHtml(input) {
  // Split into blocks separated by blank lines
  const lines = input.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // H2
    if (/^##\s+/.test(line)) {
      const text = line.replace(/^##\s+/, '').trim();
      out.push(`<h2 id="${slugify(text)}">${inlineMd(text)}</h2>`);
      i++;
      continue;
    }
    // H3
    if (/^###\s+/.test(line)) {
      const text = line.replace(/^###\s+/, '').trim();
      out.push(`<h3 id="${slugify(text)}">${inlineMd(text)}</h3>`);
      i++;
      continue;
    }
    // Markdown table — header row `| col | col |` followed by `|---|---|` separator
    if (
      line.trim().startsWith('|') &&
      i + 1 < lines.length &&
      /^\s*\|[\s\-:|]+\|\s*$/.test(lines[i + 1])
    ) {
      const headerCells = line.trim().split('|').slice(1, -1).map((c) => c.trim());
      i += 2; // skip header + separator
      const bodyRows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].trim().split('|').slice(1, -1).map((c) => c.trim());
        bodyRows.push(
          `<tr>${cells.map((c) => `<td>${inlineMd(c)}</td>`).join('')}</tr>`,
        );
        i++;
      }
      const thead = `<thead><tr>${headerCells
        .map((c) => `<th>${inlineMd(c)}</th>`)
        .join('')}</tr></thead>`;
      const tbody = `<tbody>${bodyRows.join('')}</tbody>`;
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }
    // Unordered list — consume contiguous "- " lines
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inlineMd(lines[i].replace(/^[-*]\s+/, '').trim())}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }
    // Ordered list — consume contiguous "1. " lines
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inlineMd(lines[i].replace(/^\d+\.\s+/, '').trim())}</li>`);
        i++;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }
    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }
    // Paragraph — consume until blank line or block-starter
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(##|###|[-*]\s+|\d+\.\s+)/.test(lines[i])
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length) {
      out.push(`<p>${inlineMd(paraLines.join(' '))}</p>`);
    }
  }
  return out.join('\n');
}

const content = mdToHtml(md);

// -----------------------------------------------------------------------------
// 5. Build the Sanity blogPost document
// -----------------------------------------------------------------------------
const doc = {
  _id: DOC_ID,
  _type: 'blogPost',
  name: 'Best AEO Agency for Fintech Companies in 2026 (Ranked)',
  slug: { _type: 'slug', current: SLUG },
  metaTitle: 'Best AEO Agency for Fintech Companies in 2026 (Ranked)',
  metaDescription:
    'The eight AEO agencies actually moving share of answer for fintech companies in 2026. Ranked with verified pricing, headcounts, and honest fit criteria.',
  excerpt:
    'The eight AEO agencies moving share of answer for fintech in 2026. Verified pricing, headcounts, and where each fit breaks down. LoudFace at #2.',
  directAnswer,
  content,
  faq: faqs,
  category: { _ref: 'imported-category-67bced81857d76ee5b3795b1', _type: 'reference' },
  categories: [
    { _key: 'cat-marketing', _ref: 'imported-category-67bced81857d76ee5b3795b1', _type: 'reference' },
  ],
  author: { _ref: 'imported-teamMember-68d81a1688d5ed0743d0b8b6', _type: 'reference' },
  publishedDate: '2026-05-25T20:00:00.000Z',
  lastUpdated: '2026-05-26T15:00:00.000Z',
  featured: false,
  timeToRead: '14 min read',
};

async function main() {
  console.log(`Shipping ${DOC_ID} to Sanity...`);
  console.log(`- Body HTML length: ${content.length} chars`);
  console.log(`- FAQ entries: ${faqs.length}`);
  console.log(`- Direct Answer length: ${directAnswer.length} chars`);
  const res = await sanity.createOrReplace(doc);
  console.log(`✓ Sanity document created/replaced (rev: ${res._rev})`);
  console.log(`Live URL will be: https://www.loudface.co/blog/${SLUG}`);
  console.log('Sanity webhook → revalidate → IndexNow chain firing now. Wait ~10s, then curl to verify.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
