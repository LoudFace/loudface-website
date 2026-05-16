import { createClient } from "@sanity/client";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  return a;
}, {});

const client = createClient({
  projectId: "xjjjqhgt",
  dataset: "production",
  apiVersion: "2025-03-29",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

const DOC_ID = "imported-blogPost-69b6dd5675b0768b9f8012da";

// Keep metaTitle under 48 chars (DEFAULT_MAX_PAGE_TITLE) so the title doesn't get truncated
const NEW_NAME = "The 40-60 Word Rule for AI Extraction (2026 AEO Guide)";
const NEW_META_TITLE = "The 40-60 Word Rule for AI Extraction";
const NEW_META_DESCRIPTION = "The 40-60 word rule is the single highest-impact AEO pattern in 2026. How to structure content for AI extraction with examples and tracking guide.";
const NEW_EXCERPT = "The 40-60 word rule is the single highest-impact AEO content pattern in 2026: every page opens with a complete, standalone answer in 40-60 words, immediately after the H1, before any preamble. Here's how it works and how to enforce it site-wide.";

if (NEW_META_TITLE.length > 48) {
  console.error(`ERROR: metaTitle too long (${NEW_META_TITLE.length} chars). Must be <= 48.`);
  process.exit(1);
}

const NEW_CONTENT = `<p><strong>TL;DR:</strong> The 40-60 word rule is the single highest-impact AEO content pattern in 2026: every page should open with a complete, standalone answer to its primary question in roughly 40 to 60 words, immediately after the H1, before any preamble. AI engines extract these blocks verbatim as citations in ChatGPT, Perplexity, and Google AI Overviews responses. Pages that open with throat-clearing intros (the "Welcome, today we'll cover..." pattern) get skipped at the citation layer. Pages that open with a tight direct-answer block get cited. The rule is mechanical, easy to enforce, and tracks measurably in Peec AI citation rate within 60-90 days.</p>

<hr>

<p>I've shipped Webflow client sites with and without the 40-60 word rule enforced at the IA stage. The pieces that follow it produce AI citations within months. The pieces that don't get extracted poorly even when the underlying content is strong. This is the highest-impact single AEO pattern, easy to add, and measurable.</p>

<p>This piece walks through the rule, why it works, how to enforce it, common failure modes, and how to measure impact.</p>

<p>For broader AEO architecture context, see <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>. For SEO vs AEO patterns, see <a href="/blog/seo-vs-aeo-for-webflow">SEO vs AEO for Webflow in 2026</a>.</p>

<h2>What the 40-60 word rule actually is</h2>

<p>Every page on your site has a primary question it should answer. The 40-60 word rule says: write that answer as a complete, standalone block, place it immediately after the H1 (before any introduction or preamble), and keep it tight enough that an AI engine can extract it as a citation without trimming.</p>

<p><strong>Bad opening (extracted poorly by AI engines):</strong></p>

<blockquote>"In today's rapidly evolving digital landscape, marketing teams face unprecedented challenges. This comprehensive guide will walk you through everything you need to know about answer engine optimization, from the fundamentals to advanced strategies that drive results..."</blockquote>

<p><strong>Good opening (extracted cleanly):</strong></p>

<blockquote>"Answer engine optimization is the practice of structuring web content so AI engines (ChatGPT, Perplexity, Google AI Overviews, Claude) can cite it accurately when buyers ask category questions. Three structural patterns matter most: direct-answer paragraphs of 40-60 words, FAQPage schema in JSON-LD, and an /answers directory with extractable Q&A pages. Skip the opening throat-clearing; lead with the answer."</blockquote>

<p>The second version is 60 words. It directly answers "what is answer engine optimization?" without preamble. An AI engine pulling a citation snippet for that query extracts this block cleanly. The first version forces the AI engine to scan deeper into the page for an actual answer, which it does inconsistently.</p>

<h2>Why the rule works (technical mechanics)</h2>

<p>AI engines build citation candidates by extracting text chunks that meet three criteria:</p>

<ol>
<li><strong>Standalone semantic completeness.</strong> The block makes sense without prior context. No "it" or "this" referring to earlier sentences. No "as mentioned above."</li>
<li><strong>Direct answer alignment with the buyer query.</strong> The block answers the question the user asked the AI engine rather than a tangentially related question.</li>
<li><strong>Extractable length.</strong> Most extraction windows favor 30-80 word chunks. Too short means the answer lacks context; too long means the AI engine trims it and loses meaning.</li>
</ol>

<p>Pages that open with a 40-60 word direct-answer block satisfy all three criteria at the most prominent position (top of page, immediately after the H1). Pages that bury the answer under preamble force AI engines to scan deeper, where extraction quality degrades.</p>

<h2>How to enforce the rule across a site</h2>

<p>Five mechanical steps:</p>

<ol>
<li><strong>For every page, write down the primary buyer question it should answer.</strong> This is the question a buyer would type into ChatGPT. If the page has multiple questions, prioritize one.</li>
<li><strong>Write the answer as a complete, standalone block of 40-60 words.</strong> No preamble. No setup sentence. Answer the question directly.</li>
<li><strong>Place it as the first paragraph after the H1.</strong> Before any introduction. Some teams bold the answer or label it "TL;DR:" for human readers; both patterns are extractable.</li>
<li><strong>Strip pronouns that refer to earlier context.</strong> "This is important because..." → "Direct-answer paragraphs are important because..." Make every sentence semantically complete.</li>
<li><strong>Test extraction.</strong> Paste the page URL into ChatGPT or Perplexity and ask the primary question. If the AI engine pulls your direct-answer block as the citation, the rule worked. If it pulls something else, refine.</li>
</ol>

<h2>Common failure modes</h2>

<p>Six patterns where the 40-60 word rule fails to land:</p>

<ol>
<li><strong>The "TL;DR" block is too long (over 80 words).</strong> AI engines trim and lose meaning. Tighten.</li>
<li><strong>The block is too short (under 30 words).</strong> Lacks enough context to be a useful citation. Expand.</li>
<li><strong>The block starts with a pronoun referring to earlier context.</strong> "This guide covers..." → useless without context. Rewrite to be standalone.</li>
<li><strong>The block buries the answer in qualifications.</strong> "While there are many ways to think about AEO, some practitioners believe that..." → AI engines pull this whole hedge instead of an answer. Lead with the answer; add nuance later.</li>
<li><strong>The block uses unique terminology without defining it.</strong> "AEO is the practice of OOPC optimization..." (where OOPC is your unique acronym). AI engines won't cite unfamiliar terms confidently.</li>
<li><strong>The block contains marketing language.</strong> "Our revolutionary solution helps brands win in the AI era." AI engines downrank promotional content for citation purposes. Be informational; save the marketing for further down the page.</li>
</ol>

<h2>How to measure impact</h2>

<p>Three signals to track over 60-90 days:</p>

<ol>
<li><strong>Peec AI citation rate on tracked prompts.</strong> Pages that implement the 40-60 word rule typically see citation rate lift of 15-40% on the prompts they target, within 60-90 days of consistent implementation. Tracking via Peec AI or similar tool is essential — without baseline data, you can't measure improvement.</li>
<li><strong>AI engine citation source URL (when visible).</strong> ChatGPT, Perplexity, and Google AI Overviews surface source URLs for cited content. If your page becomes a frequent citation source on category prompts, the rule worked. If it doesn't, refine.</li>
<li><strong>Branded search lift on NEW queries in GSC.</strong> The downstream signal of AI citation success: new branded queries appearing in Google Search Console that weren't present before (e.g., "[your brand] AEO playbook" appearing as a query after you publish your AEO playbook). Lag is 60-120 days.</li>
</ol>

<h2>The four AEO patterns this slots into</h2>

<p>The 40-60 word rule is one of four foundational AEO patterns that compound when implemented together:</p>

<ol>
<li><strong>Direct-answer paragraphs (the 40-60 word rule).</strong> This piece's focus.</li>
<li><strong>FAQPage schema in JSON-LD on every cornerstone piece.</strong> 5-8 question-answer pairs at the bottom of each page, rendered with FAQPage schema. AI engines extract these as Q&A.</li>
<li><strong>/answers directory with single-question pages.</strong> A discoverable answer surface for AI crawlers, each page 300-500 words with the answer in the first 60 words.</li>
<li><strong>Programmatic page trees tied to real buyer prompts.</strong> Per-prompt pages from prompt research (Peec AI baseline audit), AEO-architected at scale.</li>
</ol>

<p>Implementing all four produces compounding citation outcomes. Implementing only one (typically the 40-60 word rule) produces visible but limited lift.</p>

<h2>When the rule is harder to apply</h2>

<p>Three patterns where the 40-60 word rule needs adjustment:</p>

<ol>
<li><strong>Comparison pages (X vs Y).</strong> The primary question is "which one should I pick?" — but the honest answer is "it depends." The 40-60 word block should give the decision logic in compressed form, not a single recommendation. Done well, AI engines extract the decision logic cleanly.</li>
<li><strong>Long-form thought-leadership posts.</strong> Pages where the value is the journey, not a single answer. Add a 40-60 word direct-answer block anyway — the AI engine still needs a citation handle.</li>
<li><strong>Founder bylines / personal essays.</strong> The 40-60 word block can summarize the thesis without flattening the voice. Don't skip it just because the page is voice-led.</li>
</ol>

<h2>The honest takeaway</h2>

<p>The 40-60 word rule is the single highest-impact AEO content pattern in 2026 because it sits at the most prominent position on every page (immediately after the H1) and addresses the technical mechanics of how AI engines extract citation candidates. It's mechanical, easy to enforce, and measurable. Pages that follow it get cited; pages that don't get skipped.</p>

<p>If you're building or refreshing a Webflow site for AEO outcomes, the 40-60 word rule is the first pattern to implement at the IA stage rather than as a launch checklist item. For the full AEO architecture playbook, see the <a href="/blog/answer-engine-optimization-guide-2026">Answer Engine Optimization Guide for 2026</a>. For help structuring an AEO program where these patterns are enforced site-wide, <a href="/services/seo-aeo">we run 12-month dual-track engagements</a>.</p>`;

const NEW_FAQ = [
  {
    _key: "faq-1",
    _type: "object",
    question: "What is the 40-60 word rule in AEO?",
    answer: "The 40-60 word rule says every page should open with a complete, standalone answer to its primary question in roughly 40 to 60 words, placed immediately after the H1 before any preamble. AI engines (ChatGPT, Perplexity, Google AI Overviews) extract these blocks verbatim as citations. Pages following the rule get cited; pages that bury the answer under preamble get skipped at the citation layer.",
  },
  {
    _key: "faq-2",
    _type: "object",
    question: "Why does the 40-60 word rule work for AI extraction?",
    answer: "AI engines build citation candidates by extracting text chunks that meet three criteria: standalone semantic completeness (the block makes sense without prior context), direct answer alignment with the buyer query, and extractable length (30-80 words is the favored window). The 40-60 word rule satisfies all three at the most prominent position on every page.",
  },
  {
    _key: "faq-3",
    _type: "object",
    question: "How do I write a direct-answer paragraph that works for AEO?",
    answer: "Five mechanical steps: (1) write down the primary buyer question the page should answer, (2) write the answer as a complete standalone block of 40-60 words with no preamble, (3) place it as the first paragraph after the H1, (4) strip pronouns that refer to earlier context to make every sentence semantically complete, (5) test extraction by asking the primary question on ChatGPT or Perplexity and checking which block gets cited.",
  },
  {
    _key: "faq-4",
    _type: "object",
    question: "How long should an AEO direct-answer paragraph be?",
    answer: "40-60 words is the target range. Under 30 words lacks enough context to be a useful citation; AI engines may still cite but extraction quality drops. Over 80 words exceeds typical extraction windows; AI engines trim and lose meaning. The 40-60 word range fits cleanly into AI engine citation candidates without trimming.",
  },
  {
    _key: "faq-5",
    _type: "object",
    question: "How do I measure if my direct-answer paragraphs are working?",
    answer: "Three signals over 60-90 days: (1) Peec AI citation rate on tracked prompts (15-40% lift is typical after consistent implementation), (2) AI engine citation source URL visibility (when your page is the source ChatGPT or Perplexity cites for category prompts), (3) branded search lift on NEW queries in GSC (the downstream signal of AI citation success, with 60-120 day lag).",
  },
  {
    _key: "faq-6",
    _type: "object",
    question: "What are the common mistakes in writing AEO direct-answer paragraphs?",
    answer: "Six common failure modes: blocks over 80 words (AI engines trim), blocks under 30 words (lacks context), blocks starting with pronouns referring to earlier context, blocks burying the answer in qualifications, blocks using unique terminology without defining it, and blocks containing marketing language (AI engines downrank promotional content for citation purposes).",
  },
  {
    _key: "faq-7",
    _type: "object",
    question: "Does the 40-60 word rule work for every type of page?",
    answer: "Mostly yes, with adjustments for three patterns: comparison pages (X vs Y) where the answer is decision logic rather than a single recommendation, long-form thought-leadership posts where the value is the journey (add a direct-answer block anyway as a citation handle), and founder bylines or personal essays where the block summarizes the thesis without flattening the voice. The rule is universally applicable; the implementation flexes by content type.",
  },
];

const result = await client
  .patch(DOC_ID)
  .set({
    name: NEW_NAME,
    metaTitle: NEW_META_TITLE,
    metaDescription: NEW_META_DESCRIPTION,
    excerpt: NEW_EXCERPT,
    content: NEW_CONTENT,
    faq: NEW_FAQ,
    lastUpdated: new Date().toISOString(),
  })
  .commit();

console.log(`✓ Refreshed /blog/how-to-structure-content-for-ai-extraction`);
console.log(`  _rev: ${result._rev}`);
console.log(`  metaTitle: "${NEW_META_TITLE}" (${NEW_META_TITLE.length} chars)`);
