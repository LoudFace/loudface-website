/**
 * VERIFIED COPY — do not edit by hand.
 *
 * Google AI Overviews service page body (/services/ai-overviews).
 * Source of truth: the content-engine private spine body store,
 *   spine-id a2a04f97-6633-4f55-ae3c-00f21c24a213
 *   body sha256 6e36476dfeb207abd2aa426123bf9ec15d947a0c2e438d6e617910ed5dd9a4cb
 * Two independent verifiers signed this text off on 2026-09-20. Any wording
 * change needs a re-verify in the content engine first, then a regenerated
 * export here — never an edit in this file.
 *
 * This is the verified body rendered to HTML, minus two blocks that were moved
 * (not rewritten) to the top of the page: the H1, which is now the page h1, and
 * the "Short answer" paragraph, which is now the hero sub so the direct answer
 * is the first block on the page. Every other word is verbatim.
 *
 * Deliberately NOT in src/data/content/: this copy must not be reachable by the
 * client inline editor, because a silent edit would invalidate the verification.
 */
export const AI_OVERVIEWS_BODY_HTML = String.raw`
<h2>Scope: what this engagement reports on</h2>
<p>This engagement optimizes for Google AI Overviews and reports on Google AI Overviews. Google's Search documentation covers AI Overviews and AI Mode together, as &quot;generative AI features in Google Search&quot;, and the two share the same retrieval, so the work done for one carries to the other. Gemini sits in a separate documentation set, <a href="https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/grounding/grounding-with-google-search" target="_blank" rel="noopener">Google Cloud's grounding guide</a>, which documents the API rather than the consumer assistant, so what anyone can say about the assistant itself is limited.</p>
<p>The reporting does not follow the work. What this engagement puts a weekly per-prompt number on, with a question and a cited position attached, is AI Overviews. A Gemini per-prompt channel exists in the tracking we run, live on five client panels as of September 2026, and it can be added to yours on request; it is not part of this program's weekly report by default. No panel we run has an AI Mode channel today, though the tracker sells one, so that too is an addition rather than a default.</p>
<p>Wider coverage is a different engagement. The <a href="/services/geo-agency">GEO agency</a> service runs citation work across the generative engines and reports ChatGPT, Perplexity and AI Overviews per engine every week. The <a href="/services/seo-aeo">SEO and AEO</a> service runs search and answer engines as a single program, ranking on Google and earning citations inside the assistants, rather than as separate tracks. Google's surfaces are part of both.</p>
<h2>How AI Overviews picks a source</h2>
<p>Google is unusually direct about this.</p>
<p>Google's <a href="https://developers.google.com/search/docs/fundamentals/ai-optimization-guide" target="_blank" rel="noopener">optimization guide for generative AI features</a> says they are &quot;rooted in our core Search ranking and quality systems.&quot; The retrieval method is grounding: relying on &quot;our core Search ranking systems to retrieve relevant, up-to-date web pages from our Search index.&quot; The eligibility rule, under &quot;Technical requirements for appearing in AI features&quot; on the <a href="https://developers.google.com/search/docs/appearance/ai-features" target="_blank" rel="noopener">AI features page</a>, reads: &quot;To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements. There are no additional technical requirements.&quot; The same page adds: &quot;There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.&quot; It also sets the ceiling on what anyone can promise: &quot;Just because a page meets all requirements, best practices, and complies with the policies, doesn't mean that Google will crawl, index, or serve its content. Indexing and serving isn't guaranteed.&quot;</p>
<p>On schema, the optimization guide is equally plain: &quot;Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add.&quot;</p>
<p>There is one gate that sits above all of it, and the two Google pages list it differently. The optimization guide adds: &quot;In addition to the technical requirements for Search, a site must be included in Search generative AI features in Search Console to be eligible for display in generative AI features on Google Search.&quot; Google's <a href="https://support.google.com/webmasters/answer/16908024" target="_blank" rel="noopener">help page for that control</a> says inclusion &quot;is the default control for all properties&quot;, so most sites already have it. It is a setting rather than a ranking factor, and it is the first thing we read, because a site switched to exclude cannot appear at all.</p>
<p>So there is no hidden lever. What changes is the question being asked of your page. Google calls it query fan-out: &quot;A set of concurrent, related queries generated by the model to request more information and fetch additional relevant search results to address the user's query.&quot; Its own example takes &quot;how to fix a lawn that's full of weeds&quot; and fans it into &quot;best herbicides for lawns&quot;, &quot;remove weeds without chemicals&quot;, and &quot;how to prevent weeds in lawn&quot;. Gemini works the same way where Google documents it, which is in its API references rather than for the consumer assistant. Google's Gemini API documentation, in the step it labels Prompt Analysis, states: &quot;The model analyzes the prompt and determines if a Google Search can improve the answer.&quot; Google's <a href="https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/grounding/grounding-with-google-search" target="_blank" rel="noopener">grounding guide</a> returns the queries the model ran alongside its citations, and says of Gemini 3 models that &quot;A single prompt might lead to one or more search queries&quot;. Both document the API rather than the consumer assistant, and that is the closest published account of it.</p>
<p>Your buyer never types those sub-queries. The model does. A page built to rank for one head term answers one of them and loses the rest. That is the job on this surface.</p>
<p>Look at what that produces on a real buying question. Across 30 Google AI Overview answers to &quot;Agency that optimizes SaaS sites for Gemini and AI Overviews&quot;, in the 30 days to 19 September 2026, AI Overviews cited 296 sources across them: 42 hosts, and 77 distinct URLs once the tracker normalises them, between 5 and 20 sources in a single answer. The most-quoted was one third-party roundup, in 25 of the 30 answers. One roundup turns up in most of the answers. Behind it the tail is wide and it moves: 31 of those 77 appeared in exactly one answer. No loudface.co page was among those 296 sources. That is the measured position we work from on this prompt, and it is the same starting point most buyers of this service are in.</p>
<h2>What Google lets you measure, and where it stops</h2>
<p>Search Console added <a href="https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports" target="_blank" rel="noopener">generative AI performance reports</a> for Search and for Discover in June 2026, and a note on that post records the rollout reaching all websites worldwide on 31 August 2026. The Search report is the one that matters here. They report impressions, how often your URLs appeared in generative AI features in Search and Discover, plus which pages appeared, countries, devices and dates.</p>
<p>Clicks from AI features and position are not in that list. And in the main Performance report, AI-feature traffic is folded into ordinary search traffic under the Web search type, so you cannot separate it there either.</p>
<p>Every buyer on this surface hits the same gap. Impressions tell you that something happened. They do not tell you which question you won, where you sat in the answer, or who took the slot you did not get.</p>
<h3>The three readings, and what each one can tell you</h3>
<div class="comparison-table-wrap">
<table>
<thead>
<tr>
<th scope="col">Reading</th>
<th scope="col">Where it comes from</th>
<th scope="col">What it answers</th>
<th scope="col">What it cannot answer</th>
</tr>
</thead>
<tbody>
<tr>
<td>AI-feature impressions and pages</td>
<td>Search Console generative AI performance report</td>
<td>whether any of your URLs appeared in a Google AI feature, and which ones</td>
<td>which question, what position, which competitor</td>
</tr>
<tr>
<td>Per-prompt visibility and average cited position in AI Overviews</td>
<td>Third-party prompt tracking on the AI Overviews channel</td>
<td>on the questions your buyers ask, how often you appear in AI Overviews and how high you are quoted</td>
<td>AI Mode, the Gemini assistant, revenue</td>
</tr>
<tr>
<td>Signups, demos and booked calls from organic and AI sessions</td>
<td>Your analytics and CRM</td>
<td>whether any of it paid</td>
<td>which prompt caused it</td>
</tr>
</tbody>
</table>
</div>
<p>We run all three, and we say which surface each reading covers. The per-prompt panel on the middle row reads the AI Overviews channel only. Search Console does not fill the gap: its <a href="https://support.google.com/webmasters/answer/16984139" target="_blank" rel="noopener">report documentation</a> lists the capabilities it covers as AI Overviews and AI Mode, and the impressions figure does not split between them. The Gemini assistant is not on that list at all. So for AI Mode there is one blended impression count that cannot be split, and for the Gemini assistant Google's report carries nothing at all. Gemini and AI Mode can both be read per prompt through the tracking panel, which sells a channel for each; neither is on this program's panel today, and either can be added on request. Google's own advice, in its May 2025 post <a href="https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search" target="_blank" rel="noopener">Top ways to ensure your content performs well in Google's AI experiences on Search</a>, points the same way: it recommends looking at &quot;various indicators of conversion on your site, be it sales, signups, a more engaged audience, or information lookups about your business&quot;, because clicks alone understate the value of an AI-feature visit.</p>
<h2>What we do for AI Overviews</h2>
<p>This runs inside one program across SEO, AEO and GEO, content and the site itself, on a single retainer, rather than as a separate vendor bolted onto the others.</p>
<ol>
<li><strong>Fan-out mapping, and knowing where to stop.</strong> We record the sub-queries the models actually issue around your buying questions, then check which of them your existing pages already answer well and which are genuinely uncovered. Google draws the line at intent: creating separate content for every variation, &quot;doing so primarily to manipulate rankings or generative AI responses in Google Search violates Google's scaled content abuse spam policy&quot;. So the map tells us what to deepen, and usually what not to write.</li>
<li><strong>Eligibility, checked at both levels.</strong> The site level first: inclusion in Search generative AI features, which is a Search Console setting and a hard gate on display. Then page by page: indexed, crawlable, and free of the preview controls that quietly remove you. Google <a href="https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search" target="_blank" rel="noopener">names those</a>: nosnippet, data-nosnippet, max-snippet and noindex, and says &quot;More restrictive permissions will limit how your content is featured in our AI experiences.&quot;</li>
<li><strong>Extraction structure.</strong> A self-sufficient answer near the top of each page, tables where the answer is comparative, and headings that match the sub-query rather than the head term.</li>
<li><strong>Entity clarity.</strong> One consistent description of what your product is and who it is for, across your own pages and the third-party pages the models retrieve alongside them.</li>
<li><strong>Freshness on the pages that earn it.</strong> AI Overviews sit on the live index, so a correction to a retrieved page can change an answer in days. We use that where it pays and leave the rest alone.</li>
<li><strong>Structured data kept honest.</strong> We keep it because it earns rich results, and we keep the markup matching the visible page, which is what Google asks. We do not sell it as an AI lever, because Google says it is not one.</li>
</ol>
<h2>Why AI Overviews is the surface to fix first</h2>
<p>Google AI Overviews refreshes on the live Search index. It is the surface where a change you ship this week can show up this week.</p>
<p>On <a href="/case-studies/toku-ai-cited-pipeline">Toku</a>, a stablecoin payroll platform we were the growth partner for across an engagement of roughly 18 months, from 2024 to 2026, the spring 2026 per-engine split reads: Google AI Overviews 35% visibility carrying 57% of Toku's total AI mentions at average cited position 2.3, against ChatGPT at 11% and Perplexity at 10%. The case study puts it plainly: Google AI Overviews &quot;cites Toku in roughly one of every three responses on tracked prompts.&quot;</p>
<p>On Google AI Overviews specifically, the case study reports Toku as &quot;the second most-visible brand: 39.3% in the 30 days to 19 August 2026, behind Deel at 43.1% and ahead of Remote at 35.9%&quot;.</p>
<p>Across all the engines that program tracked, in the 30 days to 19 August 2026, Toku read 97.8% AI visibility on &quot;best stablecoin payroll providers&quot;, the highest of any brand on that prompt in that window, at an average cited position of 3.1.</p>
<h2>What you get, and when</h2>
<p>Kickoff is within 48 hours of signature. Access is set up, the Scoreboard goes live, and the first fixes and calibration articles ship in the same week. You meet the delivery team and see shipped work inside five days.</p>
<p>From then on you get the Scoreboard, the live dashboard tracking what is in progress, what shipped and what is next, a weekly showcase of the work before it goes live, more often on the higher tiers, and the Monthly Memo. The AI Overviews reading sits in there per prompt, on its own rather than inside a blended cross-engine average.</p>
<p>Engagements start from <a href="/pricing">$5k a month</a>. Solo Autopilot runs one track, Dual Autopilot two in parallel, and Scale Autopilot three to four concurrent initiatives.</p>
<h2>Who this is not for</h2>
<ul>
<li>Companies that want a guaranteed AI Overview citation. Nobody can sell you one, and Google's documentation is the reason.</li>
<li>Teams whose pages are not indexable or are blocked from snippets, unless fixing that is part of the first month.</li>
<li>Anyone who wants ChatGPT or Perplexity visibility as well. Those corpora move on different cycles and are tracked per engine on the <a href="/services/geo-agency">GEO agency</a> service, or inside the single program on the <a href="/services/seo-aeo">SEO and AEO</a> page, which is where that work belongs.</li>
<li>Anyone who needs AI Mode or Gemini reported per prompt as the core of the engagement. Neither is on this program's weekly panel; both are channels the tracker sells and either can be added on request, but the number this program is built around is AI Overviews.</li>
<li>Businesses with no commercial event to measure against. Impressions on their own are not a result.</li>
</ul>
<p><a href="/contact">Book an intro call</a>. Thirty minutes over video on what is holding the site back, where the revenue leaks, and whether we are the right fit.</p>
`;

/** The nine verified FAQ entries from the same signed-off set. */
export const AI_OVERVIEWS_FAQ = [
  { q: "Is there a special way to optimize for AI Overviews?", aHtml: "Not a separate one. Google's documentation states that its generative AI features are rooted in its core Search ranking and quality systems, and that a page needs to be indexed and eligible to be shown with a snippet, with the site included in Search generative AI features in Search Console. Beyond that it says there are no additional technical requirements and no other special optimizations necessary. What changes is the question. Google's models fan a buyer's query out into related sub-queries and retrieve against those, so a page written for one head term misses the rest." },
  { q: "Do I need schema markup to appear in AI Overviews?", aHtml: "No. Google states that structured data is not required for generative AI search and that there is no special schema.org markup to add. It is still worth keeping, because it makes pages eligible for rich results in ordinary Search, and Google asks that everything in the markup is also visible on the page. We keep schema for that reason. It is not an AI-specific lever, and Google says so. The engine-wide entity and schema work sits on our GEO agency page." },
  { q: "What can Search Console tell me about AI Overviews?", aHtml: "Impressions, pages, countries, devices and dates. Google rolled its generative AI performance reports out to all websites worldwide on 31 August 2026. Those reports show how often your URLs appeared in generative AI features in Search and Discover, and which URLs appeared. Clicks from AI features and average position are not in that list, and in the main Performance report AI-feature traffic is folded into ordinary Web search traffic. The Search report's documentation lists the capabilities it covers as AI Overviews and AI Mode, and the impressions figure does not split between them." },
  { q: "How do you measure AI Overviews performance?", aHtml: "Three readings, kept separate. Search Console's generative AI report for impressions and which pages appeared. Per-prompt tracking on the AI Overviews channel for how often you appear on a buying question and at what average cited position. Your own analytics and CRM for signups, demos and booked calls. We report the AI Overviews reading on its own rather than inside a blended cross-engine average, because the engines move at different speeds and a blend hides which one is losing." },
  { q: "How is this different from your GEO service?", aHtml: "Scope and instrument. This service is Google's AI Overviews: the retrieval work that decides whether your pages are eligible and quotable there, with a weekly per-prompt reading on that channel. The GEO agency service is the wider program and reports ChatGPT, Perplexity and AI Overviews per engine every week. The tracker also sells Gemini and AI Mode channels; a Gemini channel already runs on five client panels. Neither is on this program's weekly panel by default, and either can be added on request." },
  { q: "Why can't Search Console tell me if it is working yet?", aHtml: "Because its generative AI report has one metric. Impressions tell you a URL appeared in an AI feature somewhere, with no question attached and no position, and it does not separate AI Overviews from AI Mode. Early movement and a held slot on a competitive question produce the same rising line. The speeds themselves are on our GEO agency page. What we add here is the reading that separates them, per prompt, on the AI Overviews channel, every week." },
  { q: "Can you guarantee a citation in an AI Overview?", aHtml: "No. Google's own documentation gives eligibility rules, not placement rules: a page must be indexed and eligible to be shown with a snippet, the site must be included in Search generative AI features in Search Console, and even then Google states plainly that \"Indexing and serving aren't guaranteed.\" Eligibility is inside our control. Which source a model picks for a given answer is not. What we commit to is measured movement on the prompts we agree to track, reported weekly on the AI Overviews channel." },
  { q: "What does it cost?", aHtml: "Engagements start from $5k a month. Solo Autopilot runs one track, Dual Autopilot runs two tracks in parallel, and Scale Autopilot runs three to four concurrent initiatives. Pricing depends on tier, scope and complexity, and the intro call ends with a recommended tier." },
  { q: "What happens in the first 30 days?", aHtml: "Kickoff is within 48 hours of signature. In week one, access is set up, the Scoreboard goes live, and the first technical fixes and calibration articles ship. You meet the delivery team and see shipped work inside five days. Baseline readings per prompt on the Google channel go live in the same week, so the first Scoreboard and the first showcase already have a number to move from." },
];
