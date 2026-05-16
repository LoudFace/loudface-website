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

const DOC_ID = "imported-blogPost-69ac472eee2885129c273d3d";

const NEW_NAME = "Webflow for Healthcare in 2026: HIPAA, AEO, and the Split-Architecture Pattern";
const NEW_META_TITLE = "Webflow for Healthcare 2026: HIPAA + Split Architecture";
const NEW_META_DESCRIPTION =
	"Webflow for healthcare marketing sites in 2026: when it fits (marketing, education, lead-gen), when it doesn't (PHI, patient portals, EHR integration), and the split-architecture pattern that lets you have both.";
const NEW_EXCERPT =
	"Webflow handles healthcare marketing sites well but isn't HIPAA-eligible. The honest pattern splits the architecture: Webflow for marketing/education/lead-gen, HIPAA-compliant infrastructure for anything touching PHI.";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> Webflow is a strong CMS for healthcare marketing sites in 2026 when the use case is brand-led marketing, doctor-and-clinic profiles, patient education content, and lead-gen for non-PHI services. It is the wrong CMS for any site handling Protected Health Information (PHI): patient portals, EHR integrations, telehealth scheduling that stores patient data. The wrong call there is not Webflow specifically; it is using any non-HIPAA-compliant CMS for PHI. Webflow does not sign Business Associate Agreements (BAAs) and is not HIPAA-eligible. The honest pattern: Webflow for the marketing site, a HIPAA-compliant platform (Athenahealth, Epic MyChart, custom HIPAA-eligible build) for anything touching PHI.</p>

<p>I have shipped Webflow sites for healthcare clients across hospital systems, specialty clinics, medical device companies, and digital health startups. The pattern that wastes the most time: teams assume Webflow handles HIPAA because Webflow is "secure." It is not HIPAA-eligible. The honest architecture splits the marketing site (Webflow) from anything touching PHI (HIPAA-compliant infrastructure).</p>

<p>For broader Webflow context, see <a href="/blog/mastering-webflow-guide">Getting Started with Webflow in 2026</a>. For our healthcare industry landing page, see <a href="/seo-for/healthcare">/seo-for/healthcare</a>.</p>

<h2>The HIPAA constraint that decides the architecture</h2>

<p>HIPAA compliance for healthcare websites depends on a single question: does the site handle PHI? PHI includes any individually identifiable health information: patient names tied to medical conditions, appointment data, treatment histories, billing tied to specific diagnoses.</p>

<p>If the site never collects, stores, or transmits PHI, HIPAA does not apply. A clinic's marketing site with doctor profiles, service descriptions, and a generic "request an appointment" form (just name + phone + reason for visit, with the actual scheduling happening downstream in a HIPAA-compliant system) is not handling PHI at the website layer.</p>

<p>If the site does handle PHI (a patient portal, appointment scheduling with medical context, telehealth video chat, EHR integration), every system touching that data must be HIPAA-eligible, including the website infrastructure. Webflow is not.</p>

<p>Three things to know about Webflow + HIPAA in 2026:</p>

<ol>
<li><strong>Webflow does not sign BAAs.</strong> A Business Associate Agreement is required for any vendor that handles PHI under HIPAA. Webflow does not offer BAAs, so any PHI flowing through Webflow's infrastructure puts the covered entity in non-compliance.</li>
<li><strong>Webflow's underlying infrastructure (AWS) is HIPAA-eligible.</strong> But that doesn't transfer to Webflow customers. Webflow as the intermediary platform would need to sign its own BAAs and offer them downstream. It does not.</li>
<li><strong>The right architecture splits the site.</strong> Webflow handles the marketing site (no PHI). A HIPAA-eligible platform (Athenahealth, Epic MyChart, custom AWS HIPAA build) handles anything touching PHI.</li>
</ol>

<h2>When Webflow is the right call for healthcare</h2>

<p>Three patterns where Webflow delivers without HIPAA complications:</p>

<ol>
<li><strong>Specialty clinic marketing sites.</strong> Doctor bios, service pages, location-and-hours pages, patient education content, generic contact forms. Webflow's design flexibility helps brand-led healthcare marketing stand out from generic hospital templates.</li>
<li><strong>Medical device and digital health marketing sites.</strong> B2B-style sites targeting clinicians, hospital procurement, or investors. The buyer journey is research-heavy and benefits from Webflow's AEO-ready content architecture.</li>
<li><strong>Patient education content libraries.</strong> Programmatic SEO at scale for condition-specific or treatment-specific landing pages, all built as Webflow CMS Collections. As long as the content is general information (not patient-specific), Webflow handles this well.</li>
</ol>

<h2>When Webflow is the wrong call for healthcare</h2>

<p>Three patterns where the architecture splits:</p>

<ol>
<li><strong>Patient portals.</strong> Login-gated areas where patients view appointment history, lab results, prescription refills, or messages with their care team. These are PHI by definition. Use Athenahealth Patient Portal, Epic MyChart, Cerner PowerChart Patient, or a custom HIPAA-eligible build.</li>
<li><strong>Telehealth and scheduling with medical context.</strong> Video chat, appointment booking that captures symptoms, intake forms with clinical detail. PHI as soon as the form captures health information. Use Doxy.me, Mend, Zoom for Healthcare (HIPAA-compliant tier), or similar.</li>
<li><strong>EHR-integrated workflows.</strong> Anything reading or writing to the EHR (patient lookup, real-time clinical data, automated documentation). Use the EHR vendor's app marketplace (Epic App Orchard, Cerner App Gallery) or custom Web Services integrations on a HIPAA-eligible stack.</li>
</ol>

<h2>The split-architecture pattern</h2>

<p>The honest 2026 architecture for healthcare clients:</p>

<ul>
<li><strong>Webflow handles the marketing site.</strong> Service pages, doctor profiles, locations, education content, generic contact forms, lead-gen for non-PHI services.</li>
<li><strong>HIPAA-eligible system handles PHI.</strong> Patient portal, scheduling with clinical context, telehealth, EHR integration. Could be Athenahealth, Epic MyChart, or a custom build on HIPAA-eligible AWS.</li>
<li><strong>A clear handoff between them.</strong> The Webflow site's CTAs link to the patient portal subdomain (e.g., <code>patients.{domain}.com</code>). When a patient clicks "Book Appointment," they leave the Webflow marketing site and enter the HIPAA-compliant scheduling system.</li>
</ul>

<p>This is not unusual. Most healthcare organizations run a split architecture. The marketing site is the brand and lead-gen surface; the patient-facing system is the clinical layer. Webflow handles the first half well; HIPAA-eligible tools handle the second half.</p>

<h2>What Webflow ships well for healthcare marketing</h2>

<p>Four capabilities that matter specifically for healthcare:</p>

<ol>
<li><strong>Schema for healthcare entities.</strong> MedicalOrganization, Physician, MedicalSpecialty, MedicalCondition schema all supported via JSON-LD. Critical for getting cited in healthcare-related Google AI Overviews queries.</li>
<li><strong>YMYL-compliant content structure.</strong> Google's YMYL guidelines apply heavily to medical content. Named author attribution (Person schema with sameAs to medical credentials), clear date stamps (publishedDate + lastUpdated), citable sources, and conservative claim language all matter. Webflow ships the infrastructure for all of these.</li>
<li><strong>Multi-location support via CMS.</strong> A health system with 30 locations can ship 30 location pages from a single Webflow CMS template. Schema-tagged with LocalBusiness or MedicalOrganization. Each page gets its own SEO targeting without manual replication.</li>
<li><strong>AEO-ready patient education content.</strong> Direct-answer paragraphs on condition pages, structured FAQ blocks with FAQPage schema, question-phrased H2s matching what patients search for. Webflow makes this architecture cheap to ship.</li>
</ol>

<h2>The honest takeaway</h2>

<p>Webflow is one of the strongest CMS foundations for healthcare marketing sites in 2026. Brand-grade design, AEO-ready content architecture, multi-location support at CMS scale, healthcare-specific schema. It is not the right call for any system touching PHI, and the architecture that wins separates the two cleanly.</p>

<p>Healthcare clients who treat the marketing site and the patient-facing system as one platform decision end up either compromising on compliance or compromising on marketing design. The split-architecture pattern lets you have both.</p>

<p>If you are evaluating Webflow for a healthcare marketing site, or want help structuring the split between marketing (Webflow) and clinical (HIPAA-eligible), <a href="/services/seo-aeo">we run healthcare Webflow engagements as part of our SEO + AEO program</a>.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "Is Webflow HIPAA compliant?",
		answer:
			"<p>No. Webflow is not HIPAA-eligible and does not sign Business Associate Agreements (BAAs). Webflow's underlying infrastructure (AWS) is HIPAA-eligible, but that doesn't transfer to Webflow customers — Webflow would need to sign its own BAAs and offer them downstream, which it doesn't. Any healthcare organization handling PHI through Webflow's infrastructure puts itself in non-compliance. The correct pattern is to keep PHI out of Webflow entirely.</p>",
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "Can I use Webflow for a healthcare marketing site?",
		answer:
			"<p>Yes, when the marketing site doesn't handle PHI. Clinic marketing sites with doctor bios, service pages, location-and-hours pages, patient education content, and generic contact forms (name + phone + general reason for visit, no clinical detail) are not handling PHI and can run on Webflow without compliance issues. The handoff to HIPAA-compliant scheduling or patient portals happens via subdomain or external link.</p>",
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "What is the split-architecture pattern for healthcare websites?",
		answer:
			"<p>An architecture where the public marketing site lives on a non-HIPAA platform (Webflow, for design and content advantages) and anything touching PHI lives on a HIPAA-eligible platform (Athenahealth, Epic MyChart, custom AWS HIPAA build). The two systems link via subdomains: the Webflow site at <code>{domain}.com</code>, the patient portal at <code>patients.{domain}.com</code>. When a patient clicks 'Book Appointment' on the marketing site, they leave Webflow and enter the HIPAA-compliant scheduling system. Most healthcare organizations already run something like this.</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "What schema markup matters for healthcare marketing sites?",
		answer:
			"<p>Five healthcare-specific schema types via JSON-LD: MedicalOrganization (for the practice or hospital), Physician (for doctor profile pages), MedicalSpecialty (for specialty service pages), MedicalCondition (for patient education pages), and Person schema with medical credential sameAs links (for named medical author attribution under YMYL guidelines). These are critical for getting cited in healthcare-related Google AI Overviews queries and for E-E-A-T signals on YMYL medical content.</p>",
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "Does Webflow handle multi-location healthcare practices?",
		answer:
			"<p>Yes, via CMS Collections. A health system with 30 locations can ship 30 location pages from a single Webflow CMS template. Each location item has its own address, phone, hours, services, and physician roster (via multi-reference to a Physician Collection). Schema-tagged with LocalBusiness or MedicalOrganization. Each page gets its own SEO targeting (location-specific meta tags, location-specific structured data) without manual page replication. Standard plans cap CMS items at 10,000 per Collection; Enterprise pushes to 50,000+.</p>",
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "When should I NOT use Webflow for a healthcare site?",
		answer:
			"<p>Three patterns. (1) Patient portals — login-gated areas where patients view appointment history, lab results, prescriptions, or care team messages — these are PHI by definition; use Athenahealth, Epic MyChart, Cerner PowerChart, or a custom HIPAA-eligible build. (2) Telehealth or scheduling that captures medical context (symptoms, clinical detail in intake forms) — use Doxy.me, Mend, or Zoom for Healthcare (HIPAA tier). (3) EHR-integrated workflows reading or writing patient data — use Epic App Orchard, Cerner App Gallery, or custom integrations on HIPAA-eligible infrastructure.</p>",
	},
	{
		_key: "faq7",
		_type: "faqItem",
		question: "How do AI engines like ChatGPT or Google AI Overviews handle healthcare content?",
		answer:
			"<p>Cautiously. Healthcare content falls under YMYL (Your Money or Your Life) guidelines, which means Google and AI engines hold it to elevated quality standards. AI engines often add caveats to medical answers (\"consult a doctor\") and cite authoritative sources (Mayo Clinic, NIH, peer-reviewed journals) over generic content. To get cited by AI engines in healthcare: ship content with named medical author attribution, clear date stamps, citable sources, conservative claim language, and proper schema (MedicalOrganization, Physician, MedicalCondition). Webflow ships the infrastructure for all of this.</p>",
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

console.log(`✓ Refreshed /blog/webflow-for-healthcare`);
console.log(`  _rev: ${result._rev}`);
