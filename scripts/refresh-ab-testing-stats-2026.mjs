#!/usr/bin/env node
/**
 * Refresh /blog/ab-testing-setup-using-delta-reference-and-confidence-intervals
 * for 2026. The stats half of the A/B testing trilogy. Same _id, same slug.
 * Cross-links to the tools and setup pieces.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import path from "node:path";

if (!process.env.SANITY_API_TOKEN) {
	try {
		const envPath = path.resolve(process.cwd(), ".env.local");
		const env = readFileSync(envPath, "utf8");
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

const DOC_ID = "imported-blogPost-67be8ca9d1a0a78bc135f444";

const NEW_NAME = "DIY SEO A/B Testing in 2026: Delta Reference and Confidence Intervals";
const NEW_META_TITLE = "DIY SEO A/B Testing 2026: Delta Reference + Stats";
const NEW_META_DESCRIPTION =
	"Why SEO A/B testing needs different math than CRO testing, and how to run a defensible page-level split test in Google Sheets using delta reference + confidence intervals.";
const NEW_EXCERPT =
	"SEO A/B testing in 2026: page-level splits, delta reference math, confidence intervals, and the full Google Sheets workflow for a defensible test result without a commercial tool.";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> SEO A/B testing is different from CRO A/B testing. You cannot randomly split a single session between two URLs because Google sees one canonical URL per resource. The honest method is <em>page-level split testing</em>: take a set of similar URLs, treat half, leave the other half as control, and measure the lift using <strong>delta reference</strong> (each URL's pre-test traffic as its own baseline) and <strong>confidence intervals</strong> (to separate signal from noise across pages with different baseline volumes). This guide shows the math, the Excel/Google Sheets workflow, and when this approach is the right one.</p>

<p>I have run SEO experiments on B2B SaaS Webflow sites for two years. Most agencies skip the experimentation step because the math is harder than CRO testing and the tools do not handle it well. The result: SEO changes ship on opinion, beyond what the data supports. This guide is the antidote: DIY statistical testing in Google Sheets that gives you a real answer.</p>

<p>This is the technical companion to the cluster on A/B testing in Webflow. For tool comparison, see <a href="/blog/best-webflow-split-testing-tools-compared">Best Webflow A/B Testing Tools (2026)</a>. For setup methods, see <a href="/blog/webflow-split-testing-setup">How to Set Up A/B Testing in Webflow</a>. This piece is the stats half: how to know whether your SEO change actually worked.</p>

<h2>Why SEO A/B testing needs different math</h2>

<p>In CRO testing, you have one URL and split incoming sessions between two variants randomly. That works because every session is independent and the random assignment cancels out baseline differences.</p>

<p>SEO testing does not work that way. Google sees one canonical URL per resource. You cannot serve different content to Googlebot on the same URL without risking a cloaking penalty. So you cannot do session-level random assignment.</p>

<p>What you can do: take a set of similar URLs (programmatic pages, product pages, blog posts in a topic cluster) and split them into two groups. Apply the change to one group. Leave the other group untouched. Compare the lift.</p>

<p>The new challenge: the URLs in each group have different baseline traffic. URL A might have averaged 1,000 visits/month before the test, URL B might have averaged 100. A flat "average lift" misleads because URL A dominates the average. You need a method that normalizes against each URL's own baseline.</p>

<p>That method is <strong>delta reference plus confidence intervals.</strong></p>

<h2>What delta reference means</h2>

<p>Delta reference uses each URL's pre-test baseline as its own reference point. Instead of comparing test group average against control group average, you compare each URL's post-test traffic against its own pre-test traffic.</p>

<p>The calculation per URL:</p>

<pre><code>delta = (post-test traffic - pre-test traffic) / pre-test traffic</code></pre>

<p>Then aggregate the deltas across the test group and the control group. The lift is the difference between the two group averages.</p>

<p>A worked example:</p>

<table class="summary_table"><thead><tr><th>URL</th><th>Pre-test (clicks/30d)</th><th>Post-test (clicks/30d)</th><th>Delta</th></tr></thead>
<tbody>
<tr><td>/pricing-page-a (test)</td><td>1,000</td><td>1,150</td><td>+15%</td></tr>
<tr><td>/pricing-page-b (test)</td><td>200</td><td>240</td><td>+20%</td></tr>
<tr><td>/pricing-page-c (control)</td><td>800</td><td>820</td><td>+2.5%</td></tr>
<tr><td>/pricing-page-d (control)</td><td>150</td><td>156</td><td>+4%</td></tr>
</tbody></table>

<p>Test group average delta: (15 + 20) / 2 = 17.5%<br>
Control group average delta: (2.5 + 4) / 2 = 3.25%<br>
Lift: 17.5% - 3.25% = 14.25%</p>

<p>Without delta reference, the raw numbers would have made URL A dominate the calculation and the small URLs would have been noise. With delta reference, every URL contributes proportionally to its own movement.</p>

<h2>What confidence intervals add</h2>

<p>The 14.25% lift in the example above is the point estimate. The honest question is: how confident are you that the lift is real and not random variance?</p>

<p>That is what confidence intervals quantify. A 95% confidence interval on the lift might tell you the true effect is somewhere between +8% and +20%. If the interval includes 0% (i.e., spans from negative to positive), you have not actually shown a positive effect.</p>

<p>The formula for a 95% confidence interval on the difference of two group means:</p>

<pre><code>CI = (mean_test - mean_control) ± 1.96 × SE</code></pre>

<p>Where SE is the standard error of the difference:</p>

<pre><code>SE = sqrt( (variance_test / n_test) + (variance_control / n_control) )</code></pre>

<p>In Google Sheets, this is a STDEV() + COUNT() + arithmetic chain. Not glamorous, but reliable.</p>

<h3>Tips for using confidence intervals</h3>

<ol>
<li><strong>Wider intervals mean less reliable data.</strong> A 95% CI of +5% to +25% is a directional signal at best. A 95% CI of +12% to +18% is something you can act on.</li>
<li><strong>Always look at both bounds.</strong> Reading only the midpoint hides the risk. If the lower bound is negative, you do not have a positive result. Treat it as a non-result.</li>
<li><strong>Sample size matters more than effect size.</strong> A 50% lift on a sample of 5 URLs is noisier than a 5% lift on a sample of 50 URLs. The latter is often the more confident finding.</li>
<li><strong>Compare same-class URLs.</strong> Mixing a product page test with a blog post control will produce noise that confidence intervals will not save you from. Match the URL class.</li>
</ol>

<h2>Step-by-step: running an SEO A/B test in Sheets</h2>

<p>This is the same workflow we use on LoudFace client engagements when there is no commercial tool that fits. Five steps.</p>

<h3>Step 1: Define hypothesis and metric</h3>

<p>Write down what you expect to happen and why, before launching. Example: "Adding a 60-word direct-answer paragraph at the top of /rates/{role}-{country} pages will increase clicks per page by 20% because Google AI Overviews will pick up the answer block and cite the page more often."</p>

<p>Pick one metric. Clicks per page over a 30-day window is the most common. Impressions per page works if you are testing a meta-title change. Position is rarely the right metric: too noisy.</p>

<h3>Step 2: Split the URLs into test and control groups</h3>

<p>Take your set of similar URLs. Pair them by baseline traffic so the groups are matched. If you have 20 URLs, sort by pre-test clicks descending, then alternate assigning to test and control. URLs 1, 3, 5, 7, ... go to test. URLs 2, 4, 6, 8, ... go to control. This produces two groups with similar baseline distributions.</p>

<p>For programmatic pages (e.g., /rates/{role}-{country}), random assignment is fine because the base templates are identical and only the role/country slot varies.</p>

<h3>Step 3: Make the change to the test group</h3>

<p>Whatever the hypothesis is. Add the direct-answer paragraph. Rewrite the meta title. Restructure the H2s. Apply to all test-group URLs, leave control-group URLs alone.</p>

<p>Track the change date. You want at least 30 days of post-change data, ideally 60.</p>

<h3>Step 4: Pull pre-test and post-test data</h3>

<p>Use GSC. Get per-URL clicks (or impressions, whichever the hypothesis targets) for the 30-day window before the change, and the equivalent window after.</p>

<p>Drop these into a Google Sheet with columns:</p>

<pre><code>URL | Group (test/control) | Pre-test clicks | Post-test clicks | Delta</code></pre>

<p>Calculate Delta as a formula: <code>(D2-C2)/C2</code>.</p>

<h3>Step 5: Calculate the lift and confidence interval</h3>

<p>In two more cells:</p>

<pre><code>Mean delta (test): AVERAGEIF(B:B, "test", E:E)
Mean delta (control): AVERAGEIF(B:B, "control", E:E)
Lift: mean_test - mean_control

Variance (test): VARP filtered to test rows
Variance (control): VARP filtered to control rows
n_test: COUNTIF(B:B, "test")
n_control: COUNTIF(B:B, "control")
SE: SQRT(var_test/n_test + var_control/n_control)
CI lower: lift - 1.96*SE
CI upper: lift + 1.96*SE</code></pre>

<p>If CI lower &gt; 0, you have a positive result with 95% confidence. If CI includes 0, you do not.</p>

<h2>When this approach is the right one</h2>

<ul>
<li>You are testing an SEO change (not a CRO change) where session-level splitting does not work.</li>
<li>You have at least 10-20 similar URLs to split between test and control.</li>
<li>You have at least 30-60 days of post-change data to compare.</li>
<li>You are not willing to ship the change site-wide on a hunch.</li>
</ul>

<h2>When this approach is the wrong one</h2>

<ul>
<li>You only have 2-3 URLs to test. Sample size too small for confidence intervals to be meaningful.</li>
<li>The URLs are too different (a product page and a blog post have nothing in common; the comparison is noise).</li>
<li>You need a result faster than 60 days. Hypothesis-based shipping with a rollback plan is the honest alternative.</li>
<li>The change is multi-URL by nature (a navigation menu rewrite affects every page; you cannot half-treat).</li>
</ul>

<h2>Commercial alternatives</h2>

<p>For teams that do not want to maintain a Google Sheets workflow, the commercial tools for SEO A/B testing in 2026 are limited but real:</p>

<ul>
<li><strong>SearchPilot</strong> is the leading dedicated SEO A/B testing platform. Enterprise pricing. Built specifically for the page-level split-test methodology described above. Worth it if you are running more than two SEO tests per quarter.</li>
<li><strong>SplitSignal</strong> (by SEMrush) is the mid-market option. Same methodology, lower price, less depth.</li>
</ul>

<p>For most B2B SaaS Webflow sites, the Sheets-based DIY method described here is enough. It is slower than commercial tools but the math is identical and the cost is zero.</p>

<h2>The honest takeaway</h2>

<p>SEO A/B testing is harder than CRO A/B testing because Google's deterministic URL serving rules out session-level splitting. Delta reference plus confidence intervals is the right statistical method for page-level splits. You can run it in Google Sheets with no tool. The result is a defensible answer about whether your SEO change actually worked.</p>

<p>If you want help structuring an SEO experimentation program on a B2B SaaS Webflow site, <a href="/services/seo-aeo">we run this work as part of our dual-track SEO/AEO engagements</a>. The stats are the easy part. The harder part is picking changes worth testing and waiting 60 days without shipping the change site-wide.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "Why is SEO A/B testing different from CRO A/B testing?",
		answer:
			"<p>In CRO testing, you serve different page variants to different sessions on the same URL. Google sees one canonical URL per resource and treats inconsistent content as cloaking, which risks a penalty. So SEO testing uses page-level splits: half of similar URLs get the change, half are control. The statistical method is delta reference plus confidence intervals because the URLs in each group have different baseline traffic that a flat average would distort.</p>",
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "What is delta reference in A/B testing?",
		answer:
			"<p>Delta reference uses each URL's pre-test baseline as its own reference point. Per URL, delta = (post-test traffic - pre-test traffic) / pre-test traffic. Then aggregate the deltas across the test group and the control group. This normalizes for differing baseline traffic and stops high-volume URLs from dominating the average.</p>",
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "How do I calculate confidence intervals for an A/B test in Google Sheets?",
		answer:
			"<p>Standard 95% CI formula: lift ± 1.96 × standard error. In Sheets: compute the variance and count of each group, then SE = SQRT(var_test/n_test + var_control/n_control). The lower bound is the lift minus 1.96 × SE; the upper bound is the lift plus 1.96 × SE. If the lower bound is greater than 0, you have a positive result with 95% confidence. If the interval includes 0, you have a non-result.</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "How long should I run an SEO A/B test?",
		answer:
			"<p>Minimum 30 days of post-change data. Ideal 60 days. SEO changes propagate slowly through Google's index, and the first 14 days after a change usually show transient effects from re-crawling and re-evaluation. Test windows shorter than 30 days produce noise that confidence intervals will not save you from.</p>",
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "What is the minimum number of URLs to A/B test SEO changes?",
		answer:
			"<p>At least 10 URLs in each group, ideally 20+. With fewer URLs the variance gets too large and confidence intervals get too wide to act on. For programmatic page templates (where the URLs are nearly identical and only a slot varies), you can sometimes get away with smaller groups, but as a default, plan for 20+ URLs per group.</p>",
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "Are there commercial tools for SEO A/B testing?",
		answer:
			"<p>Yes. SearchPilot is the leading dedicated SEO A/B testing platform (enterprise pricing). SplitSignal by SEMrush is the mid-market option. Both use the page-level split-test methodology with delta reference and confidence intervals — the same statistical approach you can run yourself in Google Sheets. Tools save time. They do not add statistical rigor on top of what you can do manually.</p>",
	},
];

const TODAY = new Date().toISOString();

const result = await client
	.patch(DOC_ID)
	.set({
		name: NEW_NAME,
		metaTitle: NEW_META_TITLE,
		metaDescription: NEW_META_DESCRIPTION,
		excerpt: NEW_EXCERPT,
		content: NEW_CONTENT,
		faq: NEW_FAQ,
		lastUpdated: TODAY,
	})
	.commit();

console.log(`✓ Refreshed /blog/ab-testing-setup-using-delta-reference-and-confidence-intervals`);
console.log(`  _id: ${result._id}`);
console.log(`  _rev: ${result._rev}`);
console.log(`  content length: ${result.content.length} chars`);
console.log(`  faq entries: ${result.faq.length}`);
