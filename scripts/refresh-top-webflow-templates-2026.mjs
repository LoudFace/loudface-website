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

const DOC_ID = "imported-blogPost-693fcdea6740d31faee922e9";

const NEW_NAME = "Best Webflow Agency Templates in 2026: 8 Worth Considering (Honest Ranking)";
const NEW_META_TITLE = "Best Webflow Templates 2026: 8 Worth Considering";
const NEW_META_DESCRIPTION = "The 8 best Webflow agency templates in 2026 ranked by component system, CMS depth, AEO-readiness, and Core Web Vitals. Honest evaluation by LoudFace.";
const NEW_EXCERPT = "The best Webflow agency templates in 2026 aren't the most polished ones — they're the ones with real component systems underneath. Here are 8 worth considering for B2B SaaS marketing sites, ranked by structural quality.";

const NEW_CONTENT = `<p><strong>TL;DR:</strong> The best Webflow agency templates in 2026 aren't the ones with the most polished designs in the marketplace; they're the ones with a real component system underneath. The eight templates worth considering for B2B SaaS marketing sites are Flowbase Foundation, Refokus' Forma, Edgar Allan's Lumen, Brixt, Untitled UI Webflow, Relume Library, Memberstack Starter, and the bare-bones Webflow Starter. Most marketplace templates fail on the same axes: shallow CMS architecture, no AEO patterns built in, design-led but engineering-thin, no design-system tokens. The right template buys you 30-40% time savings on the build; the wrong template costs more in rebuilding than starting from scratch.</p>

<hr>

<p>I've shipped Webflow client sites built from templates and from scratch over two years at LoudFace. The pattern that comes up: templates can save real time on the initial build, but only specific ones. Most marketplace templates are designed for portfolio screenshots rather than for a real CMS-driven marketing site that scales past launch. This piece ranks the eight templates worth considering and explains why most others aren't.</p>

<p>For broader Webflow context, see <a href="/blog/mastering-webflow-guide">Getting Started with Webflow in 2026</a>. For agency selection, see <a href="/blog/best-webflow-agencies">Best Webflow Agencies in 2026</a>.</p>

<h2>What "best Webflow template" actually means in 2026</h2>

<p>The criteria that matter shifted as Webflow CMS matured:</p>

<ol>
<li><strong>Real component system.</strong> Templates with proper component thinking (typography scales, color tokens, spacing systems, reusable section blocks) compound. Templates built as page-by-page decoration don't.</li>
<li><strong>CMS architecture depth.</strong> Templates with a real Collections setup (blog + case studies + team + clients + categories + cross-references) save real time. Templates with one Collection for blog only require rebuilding.</li>
<li><strong>AEO-readiness.</strong> Templates with direct-answer paragraph slots at the top of pages and FAQ Collection support save weeks of AEO retrofit work. Templates without these patterns require IA-stage rebuilding.</li>
<li><strong>Core Web Vitals discipline.</strong> Templates with reasonable bundle sizes and image optimization. Templates with animation-heavy hero sections and uncompressed images need performance rebuilding.</li>
<li><strong>Design system tokens rather than visual style.</strong> Templates that exposes design tokens (text scales, spacing values, color systems) are extensible to brand. Templates with hardcoded visual decisions need full redesign anyway.</li>
</ol>

<p>The list below is ranked by how well each template does these five things together.</p>

<h2>The 8 Webflow templates worth considering in 2026</h2>

<h3>1. Flowbase Foundation: design-system-first</h3>

<p><strong>Best for:</strong> agencies building custom client sites and wanting a real component system as the starting point.</p>

<p><strong>Why first:</strong> Foundation is the closest thing to a proper design system in Webflow template form. Token-based typography scales, spacing system, color tokens, reusable section blocks. Components are designed to be customized at the design-token layer, not visually overridden per page. CMS Collections are minimal (intentionally) so you architect them per client.</p>

<p><strong>Where it falls short:</strong> if you want a complete out-of-the-box marketing site with hero, features, pricing, testimonials, case studies all pre-built, Foundation is too bare-bones. It's a system, not a finished site.</p>

<p><strong>Pricing:</strong> $99-$249 depending on license tier.</p>

<h3>2. Refokus' Forma: design-led with engineering depth</h3>

<p><strong>Best for:</strong> brand-led B2B SaaS companies that want a polished design starting point but care about engineering quality.</p>

<p><strong>Why second:</strong> Forma combines strong design with real engineering thinking. Component library is properly structured. Animations are tasteful (not heavy). CMS Collections cover the common B2B SaaS patterns. Includes design-system tokens via Webflow variables.</p>

<p><strong>Where it falls short:</strong> the design is opinionated. Brands that need a fully neutral starting point will fight the visual language.</p>

<p><strong>Pricing:</strong> $129-$249.</p>

<h3>3. Edgar Allan's Lumen: narrative-led with strong CMS</h3>

<p><strong>Best for:</strong> brand-led companies where storytelling is central to the marketing site.</p>

<p><strong>Why third:</strong> Lumen ships with strong narrative-led page templates (long-form landing pages, founder bylines, case study templates). CMS Collections are well-architected for case-study-driven companies. Good typography system.</p>

<p><strong>Where it falls short:</strong> less flexible for utility-driven B2B SaaS sites that need feature pages, pricing, integration directories.</p>

<p><strong>Pricing:</strong> $149-$299.</p>

<h3>4. Brixt: utility-driven for SaaS</h3>

<p><strong>Best for:</strong> B2B SaaS companies that want a "ship a marketing site in 4 weeks" starting point with most pages pre-built.</p>

<p><strong>Why fourth:</strong> Brixt ships with the common B2B SaaS template inventory (hero, features, pricing, testimonials, careers, blog, case studies, integration pages). CMS Collections are sensible. Components are reusable.</p>

<p><strong>Where it falls short:</strong> design is generic by design (so it's customizable). Without meaningful brand work on top, sites built from Brixt look interchangeable with competitor sites built from the same template.</p>

<p><strong>Pricing:</strong> $99-$179.</p>

<h3>5. Untitled UI Webflow: Figma + Webflow design system</h3>

<p><strong>Best for:</strong> teams that already use Untitled UI in Figma and want the Webflow counterpart.</p>

<p><strong>Why fifth:</strong> the Figma-Webflow parity is the killer feature. Designers in Figma can hand off to Webflow developers without translation losses. Component naming is consistent. Design tokens map cleanly.</p>

<p><strong>Where it falls short:</strong> Untitled UI's design language is opinionated. Brands wanting differentiation need significant customization.</p>

<p><strong>Pricing:</strong> $349 (Pro) for the full system.</p>

<h3>6. Relume Library: modular components, AI-first ideation</h3>

<p><strong>Best for:</strong> teams using AI-augmented design workflows and wanting Relume's component library as the starting point.</p>

<p><strong>Why sixth:</strong> Relume's component library has 500+ Webflow components organized by section type. AI ideation tools generate page compositions from these components. The hand-off to Webflow is clean.</p>

<p><strong>Where it falls short:</strong> Relume is more of a component library than a complete template. Site architecture and CMS still need to be designed.</p>

<p><strong>Pricing:</strong> Subscription-based ($25-$75/month).</p>

<h3>7. Memberstack Starter: auth + gated content out of the box</h3>

<p><strong>Best for:</strong> SaaS companies needing gated content, member portals, or paywalled blog content.</p>

<p><strong>Why seventh:</strong> if Memberstack is part of the stack, this template wires auth + gated content + member-only pages into Webflow cleanly. Saves the integration work that's otherwise significant.</p>

<p><strong>Where it falls short:</strong> specific to Memberstack stacks. Without auth requirements, this is overkill.</p>

<p><strong>Pricing:</strong> Free (Memberstack subscription required separately).</p>

<h3>8. Webflow Starter: bare-bones, official</h3>

<p><strong>Best for:</strong> teams that want to architect everything custom and need a minimal Webflow project to start from.</p>

<p><strong>Why eighth:</strong> sometimes the right template is no template. Starting from Webflow's official starter forces engineering-first thinking from day one. No fighting against template assumptions.</p>

<p><strong>Where it falls short:</strong> zero time savings on out-of-the-box pages. Only makes sense if the team has the engineering depth to architect from scratch.</p>

<p><strong>Pricing:</strong> Free.</p>

<h2>Templates to avoid (and why)</h2>

<p>Three patterns of marketplace templates that look great but cost more in rebuilding than they save:</p>

<ol>
<li><strong>Animation-heavy hero templates without CMS architecture.</strong> Designed for portfolio screenshots rather than for marketing sites that scale. Core Web Vitals tank, CMS retrofit is painful.</li>
<li><strong>Template kits with 100+ "page variations" but no underlying component system.</strong> Each page is decorated independently. Editing one feels like editing 100 separate files. Maintenance is painful at scale.</li>
<li><strong>Templates that bundle bloated third-party scripts.</strong> Embedded chat widgets, animation libraries, multiple analytics scripts. Performance tanks before you've added a single client requirement.</li>
</ol>

<h2>How to evaluate a Webflow template in 2026</h2>

<p>Five questions before buying:</p>

<ol>
<li><strong>Does it ship with design tokens (Webflow variables for typography, color, spacing)?</strong> If yes, the template is extensible. If no, you're decorating pages.</li>
<li><strong>How many CMS Collections does it include, and what's the reference structure?</strong> Strong templates have 5-8 Collections with cross-references. Weak templates have one Collection for blog.</li>
<li><strong>What's the Lighthouse score on the template's demo site?</strong> If under 90 on desktop, expect performance rebuilding.</li>
<li><strong>Does it include FAQ Collection support with FAQPage schema?</strong> If yes, AEO retrofit is faster. If no, you're adding that infrastructure.</li>
<li><strong>Can you customize at the token layer or are you overriding per-page?</strong> Token-layer customization compounds. Per-page overrides accumulate maintenance debt.</li>
</ol>

<h2>The honest takeaway</h2>

<p>Webflow templates in 2026 are a useful starting point for B2B SaaS marketing sites, but only the eight above pass the structural quality bar. Most marketplace templates are designed for portfolio screenshots rather than for compounding marketing sites.</p>

<p>The right template (Foundation, Forma, Lumen, Brixt) saves 30-40% on the initial build. The wrong template costs more in rebuilding than starting from scratch.</p>

<p>If you're evaluating templates for a serious B2B SaaS engagement, the deeper question is whether you need a template at all. For Tier 2 specialist studio engagements ($8K-$25K), templates accelerate delivery. For Tier 3 full-stack SEO + AEO programs ($80K-$200K), custom architecture usually beats templates because the AEO patterns and programmatic page trees aren't well-represented in marketplace templates anyway.</p>

<p>For agency selection context, see <a href="/blog/best-webflow-agencies">Best Webflow Agencies in 2026</a>. For pricing tier context, see <a href="/blog/webflow-agency-pricing">Webflow Agency Pricing in 2026</a>. If you want help structuring the template-vs-custom decision for your specific project, <a href="/services/seo-aeo">we run discovery calls without pitching unfit engagements</a>.</p>`;

const NEW_FAQ = [
  {
    _key: "faq-1",
    _type: "object",
    question: "What are the best Webflow agency templates in 2026?",
    answer: "The 8 templates worth considering for B2B SaaS marketing sites are Flowbase Foundation (design-system-first), Refokus' Forma (design-led with engineering depth), Edgar Allan's Lumen (narrative-led with strong CMS), Brixt (utility-driven for SaaS), Untitled UI Webflow (Figma-Webflow parity), Relume Library (modular components for AI workflows), Memberstack Starter (auth + gated content), and the official Webflow Starter (bare-bones for custom architecture).",
  },
  {
    _key: "faq-2",
    _type: "object",
    question: "How much time does a good Webflow template save on a build?",
    answer: "The right template (Foundation, Forma, Lumen, Brixt) saves 30-40% on the initial build for B2B SaaS marketing sites. The wrong template costs more in rebuilding than starting from scratch. The difference depends on whether the template ships with real design tokens, proper CMS architecture, and AEO-ready patterns.",
  },
  {
    _key: "faq-3",
    _type: "object",
    question: "Should I use a Webflow template or build custom?",
    answer: "Depends on the engagement tier. For Tier 2 specialist studio engagements ($8K-$25K), templates accelerate delivery and the cost makes sense. For Tier 3 full-stack SEO + AEO programs ($80K-$200K), custom architecture usually beats templates because AEO patterns and programmatic page trees aren't well-represented in marketplace templates. For one-off brochure sites, templates are the right call.",
  },
  {
    _key: "faq-4",
    _type: "object",
    question: "What makes a Webflow template AEO-ready?",
    answer: "Three structural patterns: (1) direct-answer paragraph slots at the top of every page template (40-60 words after the H1), (2) FAQ Collection with FAQPage schema rendering via Custom Code, (3) reference structure that supports an /answers directory with single-question pages. Templates without these patterns require IA-stage rebuilding to retrofit AEO architecture.",
  },
  {
    _key: "faq-5",
    _type: "object",
    question: "What Webflow templates should I avoid?",
    answer: "Three patterns to avoid: animation-heavy hero templates without real CMS architecture (designed for portfolio screenshots rather than scaling marketing sites), template kits with 100+ page variations but no underlying component system (each page decorated independently, maintenance painful at scale), and templates that bundle bloated third-party scripts (embedded chat widgets, animation libraries, multiple analytics — performance tanks before you ship).",
  },
  {
    _key: "faq-6",
    _type: "object",
    question: "How do I evaluate a Webflow template before buying?",
    answer: "Five questions: (1) Does it ship with design tokens (Webflow variables for typography, color, spacing)? (2) How many CMS Collections does it include, and what's the reference structure between them? (3) What's the Lighthouse score on the template's demo site? (4) Does it include FAQ Collection support with FAQPage schema? (5) Can you customize at the token layer or are you overriding per-page?",
  },
  {
    _key: "faq-7",
    _type: "object",
    question: "Is Relume Library a template or a component library?",
    answer: "Relume is more of a component library than a complete template. It has 500+ Webflow components organized by section type, plus AI ideation tools that generate page compositions from those components. Site architecture and CMS still need to be designed. Strong for teams using AI-augmented design workflows; less of a fit for teams wanting a complete site to customize.",
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

console.log(`✓ Refreshed /blog/top-10-webflow-agency-templates`);
console.log(`  _rev: ${result._rev}`);
