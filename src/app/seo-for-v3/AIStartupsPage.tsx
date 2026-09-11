import Link from 'next/link';
import { FooterV3 } from '../home-v3/FooterV3';
import { ServiceV3Scripts } from '../service-v3/Scripts';

const buyerQuestions = [
  ['Do you train on our data, and how long do you keep it?', 'The training answer, the retention period, the residency option, and the named control that switches each one off', 'A data-handling page that separates training, retention and residency'],
  ['Which AI governance framework do you map to?', 'The framework you name, the functions you map against, and the technical documentation you keep if you provide a general-purpose model', 'A governance page naming the framework and the documentation you hold'],
  ['What does your SOC 2 report actually cover?', 'The report itself, its scope, its period and its auditor', 'A trust page that offers the report and states its scope'],
  ['What happens when your model provider changes?', 'The models you run on, the indemnity you inherit, the mitigations you carry, and what you indemnify yourself', 'A model-dependency page written with your legal owner'],
  ['How accurate is it, and how do you know?', 'The eval you run, the dataset, the grader, and the result you accept before a release ships', 'An accuracy page that publishes the eval instead of the word benchmarked'],
  ['Can an engineer evaluate this without talking to sales?', 'A model card or README with intended use, limitations, training data and evaluation results, plus a quickstart that works', 'Public documentation, a model card, and a repository a developer can read'],
] as const;

export const AI_STARTUPS_FAQ_ITEMS = [
  ['What does SEO for an AI startup cover?', 'It covers the website and content that help a technical buyer, a security reviewer and a budget owner find and evaluate your product through Google. For a model, an agent or an AI-first application, that usually means category, data-handling, governance, accuracy, comparison and documentation pages. Each of those three readers stops at a different page, so each page has to answer one of them completely.'],
  ['How do AEO and GEO apply to an AI-native product?', 'The engines treat generative engine optimization (GEO) as the head term, with answer engine optimization and AI search optimization as synonyms. The work makes the important answers on your site easy to extract when a buyer asks an AI system about your category, your data handling or your accuracy. It uses direct answer blocks, cited evidence and consistent terminology. It does not guarantee that an engine will recommend you.'],
  ['Should we block AI crawlers?', 'Training and answer eligibility are separate switches. OpenAI states that a site can allow OAI-SearchBot to appear in ChatGPT search results while disallowing GPTBot so its content is not used for training. Perplexity draws the same split, and Google-Extended controls Gemini training and grounding without affecting Google Search inclusion or ranking. Block the training agents if you want to. Blocking the search agents costs you buyer visibility.'],
  ['Does LoudFace have AI-native clients?', 'Yes, three. Bluefyn is an AI verification product, and on a fixed prompt set its AI visibility rose more than 5x across two 30-day windows 83 days apart, with ChatGPT up 13x and average position when named improving to under 2. Pond is an AI workforce marketplace, and its AI visibility tripled from a near-zero base in the first four weeks. Eraser describes itself as "AI for diagrams that matter", and its case study publishes no AI-search figure. None of these is a revenue figure.'],
  ['Do comparison and review pages still matter for an AI startup?', 'Yes, and the review sites are algorithms rather than analyst opinions. G2 states that its score is computed from Satisfaction and Market Presence, that older reviews are weighted less, and that its reviews do not constitute expert opinions based on objective criteria. You control your own comparison and alternatives pages completely, so build those first and treat the review programme as continuous.'],
  ['How does LoudFace measure this work?', 'LoudFace measures AI search work against revenue outcomes, not vanity metrics. Share of answers, citations, position when cited and sentiment are tracked on each engine separately, and clicks and impressions come from your own Search Console property. The measurement plan names the source, the window, the attribution limit and the owner before anyone draws a conclusion. LoudFace holds no evidenced revenue figure attributable to AI search yet, and says so.'],
] as const;

export function AIStartupsPage() {
  return (
    <>
      <section className="hr-hero hero" aria-labelledby="ai-startups-title">
        <div className="container hr-hero-grid">
          <div className="hr-hero-copy">
            <h1 id="ai-startups-title" className="rv">SEO, AEO and GEO for AI Startups</h1>
            <p className="hero-sub rv" style={{ ['--d' as string]: '.12s' }}>
              Your buyer is a security reviewer with a questionnaire and an engineer with a free trial. Your website has to satisfy both before anyone books a call.
            </p>
            <div className="hero-cta rv" style={{ ['--d' as string]: '.18s' }}>
              <a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg">Book an intro call</a>
              <Link href="#buyer-questions" className="tlink">See the buyer questions <Arrow /></Link>
            </div>
          </div>
          <div className="hr-hero-proof rv" style={{ ['--d' as string]: '.14s' }}>
            <div className="mat">
              <div className="plate">
                <div className="bar" aria-hidden="true"><b></b><b></b><b></b><span>bluefyn.ai</span></div>
                <div className="ais-panel">
                  <h3>Bluefyn, first 30 days against the latest 30 days</h3>
                  <ul className="ais-stats">
                    <li><b>More than 5x</b><span>AI visibility on a fixed set of tracked buyer prompts</span></li>
                    <li><b>13x</b><span>ChatGPT visibility over the same two windows</span></li>
                    <li><b>Under 2</b><span>Average position when named, latest window</span></li>
                  </ul>
                </div>
              </div>
            </div>
            <span className="hr-proof-note">AI verification product. Figures from the Bluefyn programme.</span>
          </div>
        </div>
      </section>

      <section className="hr-answer" aria-label="Short answer">
        <div className="container hr-narrow">
          <div className="hr-short-card"><p className="hr-label">The short answer</p><p className="hr-lede">An AI startup wins or loses in the security review long before the demo closes anything. LoudFace connects SEO for Google, AEO for answer engines, and GEO for generative search through website and content work. We build the pages a buyer opens before the first call: how you handle their data, which governance framework you map to, what your SOC 2 report actually covers, what happens when your model provider changes, and how accurate the output is. Then we measure visibility against agreed commercial signals.</p></div>
          <p>An AI-native startup sells a model, an agent, or an AI-first application to businesses or developers. That is a different sale from software that happens to use AI inside. The questions arrive earlier, they come from legal and security as often as from the buyer, and most of them are answered on a page or not at all.</p>
          <p>Missing pages stall deals quietly. If a security reviewer cannot find your retention answer, or an engineer cannot find your evaluation results, you drop out of the shortlist before anyone tries the product.</p>
        </div>
      </section>

      <section className="hr-questions" id="buyer-questions" aria-labelledby="buyer-questions-title">
        <div className="container">
          <div className="hr-section-head"><h2 id="buyer-questions-title">The AI-startup buyer questions your site needs to answer</h2></div>
          <div className="hr-table-wrap"><table><thead><tr><th>Buyer question</th><th>Evidence that answers it</th><th>Page that should carry it</th></tr></thead><tbody>{buyerQuestions.map(([question, evidence, page]) => <tr key={question}><th scope="row">{question}</th><td>{evidence}</td><td>{page}</td></tr>)}</tbody></table></div>
          <p className="hr-table-note">Each row is one decision, owned by one person, resolved on one page. A security reviewer should not read your product tour to find a retention window, and an engineer should not book a call to see an evaluation result.</p>
        </div>
      </section>

      <section className="hr-prose" aria-label="SEO for AI startups">
        <div className="container hr-narrow">
          <Section title="SEO for an AI startup starts with the security review">
            <p>The first question is almost always about data, and it is really three questions with three different answers. OpenAI answers all three in its own documentation. On training, its per-endpoint table reads No in the &quot;Data used for training&quot; column for every listed API endpoint. On retention, it states that &quot;By default, abuse monitoring logs are generated for all API feature usage and retained for up to 30 days, unless longer retention is required by law, or is reasonably necessary to protect our services or any third party from harm.&quot; On residency, it states that &quot;Data residency does not apply to system data, which may be processed and stored outside the selected region.&quot; Read the <a href="https://platform.openai.com/docs/guides/your-data">OpenAI data controls documentation</a> and then write the same three answers for your own product.</p>
            <p>A page that answers only the training question fails the review. So does a page that promises residency without naming the exception.</p>
            <p>Governance is the second question, and the framework a buyer names is usually the NIST AI Risk Management Framework. NIST is explicit that it &quot;is intended for voluntary use and to improve the ability to incorporate trustworthiness considerations into the design, development, use, and evaluation of AI products, services, and systems.&quot; It is a voluntary framework and it is not a law. Its core runs on four functions: Govern, Map, Measure, and Manage. Say which of the four you can evidence today. Read <a href="https://www.nist.gov/itl/ai-risk-management-framework">NIST&apos;s own page</a> before you write that section.</p>
            <p>If you provide a general-purpose model into the European market, the obligations are already live. The European Commission states that &quot;The AI Act rules on GPAI became effective in August 2025&quot;, and that &quot;The transparency rules of the AI Act will come into effect in August 2026.&quot; The first named provider obligation in <a href="https://artificialintelligenceact.eu/article/53/">Article 53</a> is a document: providers must &quot;draw up and keep up-to-date the technical documentation of the model, including its training and testing process and the results of its evaluation&quot;. If you hold that document, the page should say so.</p>
            <p>Then there is the badge problem. SOC is an assurance service, and the <a href="https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services">AICPA</a> defines it as &quot;a suite of service offerings CPAs may provide in connection with system-level controls of a service organization or entity-level controls of other organizations.&quot; The standard-setter is now warning about its own signal, carrying the headline &quot;Promises of &apos;fast and easy&apos; threaten SOC credibility&quot; on that page. A logo answers less than it once did. The fix is to offer the report and state its scope.</p>
            <p>The last one catches every startup built on someone else&apos;s model. Microsoft describes its Customer Copyright Commitment as &quot;a provision in the Microsoft Product Terms that describes Microsoft&apos;s obligation to defend customers against certain third-party intellectual property claims relating to Output Content&quot;, and conditions it on named mitigations the customer carries, starting with the rule that &quot;The customer offering must include a metaprompt directing the model to prevent copyright infringement in its output&quot;. Google Cloud scopes its own indemnity to an enumerated service list. You inherit a conditional, service-scoped indemnity. Your buyer will ask what you indemnify. That belongs on a page.</p>
          </Section>
          <Section title="Training and answer eligibility are separate switches">
            <p>Blocking AI crawlers is an avoidable mistake on an AI startup&apos;s website, and it usually comes from one confusion. Every platform runs separate agents for separate jobs, and only some of them decide whether you appear in an answer.</p>
            <p>OpenAI names the one that matters: &quot;OAI-SearchBot is used to surface websites in search results in ChatGPT&apos;s search features&quot;, and &quot;Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers&quot;. It also states the split plainly, that a webmaster &quot;can allow OAI-SearchBot in order to appear in search results while disallowing GPTBot to indicate that crawled content should not be used for training OpenAI&apos;s generative AI foundation models&quot;. Read the <a href="https://platform.openai.com/docs/bots">OpenAI bots documentation</a> with your infrastructure owner.</p>
            <p>Perplexity draws the same line: &quot;PerplexityBot is designed to surface and link websites in search results on Perplexity. It is not used to crawl content for AI foundation models.&quot; Anthropic states the cost of getting it wrong: &quot;Disabling Claude-SearchBot on your site prevents our system from indexing your content for search optimization, which may reduce your site&apos;s visibility and accuracy in user search results.&quot; And Google separates the two completely, stating that &quot;Google-Extended does not impact a site&apos;s inclusion in Google Search nor is it used as a ranking signal in Google Search.&quot; Google-Extended governs Gemini training and grounding. It is not a Search switch.</p>
            <p>There is a second failure that no robots.txt file will reveal. Perplexity states that &quot;If you&apos;re using a Web Application Firewall (WAF) to protect your site, you may need to explicitly whitelist Perplexity&apos;s bots to ensure they can access your content&quot;. A bot allowed in robots.txt and blocked at the edge looks identical to a bot that was never invited. The highest-fidelity way to know which agent actually arrived is the server log, which is why we read them where the hosting allows it. Logs and probability-based visibility tools complement each other, so we use both. Our <Link href="/blog/server-logs-ai-bot-traffic-playbook">log-file playbook</Link> sets out the method.</p>
            <p>Google, for its part, publishes no separate entry ticket. It states that &quot;There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary&quot;, that a page must be &quot;indexed and eligible to be shown in Google Search with a snippet&quot;, and that &quot;There&apos;s also no special schema.org structured data that you need to add.&quot; What it does name is access and text: crawling allowed in robots.txt &quot;and by any CDN or hosting infrastructure&quot;, and &quot;important content is available in textual form&quot;. Those two items describe many AI startup websites. Read <a href="https://developers.google.com/search/docs/appearance/ai-features">Google&apos;s AI features documentation</a> and check both.</p>
            <p>One more mechanic changes how many pages you need. Google documents that its AI surfaces may issue &quot;multiple related searches across subtopics and data sources&quot; to build one response. One long page does not answer a fan-out. A set of pages that each resolve one question does.</p>
          </Section>
          <Section title="Publish the accuracy evidence a developer will check">
            <p>The most useful number for an AI startup selling to engineers is a trust statistic. Stack Overflow&apos;s 2025 Developer Survey reports that &quot;84% of respondents are using or planning to use AI tools in their development process&quot;, and, in the same survey, that &quot;More developers actively distrust the accuracy of AI tools (46%) than trust it (33%)&quot;. Positive sentiment fell from over 70% in 2023 and 2024 to 60% in 2025. The survey states its own scope: &quot;49,009 responses from 177 countries are used in these survey results.&quot;</p>
            <p>Read that pairing carefully. Engineers already accept that AI tools work. They need to know yours is accurate enough to be accountable for. Accuracy evidence is the conversion asset.</p>
            <p>So publish the eval. OpenAI defines evals as tests that &quot;test model outputs to ensure they meet style and content criteria that you specify&quot;, run &quot;especially when upgrading or trying new models&quot;. An eval claim without a dataset and a grader is the AI equivalent of research-backed with no study. Name the dataset, name the grader, name the threshold you ship at.</p>
            <p>The same rule governs your documentation surface. Hugging Face defines the model card as the README of a model repository and says what it should describe: the model, &quot;its intended uses &amp; potential limitations, including biases and ethical considerations&quot;, the training parameters, the datasets used to train the model, and &quot;the model&apos;s evaluation results&quot;. It also notes that the YAML metadata block in that README supports discovery of the model. GitHub says the same thing about repositories: &quot;A README is often the first item a visitor will see when visiting your repository&quot;, and topics exist so &quot;other people find and contribute to your project&quot;. For an AI startup, the model card and the README are search assets.</p>
          </Section>
          <Section title="Name the company so an engine can tell it apart">
            <p>An AI startup named after a common noun is competing with the dictionary. Google documents the fix. Organization structured data on the home page can help Google understand the organization, and one of the disambiguation properties is sameAs, which Google defines as &quot;The URL of a page on another website with additional information about your organization&quot;. Pair that with one category sentence repeated on every surface you control. An engine can only repeat language it can find. Our guide to <Link href="/blog/entity-disambiguation-b2b-saas">entity disambiguation</Link> covers the work in full.</p>
            <p>Comparison pages are the other surface you own outright. The review sites run on algorithms: G2 states that &quot;A software&apos;s G2 Score is calculated using two scoring components: Satisfaction and Market Presence&quot;, that &quot;Because recent reviews are more relevant to buyers, older reviews are weighted less&quot;, and that its reviews &quot;do not constitute expert opinions based on objective criteria&quot;. You cannot edit that. You can publish your own comparison and alternatives pages, and a buyer choosing between two products will read them.</p>
          </Section>
        </div>
      </section>

      <section className="hr-feature hr-migration">
        <div>
          <h2>Results from three AI-native clients</h2>
          <p>Bluefyn (bluefyn.ai) builds &quot;The Proof Layer&quot;, an AI verification product. On a fixed set of tracked buyer prompts, comparing the first 30 days of the programme against the latest 30 days, AI visibility rose more than 5x and share of voice rose more than 5x against an unfiltered competitor set. ChatGPT visibility rose 13x. Average position when named improved to under 2. The two 30-day windows are 83 days apart, end to end.</p>
          <p>Pond (joinpond.ai) runs an AI workforce marketplace. AI visibility tripled from a near-zero base in the first four weeks, and average position when named improved from about 3 to about 2. The base is small and the programme is four weeks old, so read it as a standing start.</p>
          <p>Eraser (eraser.io) describes itself as &quot;AI for diagrams that matter&quot;, and its own site states, &quot;Create technical diagrams using AI&quot;. The <Link href="/case-studies/eraser">Eraser case study</Link> covers a website redesign and the maintenance work that followed it, and it publishes no percentage, no multiplier and no window.</p>
          <p>All three sell an AI product rather than software that uses AI internally. Outside the AI-native vertical, the <Link href="/case-studies/stealth-fintech-ai-visibility">Stealth Fintech</Link> and <Link href="/case-studies/genie-teacher-organic-growth">Genie Teacher</Link> case studies document the same method in other categories. The Bluefyn and Pond figures are AI visibility, share of voice and average position readings. None of them is a revenue figure.</p>
        </div>
        <div className="hr-feature-image ais-panel">
          <h3>Pond, first 14 days against the latest 14 days</h3>
          <ul className="ais-stats">
            <li><b>Tripled</b><span>AI visibility, from a near-zero base</span></li>
            <li><b>4x</b><span>Share of voice against an unfiltered competitor set</span></li>
            <li><b>About 2</b><span>Average position when named, from about 3</span></li>
          </ul>
        </div>
      </section>

      <section className="hr-measure"><div className="hr-measure-inner"><h2>Measure discovery work against the commercial signal</h2><p>Rankings, mentions and traffic show whether people find your material. On their own they do not prove that the work produced revenue.</p><p>LoudFace measures AI search work against revenue outcomes. Share of answers, citations, position when cited and sentiment are tracked on each engine separately, and clicks and impressions come from your own Search Console property. We set the source, the window, the attribution limit and the owner before anyone draws a conclusion.</p><p>We also publish our own limits. LoudFace holds no evidenced revenue figure attributable to AI search yet, and says so on the <Link href="/methodology">methodology page</Link> rather than leading with the chart that went up. Expect the same honesty about your programme.</p></div></section>

      <section className="hr-prose" aria-label="Where to start"><div className="container hr-narrow">
        <Section title="Start with the pages your security questionnaire keeps asking for">
          <p>The fastest useful backlog is already in your sales inbox. Look at what your team attaches after a demo, and at the questions that reappear in every security review. Those attachments should be indexed pages.</p>
          <p>Then decide which pages need to exist first:</p>
          <ol>
            <li>A category page that states what the product is, who uses it, and what it replaces.</li>
            <li>A data-handling page that separates training, retention and residency, each with its control.</li>
            <li>A governance page that names the framework you map to and the documentation you hold.</li>
            <li>An accuracy page that publishes the eval, the dataset and the grader.</li>
            <li>A model card, a README and a quickstart an engineer can finish without a call.</li>
          </ol>
          <p>If you are comparing agencies, read our guide to the <Link href="/blog/best-seo-aeo-agencies-ai-startups-2026">best SEO and AEO agencies for AI startups</Link>.</p>
          <p>LoudFace scopes the work around your category, your buyer, your current site and your commercial goals. Start with an <Link href="/ai-audit">AI visibility audit</Link> when you need your AI search presence scored against your competitors, with one fix you can implement within a week. Engagements start from $5k/mo, and the <Link href="/pricing">pricing page</Link> explains the Solo, Dual, and Scale plan structure.</p>
        </Section>
      </div></section>

      <section className="hr-faq" aria-labelledby="ai-startups-faq-title"><div className="container hr-faq-grid"><div><h2 id="ai-startups-faq-title">Frequently asked questions</h2><a href="#book-modal" data-cal-trigger className="btn btn-ink btn-lg">Book an intro call</a></div><div className="hr-faq-list">{AI_STARTUPS_FAQ_ITEMS.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span className="hr-plus" aria-hidden="true"></span></summary><div className="hr-faq-answer"><p>{answer}</p></div></details>)}</div></div></section>

      <section className="hr-cover" id="book"><div className="container"><p className="hr-label">Intro call</p><h2>Talk to us when you need a clear scope.</h2><p>Not a promise that more pages alone will win a security review.</p><a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg">Book an intro call</a></div></section>
      <FooterV3 />
      <ServiceV3Scripts />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="hr-prose-section"><h2>{title}</h2>{children}</section>;
}

function Arrow() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
