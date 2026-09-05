import Image from 'next/image';
import Link from 'next/link';
import { FooterV3 } from '../home-v3/FooterV3';
import { ServiceV3Scripts } from '../service-v3/Scripts';

const CEIPAL_IMAGE =
  'https://cdn.sanity.io/images/xjjjqhgt/production/f55193c1f6d27fc7eba183eb133dd07e40fb7aad-2880x1800.png';

const buyerQuestions = [
  ['Does this platform fit our HRIS or ATS?', 'The integration model, system boundaries, and supported workflow', 'Integration page with plain documentation'],
  ['Can our software-data migration work with the systems we keep?', 'The source-system boundaries, data ownership, and vendor implementation plan', 'Product migration and implementation page owned by your product team'],
  ['Can our website migrate without losing search equity?', 'The URL inventory, redirects, metadata, ownership, and validation process', 'Website migration page'],
  ['Will payroll, recruiting, or people operations adopt it?', 'The role-specific workflow and change support', 'Use-case page for the relevant team'],
  ['How does procurement evaluate the vendor?', 'Scope, security, support, pricing model, references, and measurement', 'Evaluation checklist and proof page'],
  ['Why should we shortlist this product over an alternative?', 'A clear category position and honest trade-offs', 'Comparison or alternatives page'],
] as const;

export const HR_FAQ_ITEMS = [
  ['What does SEO for HR tech SaaS cover?', 'It covers the website and content that help HR software buyers find and evaluate your product through Google. For an HRIS, ATS, payroll, or workforce platform, that usually means category, use-case, integration, comparison, website-migration, and proof pages. LoudFace supports the website and content work around a website migration.'],
  ['How does AEO apply to HR software?', 'AEO makes the important answers on your site easier to extract when buyers ask AI systems about HR software categories, integrations, or alternatives. It uses clear answer blocks, evidence, consistent terminology, and pages that resolve one buyer question at a time. It does not guarantee that an AI system will recommend a product.'],
  ['What is GEO for an HR tech company?', "GEO is website and content work that helps a brand become understandable in generative search. For HR tech, that means clear category language, source-backed product and integration pages, and material that supports a buyer's evaluation. The work aims to improve the available evidence. It does not promise a citation or a revenue outcome."],
  ['Which HR tech buyer questions should a search strategy cover?', "Our recommendation is to cover the product category, target team, payroll and data flows, product-migration approach, and procurement requirements. SHRM's 2026 vendor checklist supports checking integration with an existing HRIS or ATS, training, support, price clarity, hidden fees, ROI measurement, references, and case studies. Keep a separate website-migration page for URLs, redirects, metadata, and search preservation."],
  ['Can LoudFace help during an HR tech website migration?', 'Yes. LoudFace can scope the search and content requirements around a website migration. Its CEIPAL case study documents a WordPress to Webflow migration that covered more than 150 static pages and 1,082 CMS entries. That proof is about website migration and SEO preservation. It is not proof of a product-data migration or an AI-search revenue result.'],
  ['How does LoudFace measure HR tech search work?', 'LoudFace connects visibility signals to the commercial actions that matter to the business, such as signups, booked demos, and other lead capture. The agreed measurement plan should define the source data, attribution limits, owner, and review cadence before conclusions are made. A visibility change alone does not prove that the work generated revenue.'],
] as const;

export function HRTechPage() {
  return (
    <>
      <section className="hr-hero hero" aria-labelledby="hr-tech-title">
        <div className="container hr-hero-grid">
          <div className="hr-hero-copy">
            <h1 id="hr-tech-title" className="rv">SEO, AEO and GEO for HR Tech SaaS</h1>
            <p className="hero-sub rv" style={{ ['--d' as string]: '.12s' }}>
              HR tech search work needs to answer the questions buyers ask before they trust a new HRIS, ATS, payroll, or workforce platform.
            </p>
            <div className="hero-cta rv" style={{ ['--d' as string]: '.18s' }}>
              <a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg">Book an intro call</a>
              <Link href="#buyer-questions" className="tlink">See the buyer questions <Arrow /></Link>
            </div>
          </div>
          <div className="hr-hero-proof rv" style={{ ['--d' as string]: '.14s' }}>
            <div className="mat">
              <div className="plate">
                <div className="bar" aria-hidden="true"><b></b><b></b><b></b><span>ceipal.com</span></div>
                <div className="shot"><Image src={`${CEIPAL_IMAGE}?w=1080&h=836&fit=crop&crop=top&fm=webp&q=82`} alt="CEIPAL website migrated by LoudFace from WordPress to Webflow" width={1080} height={836} priority /></div>
              </div>
            </div>
            <span className="hr-proof-note">WordPress → Webflow<br />150+ static pages · 1,082 CMS entries</span>
          </div>
        </div>
      </section>

      <section className="hr-answer" aria-label="Short answer">
        <div className="container hr-narrow">
          <div className="hr-short-card"><p className="hr-label">The short answer</p><p className="hr-lede">HR tech search work needs to answer the questions buyers ask before they trust a new HRIS, ATS, payroll, or workforce platform. LoudFace connects SEO for Google, AEO for answer engines, and GEO for generative search through website and content work. We build category, integration, comparison, and proof pages that help a buyer understand your product. Then we measure visibility against agreed commercial signals.</p></div>
          <p>HR software buyers do not arrive with one simple keyword. They compare categories, systems, data flows, implementation paths, and vendors. Your site needs to make those answers easy to find and easy to trust.</p>
          <p>The basic point is practical. An HRIS often acts as the core people-data system. ATS, payroll, learning, engagement, and analytics tools need to fit around it without creating duplicate or conflicting records. <a href="https://www.shrm.org/topics-tools/workplace/understanding-hr-technology-value-business-transformation">SHRM&apos;s HR technology overview</a> explains that relationship clearly.</p>
        </div>
      </section>

      <section className="hr-questions" id="buyer-questions" aria-labelledby="buyer-questions-title">
        <div className="container">
          <div className="hr-section-head"><h2 id="buyer-questions-title">The HR-tech buyer questions your site needs to answer</h2></div>
          <div className="hr-table-wrap"><table><thead><tr><th>Buyer question</th><th>What the page needs to prove</th><th>Search asset to build</th></tr></thead><tbody>{buyerQuestions.map(([question, proof, asset]) => <tr key={question}><th scope="row">{question}</th><td>{proof}</td><td>{asset}</td></tr>)}</tbody></table></div>
          <p className="hr-table-note">This is not a request to publish generic articles. Each page should solve one decision. A buyer should not have to infer how your ATS connects to an HRIS. They should also not confuse a product-data migration with a website migration.</p>
        </div>
      </section>

      <section className="hr-prose" aria-label="SEO for HR software">
        <div className="container hr-narrow">
          <Section title="SEO for HR software starts with product fit"><p>For HR tech, SEO starts with the pages that answer buyer questions: category terms, role-specific use cases, integrations, alternatives, comparisons, and clear website-migration evidence. The product team owns software implementation. LoudFace works on the website and content that explain the buyer&apos;s path.</p><p>The pages must also use the terms your product team and buyers use. If you sell recruiting software, say ATS, candidate workflow, talent acquisition, and the named systems you connect to. If you sell payroll software, explain the payroll, time, and core-HR relationship. If you sell a broader HCM platform, show where the platform owns data and where it connects to another system.</p><p>This is not only a content issue. <a href="https://www.shrm.org/content/dam/en/shrm/topics-tools/tools/checklists/ai-tool-hr-vendor-evaluation-checklist-02-11-2026.pdf">SHRM&apos;s 2026 vendor checklist</a> includes integration with an existing HRIS or ATS, training, support, price clarity, hidden fees, ROI measurement, references, and case studies. Your discovery content should make those answers available before the first sales call.</p></Section>
          <Section title="Make the answers easy to extract and verify"><p>Answer engines need a direct, well-supported answer on your site. For an HR-tech company, that does not mean writing for a machine. It means placing the useful answer before the sales language. A good integration page says what connects, what data moves, who owns the setup, and where the limits are. A product-migration page should come from the product team. A website-migration page should say what URLs move, what redirects, and what gets checked.</p><p>That structure also helps people decide. It puts the evidence beside the buying question and keeps integration detail easy to find. It shows what changes in daily work. Sales can reuse the answer.</p></Section>
          <Section title="Build material that represents the product accurately"><p>Generative search needs material that helps it understand, retrieve, and cite the product accurately. LoudFace uses genuinely original work based on your own expertise, buyer questions, implementation experience, and defensible proof. Public product documentation can be copied. The value comes from the judgment that turns that material into a useful answer for a real evaluation.</p><p>We then select relevant external places for that material when the fit is real. We do not treat a high volume of low-value placements as a method. Read the <Link href="/methodology">LoudFace methodology</Link> for the operating model.</p><p>The goal is not to promise that an AI system will name you. The goal is to give buyers and search systems a clearer, stronger body of evidence for why they should understand your product correctly.</p></Section>
        </div>
      </section>
          <section className="hr-feature hr-migration"><div><h2>Keep product-data migration and website migration separate</h2><p>HR data moves can be gradual. Oracle documents both full and coexistence HCM implementations. In a coexistence model, an existing HR application can remain the system of record for some data while other data moves permanently. <a href="https://docs.oracle.com/en/cloud/saas/human-resources/fahdl/hcm-data-loader-and-implementation-scenarios.html">Oracle&apos;s implementation guidance</a> shows why your product team must state the system boundaries.</p><p>That gives the website a useful content standard. State what the integration covers. The page should describe the systems, data flow, and setup owner. Do not say only that product migration is easy. The product team should show the sequence, people, data, and checks. LoudFace supports the website and content work around a website migration.</p><p>LoudFace has relevant website-migration experience. In the <Link href="/case-studies/ceipal-wp-to-wf-migration">CEIPAL case study</Link>, we migrated an HR-platform website from WordPress to Webflow. The work covered more than 150 static pages and 1,082 CMS entries. It preserved SEO through careful redirect and meta-tag handling. This is website-migration proof. It is not an AI-search revenue or pipeline claim.</p></div><div className="hr-feature-image"><Image src={`${CEIPAL_IMAGE}?w=900&h=620&fit=crop&crop=top&fm=webp&q=82`} alt="CEIPAL website migration proof" width={900} height={620} loading="lazy" /><span>CEIPAL · WordPress to Webflow</span></div></section>
          <section className="hr-measure"><div className="hr-measure-inner"><h2>Measure discovery work against the commercial signal</h2><p>Rankings, mentions, and traffic can show whether people find your material. They do not prove that the work created revenue on their own.</p><p>LoudFace sets the measurement plan before it makes a conclusion. We connect search visibility to the commercial actions that matter to the business, such as signups, booked demos, and other lead capture. Then we state the source, time window, attribution limit, and what the data can actually support.</p><p>That approach stops a visibility report from becoming a vanity report. It also gives product marketing, sales, and leadership a shared way to judge the work.</p></div></section>
      <section className="hr-prose" aria-label="Sales questions"><div className="container hr-narrow">
          <Section title="Start with the pages your sales team keeps explaining"><p>The fastest useful backlog usually comes from repeated buyer questions. Review sales calls, implementation notes, support themes, and product documentation. Find the questions that force your team to explain how the product fits a real HR stack.</p><p>Then decide which pages need to exist first:</p><ol><li>A category page that states what the product is and who it serves.</li><li>Integration pages for the systems that appear in active evaluations.</li><li>A migration or implementation page that explains the operating path.</li><li>A comparison page where a buyer needs an honest decision.</li><li>A proof page that gives procurement a reason to trust the plan.</li></ol><p>If you are comparing agencies, read our existing guide to the <Link href="/blog/best-aeo-agencies-hr-tech-saas-2026">best SEO and AEO agencies for HR tech SaaS</Link>. It is a separate resource. This page is about building the search and answer foundation for your HR-tech product.</p><p>LoudFace scopes the work around your category, stack, current site, and commercial goals. Start with an <Link href="/ai-audit">AI visibility audit</Link> when you need a clear first backlog. The <Link href="/pricing">pricing page</Link> explains the current Solo, Dual, and Scale plan structure. Talk to us when you need a clear scope, not a promise that more pages alone will create pipeline.</p></Section>
        </div>
      </section>

      <section className="hr-faq" aria-labelledby="hr-faq-title"><div className="container hr-faq-grid"><div><h2 id="hr-faq-title">Frequently asked questions</h2><a href="#book-modal" data-cal-trigger className="btn btn-ink btn-lg">Book an intro call</a></div><div className="hr-faq-list">{HR_FAQ_ITEMS.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span className="hr-plus" aria-hidden="true"></span></summary><div className="hr-faq-answer"><p>{answer}</p></div></details>)}</div></div></section>

      <section className="hr-cover" id="book"><div className="container"><p className="hr-label">Intro call</p><h2>Talk to us when you need a clear scope.</h2><p>Not a promise that more pages alone will create pipeline.</p><a href="#book-modal" data-cal-trigger className="btn btn-white btn-lg">Book an intro call</a></div></section>
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
