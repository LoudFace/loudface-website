import Link from 'next/link';
import { FooterV3 } from '../home-v3/FooterV3';
import { ServiceV3Scripts } from '../service-v3/Scripts';

const buyerQuestions = [
  ['Is this approved for purchase under our procurement rules?', 'Pricing model, contract terms, security review, accessibility conformance, and named references', 'Procurement and security page a district can forward without a call'],
  ['What evidence tier does this product hold under ESSA?', 'The study design, the sample, the sites, and which tier the finding supports', 'Evidence page that states the study and the tier in plain language'],
  ['How do you handle student records under FERPA?', 'What data you hold, who controls it, how records are inspected and amended, and who the school-official designation covers', 'Student data privacy page owned by your legal and product teams'],
  ['Do you comply with the amended COPPA Rule for under-13 users?', 'Parental consent flow, third-party disclosure, retention limits, and the identifiers you collect', 'Children privacy page with the consent and retention detail'],
  ['Will it roster and sign in with the systems we already run?', 'Supported rostering and SSO paths, the SIS fields you read, and the setup owner', 'Integration page for Clever, ClassLink, Google Classroom, and your SIS'],
  ['How does a single-school pilot become a district contract?', 'Pilot scope, success measures, training load, and the renewal committee evidence pack', 'Pilot-to-district page plus a renewal evidence summary'],
] as const;

export const EDTECH_FAQ_ITEMS = [
  ['What does SEO for edtech SaaS cover?', 'It covers the website and content that help school, district, and university buyers find and evaluate your product through Google. For a curriculum, assessment, tutoring, LMS, or student-success platform, that usually means category, evidence, privacy, rostering, comparison, and procurement pages. Teachers, administrators, and budget owners each need a page that answers their part of the decision.'],
  ['How does AEO apply to education software?', 'AEO makes the important answers on your site easier to extract when a curriculum director or IT lead asks an AI system about a product category, an evidence claim, or a rostering path. It uses direct answer blocks, cited evidence, consistent terminology, and pages that resolve one buyer question at a time. It does not guarantee that an AI system will recommend a product.'],
  ['What is GEO for an edtech company?', 'GEO is website and content work that helps a brand become understandable in generative search. For edtech, that means clear category language, source-backed evidence and privacy pages, and material that supports an institutional evaluation. The work aims to improve the available evidence. It does not promise a citation or a revenue outcome.'],
  ['Which edtech buyer questions should a search strategy cover?', 'Our recommendation is to cover the product category, the classroom user, the evidence base, student data privacy, rostering and sign-in, and the procurement path. The What Works Clearinghouse defines Tier 1 strong evidence and Tier 2 moderate evidence, each requiring a statistically significant positive effect, at least 350 students, and at least two educational sites. If your study does not meet a tier, say so on the page rather than implying it does.'],
  ['Does LoudFace have education clients?', 'Yes. The Genie Teacher case study documents a tutoring marketplace whose AI visibility moved from 5.26% on 25 May 2026 to a peak of 28.39% on 20 July 2026, with AI share of voice moving from 2.26% to 12.94% over 25 May to 24 August 2026. The CodeOp engagement, a coding bootcamp, recorded +49% organic clicks and +43% search impressions between 11 May and 11 September 2024. Those are visibility and traffic figures. They are not proof of a district contract.'],
  ['How does LoudFace measure edtech search work?', 'LoudFace connects visibility signals to the commercial actions that matter to the business, such as demo requests, pilot signups, and other lead capture. The agreed measurement plan should define the source data, attribution limits, owner, and review cadence before conclusions are made. A visibility change alone does not prove that the work generated revenue.'],
] as const;

export function EdTechPage() {
  return (
    <>
      <section className="hr-hero hero" aria-labelledby="edtech-title">
        <div className="container hr-hero-grid">
          <div className="hr-hero-copy">
            <h1 id="edtech-title" className="rv">SEO, AEO and GEO for EdTech SaaS</h1>
            <p className="hero-sub rv" style={{ ['--d' as string]: '.12s' }}>
              In education software the user, the buyer, and the budget owner are three different people. Your site has to answer all three before procurement starts.
            </p>
            <div className="hero-cta rv" style={{ ['--d' as string]: '.18s' }}>
              <a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg">Book an intro call</a>
              <Link href="#buyer-questions" className="tlink">See the buyer questions <Arrow /></Link>
            </div>
          </div>
          <div className="hr-hero-proof rv" style={{ ['--d' as string]: '.14s' }}>
            <div className="mat">
              <div className="plate">
                <div className="bar" aria-hidden="true"><b></b><b></b><b></b><span>genieteacher.com</span></div>
                <div className="ed-panel">
                  <h3>Genie Teacher, 25 May to 24 August 2026</h3>
                  <ul className="ed-stats">
                    <li><b>5.26% to 28.39%</b><span>AI visibility, from 25 May 2026 to a peak on 20 July 2026</span></li>
                    <li><b>2.26% to 12.94%</b><span>AI share of voice over the same window</span></li>
                    <li><b>1.1</b><span>Average position in AI search, 30-day window ending 19 August 2026</span></li>
                  </ul>
                </div>
              </div>
            </div>
            <span className="hr-proof-note">Tutoring marketplace<br />Figures from the Genie Teacher case study</span>
          </div>
        </div>
      </section>

      <section className="hr-answer" aria-label="Short answer">
        <div className="container hr-narrow">
          <div className="hr-short-card"><p className="hr-label">The short answer</p><p className="hr-lede">EdTech search work has to satisfy an institution, not a single user. A teacher tries the product, a curriculum lead checks the evidence, an IT lead checks rostering and student data, and a budget owner signs. LoudFace connects SEO for Google, AEO for answer engines, and GEO for generative search through website and content work. We build the category, evidence, privacy, integration, and procurement pages those four people each need, then measure visibility against agreed commercial signals.</p></div>
          <p>A district shortlist forms across a pilot, a committee review, a security questionnaire, and a renewal vote. Every one of those steps sends someone to your website looking for a specific document.</p>
          <p>Missing pages stall deals quietly. If a curriculum director cannot find your evidence statement, or an IT lead cannot find your rostering detail, the product drops out before anyone tests it.</p>
        </div>
      </section>

      <section className="hr-questions" id="buyer-questions" aria-labelledby="buyer-questions-title">
        <div className="container">
          <div className="hr-section-head"><h2 id="buyer-questions-title">The edtech buyer questions your site needs to answer</h2></div>
          <div className="hr-table-wrap"><table><thead><tr><th>Buyer question</th><th>What the page needs to prove</th><th>Search asset to build</th></tr></thead><tbody>{buyerQuestions.map(([question, proof, asset]) => <tr key={question}><th scope="row">{question}</th><td>{proof}</td><td>{asset}</td></tr>)}</tbody></table></div>
          <p className="hr-table-note">Each row is one decision, owned by one person, resolved on one page. A teacher should not read a procurement page to understand the classroom workflow, and an IT lead should not email you to learn which rostering path you support.</p>
        </div>
      </section>

      <section className="hr-prose" aria-label="SEO for education software">
        <div className="container hr-narrow">
          <Section title="SEO for education software starts with the institution, not the user">
            <p>The person who loves your product is often not the person who can buy it. A teacher adopts a tool in one classroom. A district decides whether 40,000 students will use it. Two different searches, two vocabularies, two pages.</p>
            <p>So the page set splits by role. Classroom pages use the language teachers use: the subject, the grade band, the minutes it takes, what happens on a Chromebook. Institutional pages use the language of a purchase file: the evidence base, the privacy posture, the accessibility conformance report, the rostering path, the contract term. Both need to exist, and each needs to link to the other, because a teacher-led pilot is usually the route into the district.</p>
            <p>Name the systems you connect to, in the words the district uses. If you roster through Clever or ClassLink, say so on a page a buyer can send to their IT team. If you sign in through Google Classroom or a state SIS, name the fields.</p>
          </Section>
          <Section title="Make the evidence claim exact and checkable">
            <p>Evidence is the part edtech sites get wrong most often. A page that says research-backed and stops there gives a curriculum director nothing to file. The <a href="https://ies.ed.gov/ncee/wwc/essa">What Works Clearinghouse ESSA page</a> defines Tier 1 strong evidence as meeting WWC standards without reservations, and Tier 2 moderate evidence as meeting them with or without reservations. Both tiers require a statistically significant positive effect, a sample of at least 350 students, and at least two educational sites.</p>
            <p>Write the evidence page against that bar. State the study, the design, the sample, the sites, the effect, and the tier it supports. A stated limitation survives a committee review. An implied tier does not.</p>
            <p>The same rule applies to answer engines. A page that names its study and its tier gets quoted correctly. A page that gestures at research gets summarised into something you did not say.</p>
          </Section>
          <Section title="Publish the privacy answers before anyone asks for them">
            <p>Student data privacy is a purchase gate, so it belongs on an indexed page rather than a sales attachment. <a href="https://studentprivacy.ed.gov/ferpa">FERPA</a> gives parents and eligible students the right to inspect and review education records, to seek amendment of records they believe are inaccurate or misleading, and to consent to disclosures of personally identifiable information in those records. Those rights transfer to the student at 18 years of age or on attending a postsecondary institution. State how your product serves each one.</p>
            <p>If any user is under 13, the amended COPPA Rule applies. The <a href="https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data">FTC announcement</a> requires separate verifiable parental consent before disclosing children&apos;s personal information to third parties, limits retention to as long as reasonably necessary for the purpose the data was collected for, and expands personal information to include biometric and government-issued identifiers. Put your consent flow, your retention window, and your identifier list on the page. An IT lead will look for exactly those three things.</p>
            <p>Read the <Link href="/methodology">LoudFace methodology</Link> for how we sequence this work against the rest of the site.</p>
          </Section>
        </div>
      </section>

      <section className="hr-feature hr-migration">
        <div>
          <h2>Proof from education clients we have run</h2>
          <p>Genie Teacher connects families with certified teachers for tutoring, serving parents in Canada. In the <Link href="/case-studies/genie-teacher-organic-growth">Genie Teacher case study</Link>, AI visibility moved from 5.26% on 25 May 2026 to a peak of 28.39% on 20 July 2026, settling at 9.17%. AI share of voice moved from 2.26% to 12.94% across 25 May to 24 August 2026. Average position in AI search was 1.1 in the 30-day window ending 19 August 2026, across 81 tracked buyer prompts.</p>
          <p>CodeOp, a coding bootcamp, recorded +49% organic clicks, +43% search impressions, a +26% lift in average keyword position, and +3% on click-through rate between 11 May and 11 September 2024. The percentages compare the first four weeks of the engagement against the last four weeks.</p>
          <p>These are visibility and traffic figures from named windows. They are not evidence of a district contract or a pipeline outcome.</p>
        </div>
        <div className="hr-feature-image ed-panel">
          <h3>Genie Teacher, at a glance</h3>
          <ul className="ed-stats">
            <li><b>5.4x</b><span>AI visibility increase over eight weeks, 25 May to 20 July 2026</span></li>
            <li><b>1 to 33</b><span>Google clicks per week, November 2025 to April 2026</span></li>
            <li><b>81</b><span>Tracked buyer prompts in the monitored category</span></li>
          </ul>
        </div>
      </section>

      <section className="hr-measure"><div className="hr-measure-inner"><h2>Measure discovery work against the commercial signal</h2><p>Rankings, mentions, and traffic show whether people find your material. On their own they do not prove that the work produced revenue.</p><p>LoudFace sets the measurement plan before it makes a conclusion. We connect search visibility to the commercial actions that matter, such as demo requests, pilot signups, and other lead capture. Then we state the source, time window, attribution limit, and what the data can actually support.</p><p>Education sales cycles run on academic calendars, so the review cadence has to match. A quarter spanning a summer break tells you less than the same quarter year over year.</p></div></section>

      <section className="hr-prose" aria-label="Where to start"><div className="container hr-narrow">
        <Section title="Start with the pages your sales team keeps sending by email">
          <p>The fastest useful backlog is already in your inbox. Look at what your team attaches to follow-up emails after a demo, and at the questions that reappear in every security review. Those attachments should be indexed pages.</p>
          <p>Then decide which pages need to exist first:</p>
          <ol>
            <li>A category page that states what the product is, which grade band it serves, and who uses it daily.</li>
            <li>An evidence page that names the study, the sample, and the ESSA tier it supports.</li>
            <li>A student data privacy page that answers FERPA and, where relevant, COPPA.</li>
            <li>An integration page for the rostering and sign-in paths your live deals name.</li>
            <li>A pilot-to-district page that shows the scope, the success measures, and the renewal evidence pack.</li>
          </ol>
          <p>If you are comparing agencies, read our guide to the <Link href="/blog/best-seo-aeo-agencies-edtech-saas">best SEO and AEO agencies for edtech SaaS</Link>.</p>
          <p>LoudFace scopes the work around your category, your institutional buyer, your current site, and your commercial goals. Start with an <Link href="/ai-audit">AI visibility audit</Link> when you need your AI search presence scored against your competitors, with one fix you can implement within a week. Engagements start from $5k/mo, and the <Link href="/pricing">pricing page</Link> explains the Solo, Dual, and Scale plan structure.</p>
        </Section>
      </div></section>

      <section className="hr-faq" aria-labelledby="edtech-faq-title"><div className="container hr-faq-grid"><div><h2 id="edtech-faq-title">Frequently asked questions</h2><a href="#book-modal" data-cal-trigger className="btn btn-ink btn-lg">Book an intro call</a></div><div className="hr-faq-list">{EDTECH_FAQ_ITEMS.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span className="hr-plus" aria-hidden="true"></span></summary><div className="hr-faq-answer"><p>{answer}</p></div></details>)}</div></div></section>

      <section className="hr-cover" id="book"><div className="container"><p className="hr-label">Intro call</p><h2>Talk to us when you need a clear scope.</h2><p>Not a promise that more pages alone will win a district.</p><a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg">Book an intro call</a></div></section>
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
