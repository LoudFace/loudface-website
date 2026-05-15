#!/usr/bin/env node
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import path from "node:path";

if (!process.env.SANITY_API_TOKEN) {
	try {
		const env = readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
		const m = env.match(/^SANITY_API_TOKEN=(.+)$/m);
		if (m) process.env.SANITY_API_TOKEN = m[1].trim();
	} catch {}
}

const client = createClient({
	projectId: "xjjjqhgt",
	dataset: "production",
	apiVersion: "2025-03-29",
	useCdn: false,
	token: process.env.SANITY_API_TOKEN,
});

const DOC_ID = "imported-blogPost-67be8cae0cf37605a64e6b74";

const NEW_NAME = "Lottie Animations in Webflow 2026: When to Use Them, When to Skip";
const NEW_META_TITLE = "Lottie + Webflow 2026: When to Use, When to Skip";
const NEW_META_DESCRIPTION =
	"How Lottie works in Webflow 2026: native support, when it adds brand polish, when it costs Core Web Vitals, and the full implementation workflow from After Effects to live Webflow site.";
const NEW_EXCERPT =
	"Lottie animations in Webflow: a practitioner's guide to where they pay off (brand-distinct hero animations, icon micro-interactions) and where they cost more than they give (factual content, pages with LCP pressure, CSS-animation problems).";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> Lottie is a vector animation format that renders crisp at any size, weighs less than equivalent video or GIF, and animates programmatically via JSON. Webflow supports Lottie natively in the Designer (drop a .json file, set the trigger, ship). Use Lottie for brand-distinct illustrations, icon micro-interactions, and hero-section motion that needs to feel custom. Skip Lottie for content that has to communicate factually (use real images or screenshots), for cases where a 30KB CSS animation would do the job, or on pages where Core Web Vitals are already under pressure.</p>

<p>I have shipped Lottie animations on B2B SaaS Webflow sites since the format was first supported natively. The pattern that wastes the most time: teams add a Lottie animation because animation feels like sophistication, then watch their LCP score drop 200ms and the conversion rate stay flat. Used in the right places, Lottie adds the kind of brand polish that screenshots cannot match. Used in the wrong places, it costs performance without adding signal.</p>

<p>This is part of the Webflow practitioner cluster. For broader Webflow context, see <a href="/blog/mastering-webflow-guide">Getting Started with Webflow in 2026</a>. For the design-handoff workflow, see <a href="/blog/how-to-use-figma-to-webflow-plugin">Figma to Webflow Plugin in 2026</a>.</p>

<h2>What Lottie actually is</h2>

<p>Lottie is an open-source animation format developed by Airbnb. Designers create animations in Adobe After Effects (or Lottie-compatible tools like Rive, Jitter, or LottieFiles' web editor), export to a JSON file that contains the vector data and animation timeline, and ship that JSON to the web where a Lottie player renders it as live SVG.</p>

<p>Three properties make Lottie useful:</p>

<ol>
<li><strong>Vector at any size.</strong> Unlike GIFs or videos, Lottie animations stay crisp at any resolution because they render as SVG. A retina-quality hero animation does not need a 2x asset.</li>
<li><strong>Smaller file sizes than equivalent video or GIF.</strong> A 2-second loop that would be 1.5MB as an MP4 or 800KB as a GIF can ship as a 30-80KB JSON file. Significant for mobile users on slow connections.</li>
<li><strong>Programmatic control.</strong> Animations respond to scroll position, hover state, click events, or custom JavaScript triggers. The animation timeline is data rather than a fixed video.</li>
</ol>

<p>The format is mature in 2026. Most Webflow Designer features for Lottie work the same way they did in 2022, with incremental improvements (better preview, fewer edge-case rendering bugs).</p>

<h2>How Webflow handles Lottie</h2>

<p>Webflow ships Lottie as a native element. You add a Lottie element from the Add panel, upload a .json file, and configure the trigger (autoplay, on click, on scroll, on hover). The Designer previews the animation in real time. The published output is a Lottie player script (about 50KB gzipped) plus your animation's JSON file.</p>

<p>What Webflow's native Lottie support handles well:</p>

<ul>
<li><strong>Trigger configuration.</strong> Autoplay, on hover, on click, on scroll-into-view. Covers 95% of marketing-site animation use cases.</li>
<li><strong>Loop and direction control.</strong> Forward, reverse, ping-pong, loop count, frame range. All exposed in the Lottie element settings.</li>
<li><strong>Responsive sizing.</strong> The Lottie element respects standard Webflow sizing (rem, vw, percentage) and resizes cleanly across breakpoints.</li>
</ul>

<p>What Webflow's native Lottie support does not handle:</p>

<ul>
<li><strong>Lottie expressions</strong> (After Effects expressions that compute frame values dynamically). The Lottie player supports them but Webflow's element does not expose the configuration interface.</li>
<li><strong>Custom event triggers from outside the page.</strong> If you want a Lottie to animate when a third-party script fires an event, you need custom code beyond what the native element exposes.</li>
<li><strong>Per-layer animation control via the Designer.</strong> You configure animations at the file level. For per-layer interactions, custom JavaScript is required.</li>
</ul>

<h2>When Lottie is the right call</h2>

<p>Three patterns where Lottie consistently adds value on B2B SaaS sites:</p>

<ol>
<li><strong>Brand-distinct hero animation.</strong> A custom animation in the hero section that communicates what the product does (e.g., a stylized data flow for a fintech, a typing-into-a-form animation for a SaaS tool). Done well, this is the kind of polish that buyers attribute to a credible product. Static screenshots cannot match it.</li>
<li><strong>Icon micro-interactions.</strong> Hover states on feature icons that play a 1-second animation when the cursor enters. Small effect, big quality signal for the brand.</li>
<li><strong>Empty-state and onboarding illustrations.</strong> When the user encounters a screen with no data yet, a Lottie illustration animating to suggest what to do next reads as designed-with-care rather than as a default empty state.</li>
</ol>

<h2>When Lottie is the wrong call</h2>

<p>Three patterns where Lottie costs more than it gives:</p>

<ol>
<li><strong>Communicating factual information.</strong> Product screenshots, comparison tables, real customer testimonial videos. A Lottie animation of a "happy customer" is uncanny. Use real images for real information.</li>
<li><strong>Pages where Core Web Vitals are under pressure.</strong> Lottie player adds ~50KB gzipped to your JavaScript bundle. The animation JSON itself adds another 30-100KB. If your page is already near the LCP threshold, adding Lottie can flip it from passing to failing.</li>
<li><strong>Cases where a CSS animation would do.</strong> Spinning loaders, hover bounces, simple fades. CSS animation is free in terms of additional payload, runs native in the browser, and handles 80% of "I want this to move" cases. Reach for Lottie when you need vector illustration or complex multi-element choreography, not when you need a button to wobble.</li>
</ol>

<h2>Implementation workflow</h2>

<p>The honest minimum to ship Lottie on a Webflow site:</p>

<ol>
<li><strong>Source the animation file.</strong> Either design in After Effects with the Bodymovin plugin, design in Rive or Jitter and export to Lottie JSON, or buy a pre-built animation from LottieFiles' marketplace (verify the license).</li>
<li><strong>Optimize the JSON.</strong> Lottie animations exported from After Effects are often 200-300KB. Run them through LottieFiles' optimizer or the open-source <code>lottie-compress</code> tool to drop file size by 30-60% with no visible quality loss.</li>
<li><strong>Upload to Webflow.</strong> Add a Lottie element in the Designer, upload the optimized JSON, configure the trigger (autoplay for hero animations, on scroll for in-page animations, on hover for icon interactions).</li>
<li><strong>Set responsive sizing.</strong> Configure the Lottie element to scale with the parent container. Test the animation at all four standard Webflow breakpoints; vector renders crisp at any size but the surrounding layout may need adjustment.</li>
<li><strong>Audit performance.</strong> Open Chrome DevTools' Performance tab, record a page load, check that the Lottie initialization does not block LCP. If it does, defer the animation (don't autoplay on hero) or split the animation into smaller files.</li>
<li><strong>Test on real devices.</strong> Lottie performance varies more on mobile than desktop. Test on a real mid-tier Android device before shipping. Some complex Lottie animations stutter on hardware below the iPhone 12 / Pixel 6 line.</li>
</ol>

<h2>The honest takeaway</h2>

<p>Lottie is a great format for brand-distinct animation on B2B SaaS marketing sites. Webflow's native support handles 95% of marketing animation needs without custom code. The trade-off is performance: every Lottie you ship adds payload, and overusing animation costs Core Web Vitals scores that matter for SEO.</p>

<p>Pick the right place for Lottie (hero illustration, icon interactions, empty states). Skip it for factual content, CSS-animation-shaped problems, and pages already under LCP pressure. The animations should add brand polish, not vanity.</p>

<p>If you are evaluating where Lottie fits on a B2B SaaS Webflow site, <a href="/services/seo-aeo">we run Webflow engagements that include performance-conscious motion design as part of the SEO + AEO program</a>.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "What is Lottie and how does it work with Webflow?",
		answer:
			"<p>Lottie is an open-source vector animation format that renders as SVG (crisp at any size). Animations are designed in After Effects or tools like Rive, exported as a JSON file, and rendered by a Lottie player on the web. Webflow supports Lottie natively: add a Lottie element in the Designer, upload the JSON file, configure trigger (autoplay, on scroll, on hover, on click), and ship. Output is real SVG rendered live on page load.</p>",
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "Are Lottie animations bad for performance?",
		answer:
			"<p>They can be. The Lottie player adds about 50KB gzipped to your JavaScript bundle, and each animation JSON adds another 30-100KB. On a page already near the LCP threshold, adding Lottie can flip Core Web Vitals from passing to failing. The fix: don't autoplay heavy Lottie animations on the hero section, optimize JSON files with LottieFiles' optimizer (30-60% size reduction with no visible quality loss), and use on-scroll triggers so animations don't block initial render.</p>",
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "When should I use Lottie instead of a CSS animation?",
		answer:
			"<p>Use Lottie when you need vector illustration or complex multi-element choreography that CSS cannot reasonably express. Use CSS animation for simple effects: hover bounces, spinning loaders, fades, scale-on-hover. CSS animation is free in terms of payload (no additional library), runs native in the browser, and handles 80% of \"I want this to move\" cases on a marketing site. Reach for Lottie when the animation itself is the design, not when you just need a button to wobble.</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "Where do I get Lottie animation files?",
		answer:
			"<p>Three sources. (1) Design in Adobe After Effects with the Bodymovin plugin to export native Lottie JSON. (2) Design in Rive, Jitter, or LottieFiles' web editor and export. (3) Buy or download pre-built animations from LottieFiles' marketplace (free and paid tiers; verify the license matches your use case). For brand-distinct animations on a real marketing site, custom design via After Effects or Rive is the right path. Stock Lottie animations are great for icon interactions and empty states.</p>",
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "Can I trigger Lottie animations from external events in Webflow?",
		answer:
			"<p>Yes, but only with custom code. Webflow's native Lottie element supports four triggers (autoplay, on hover, on click, on scroll-into-view). For triggers from external sources (a third-party script firing an event, a form submission completing, a CMS field changing), you'll need to wire the Lottie player directly via JavaScript using the <code>lottie-web</code> library and Webflow's custom code embed. Most marketing-site use cases don't need this, but it's available when required.</p>",
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "Do Lottie animations render correctly on all browsers?",
		answer:
			"<p>Generally yes in 2026. The Lottie player has been mature for years and handles all major browsers (Chrome, Safari, Firefox, Edge, mobile Safari, mobile Chrome). The main remaining edge cases: complex Lottie expressions don't render in some older Safari versions, and very animation-heavy pages can stutter on mid-tier Android devices below the Pixel 6 line. Test on real devices before shipping anything mission-critical.</p>",
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

console.log(`✓ Refreshed /blog/webflow-and-lottie-animations`);
console.log(`  _rev: ${result._rev}`);
