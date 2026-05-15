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

const DOC_ID = "imported-blogPost-67be8cab29c9c6a1b94a0c60";

const NEW_NAME = "Google Calendar + Webflow in 2026: Three Approaches and Which to Pick";
const NEW_META_TITLE = "Google Calendar + Webflow 2026: Native Embed vs Booking Tools";
const NEW_META_DESCRIPTION =
	"How to add Google Calendar to a Webflow site in 2026: native iframe embed for display-only calendars, Cal.com or Calendly for actual bookings, custom API integration for special scheduling logic.";
const NEW_EXCERPT =
	"Three ways to add Google Calendar to Webflow: iframe embed (display only), Cal.com or Calendly booking layer (the B2B SaaS default), or custom API integration. Here's which to pick based on whether visitors view or book.";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> Three honest ways to add Google Calendar to a Webflow site in 2026. (1) Embed a public Google Calendar via iframe for browse-only public events (lowest-friction). (2) Use Cal.com or Calendly as a booking layer when you need site visitors to schedule meetings — both ship Webflow integrations and handle the meeting logic Google Calendar's native embed cannot. (3) Build a custom booking flow via the Google Calendar API when off-the-shelf tools cannot match your specific scheduling logic. The default for B2B SaaS sites is Cal.com or Calendly rather than the native Google Calendar embed.</p>

<p>I have shipped Google Calendar integrations on B2B SaaS Webflow sites for two years. The pattern that wastes the most time: teams embed the public Google Calendar iframe expecting it to handle bookings, then realize it only displays events — buyers can't actually book a meeting through it. The native Google Calendar embed is a display widget. It is not a booking tool. For B2B SaaS, the right tool is usually Cal.com or Calendly, with Google Calendar as the backend the booking tool syncs against.</p>

<p>For broader Webflow context, see <a href="/blog/mastering-webflow-guide">Getting Started with Webflow in 2026</a>.</p>

<h2>What Google Calendar's native embed does and doesn't do</h2>

<p>Google Calendar's "embed code" generates an iframe that displays a calendar's events on a webpage. It is read-only from the visitor's perspective. They can see your events, click into them, see details. They cannot book a meeting, sync to their own calendar, or interact beyond viewing.</p>

<p>This is the right tool for:</p>

<ul>
<li>Public event calendars on community sites (conference schedules, public meetups)</li>
<li>Internal team calendars displayed on an intranet</li>
<li>Office hours / availability windows for community-facing pages</li>
</ul>

<p>This is the wrong tool for:</p>

<ul>
<li>Booking pages on B2B SaaS sites where the visitor needs to schedule a meeting</li>
<li>Customer-facing scheduling (consultations, demos, support windows)</li>
<li>Any case where you need the visitor to take action rather than just view</li>
</ul>

<h2>Approach 1: Native Google Calendar iframe embed</h2>

<p>The right call when the calendar is for display only.</p>

<h3>How to embed</h3>

<p>In Google Calendar, open Settings → Settings for my calendars → pick the calendar → Integrate calendar. Copy the iframe embed code. Paste into a Webflow HTML Embed element wherever the calendar should appear. The iframe accepts customization parameters in the URL (show only specific calendars, hide weekends, choose color theme, set default view to month/week/agenda).</p>

<h3>Customization tips</h3>

<ul>
<li>Make the calendar public via Google Calendar Settings → Access permissions → Make available to public. The iframe will not render to logged-out visitors otherwise.</li>
<li>Set the iframe's allowed parameters for cleaner display: <code>&amp;showTitle=0&amp;showPrint=0&amp;showCalendars=0</code> strips the default Google Calendar header chrome.</li>
<li>Constrain height with the iframe's <code>height</code> attribute and Webflow's responsive sizing on the parent container.</li>
</ul>

<h3>When to skip this approach</h3>

<p>When visitors need to book, not view. The iframe does not handle bookings. Use Cal.com or Calendly instead.</p>

<h2>Approach 2: Cal.com or Calendly booking layer (the default for B2B SaaS)</h2>

<p>The right call for almost every B2B SaaS Webflow site that needs scheduling.</p>

<h3>Why a booking tool wins over raw Google Calendar</h3>

<p>A booking tool (Cal.com, Calendly, SavvyCal, Reclaim) sits between the visitor and your Google Calendar. The visitor sees available time slots, picks one, fills in their info, gets a confirmation. The booking tool creates the calendar event on your Google Calendar, sends notifications, handles reschedules and cancellations, and integrates with Zoom or Google Meet for the meeting link.</p>

<p>This is the use case 95% of B2B SaaS sites need when they "add a calendar to Webflow." The native Google Calendar embed cannot do it.</p>

<h3>How to integrate Cal.com or Calendly with Webflow</h3>

<p>Both tools ship Webflow integrations. The standard pattern:</p>

<ol>
<li><strong>Connect the booking tool to Google Calendar.</strong> In Cal.com or Calendly settings, authenticate with the Google account whose calendar holds your availability. The booking tool reads your busy times and writes new events as they get booked.</li>
<li><strong>Configure event types.</strong> In the booking tool, create event types matching your scheduling needs (15-min intro call, 30-min demo, 60-min consultation). Set duration, padding, available days/hours, custom intake questions.</li>
<li><strong>Embed in Webflow.</strong> Both tools provide embed code: an iframe for the full booking page, or a "popup" trigger that opens the booking flow when a Webflow button is clicked. Paste into a Webflow HTML Embed element. For the popup approach, add the trigger script to Webflow's footer custom code, then add a button with the matching class or data attribute.</li>
<li><strong>Style the booking widget.</strong> Cal.com is fully customizable (colors, fonts, layout match your design system). Calendly is more constrained but supports brand colors via the paid tier. Pick based on whether design consistency matters more than booking-flow simplicity.</li>
</ol>

<h3>Which booking tool to pick</h3>

<table class="summary_table"><thead><tr><th>Use case</th><th>Cal.com</th><th>Calendly</th></tr></thead>
<tbody>
<tr><td>Free tier</td><td>Generous (unlimited event types)</td><td>Limited (1 event type)</td></tr>
<tr><td>Self-hosted option</td><td>Yes (open source)</td><td>No</td></tr>
<tr><td>Design customization</td><td>High (matches your design system)</td><td>Medium (brand color on paid tier)</td></tr>
<tr><td>Enterprise features</td><td>Strong (team scheduling, SSO)</td><td>Strong (Salesforce, HubSpot deep integrations)</td></tr>
<tr><td>Default for B2B SaaS in 2026</td><td>The growing choice</td><td>The incumbent</td></tr>
</tbody></table>

<h2>Approach 3: Custom booking flow via Google Calendar API</h2>

<p>The right call when off-the-shelf tools cannot match your specific scheduling logic.</p>

<h3>When to build custom</h3>

<ul>
<li>You need scheduling logic that Cal.com and Calendly cannot express (e.g., round-robin across an account team with complex availability constraints, scheduling tied to a customer's plan tier in your product)</li>
<li>You want the booking UX to live entirely on your Webflow domain without iframe embeds</li>
<li>The booking is part of a product feature, not just a marketing-site CTA</li>
</ul>

<h3>How to build it</h3>

<p>Use Google Calendar API's REST endpoints from a custom backend (Webflow Cloud function, Vercel function, your product API). The backend authenticates with the user's Google account via OAuth, queries free/busy times, presents available slots in the Webflow frontend, accepts the visitor's booking, and creates the calendar event. Webflow itself only handles the UI; the auth and calendar logic live in the backend.</p>

<h3>When to skip custom</h3>

<p>For most B2B SaaS sites. Cal.com or Calendly handles 95% of scheduling needs. Custom development costs more time than it saves unless you have a specific reason off-the-shelf cannot serve.</p>

<h2>Common mistakes</h2>

<p>Three patterns I have seen on real engagements:</p>

<ol>
<li><strong>Embedding the Google Calendar iframe expecting it to handle bookings.</strong> It doesn't. Visitors can see your events; they cannot schedule with you. Use Cal.com or Calendly.</li>
<li><strong>Adding multiple booking tools (Cal.com + Calendly + Chili Piper) on the same site.</strong> Each one fragments the booking experience. Pick one, integrate it consistently across the site.</li>
<li><strong>Not configuring the booking tool's calendar buffer settings.</strong> Without buffer time between meetings, you get back-to-back demos with no transition time. Set 5-10 minute padding on every event type by default.</li>
</ol>

<h2>The honest takeaway</h2>

<p>For B2B SaaS Webflow sites that need scheduling, Cal.com or Calendly is the default. The Google Calendar embed displays events. The booking tools handle bookings. Pick the booking tool based on design customization needs (Cal.com wins on flexibility, Calendly wins on enterprise CRM integrations).</p>

<p>For LoudFace's own client engagements, we default to Cal.com on most B2B SaaS sites because the design-system consistency matters and the team scheduling features handle account-team handoffs cleanly. Calendly remains the right call for teams already deep in HubSpot or Salesforce ecosystems.</p>

<p>If you want help structuring booking flows on a B2B SaaS Webflow site, <a href="/services/seo-aeo">we run Webflow engagements that include scheduling architecture as part of the SEO + AEO program</a>.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "How do I add Google Calendar to a Webflow site?",
		answer:
			"<p>Three approaches based on what you need. (1) For display-only public calendars (events, schedules), use Google Calendar's native iframe embed pasted into a Webflow HTML Embed element. (2) For booking-capable scheduling (the most common B2B SaaS use case), use Cal.com or Calendly with the booking tool syncing against your Google Calendar in the background. (3) For custom scheduling logic that off-the-shelf tools can't handle, build a custom integration via the Google Calendar API. Pick by whether visitors view or book.</p>",
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "Can visitors book meetings through a Google Calendar embed on Webflow?",
		answer:
			"<p>No. Google Calendar's native iframe embed is read-only from the visitor's perspective. They can see your events but cannot schedule meetings, sync to their own calendar, or take any action. For booking capability, you need a booking layer on top (Cal.com, Calendly, SavvyCal) that integrates with your Google Calendar for availability and writes new events when bookings happen. This is the use case 95% of B2B SaaS sites have when they ask about Google Calendar + Webflow.</p>",
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "Should I use Cal.com or Calendly with Webflow in 2026?",
		answer:
			"<p>Cal.com if design-system consistency matters: it's open-source, has a generous free tier (unlimited event types), and offers deep design customization to match your Webflow site. Calendly if you're already deep in HubSpot or Salesforce: it has the strongest enterprise CRM integrations and is the incumbent that most teams already know. For LoudFace's own B2B SaaS client engagements, we default to Cal.com because the brand-consistency advantage compounds over time.</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "Is the Google Calendar iframe embed bad for SEO?",
		answer:
			"<p>The iframe content is not indexed as part of your Webflow page because Google does not parse cross-origin iframe content as part of the parent page. For SEO and AEO purposes, the events visible in the iframe are not part of your site's indexed content. This usually doesn't matter (event calendars are not typically SEO targets) but if event content is core to your site's search strategy, the right approach is to render events directly in Webflow CMS Collections rather than embedding via iframe.</p>",
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "How do I customize the Google Calendar iframe embed?",
		answer:
			"<p>Append URL parameters to the iframe's <code>src</code> attribute. Common parameters: <code>&amp;showTitle=0</code> hides the calendar title bar, <code>&amp;showPrint=0</code> hides the print button, <code>&amp;showCalendars=0</code> hides the calendar list, <code>&amp;mode=AGENDA</code> sets default view to agenda (alternatives: WEEK, MONTH), <code>&amp;ctz=America/Los_Angeles</code> sets the timezone. For full styling control beyond what URL parameters allow, you need to scrap the iframe and render events via Webflow CMS pulling from the Google Calendar API.</p>",
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "When should I build a custom Google Calendar integration instead of using Cal.com or Calendly?",
		answer:
			"<p>Three situations. (1) Scheduling logic that off-the-shelf tools cannot express — e.g., round-robin across an account team with complex tiered availability, scheduling tied to a customer's plan in your product, multi-step approval workflows. (2) Booking UX needs to live entirely on your Webflow domain without iframes for brand-consistency reasons that paid tiers of Cal.com or Calendly cannot meet. (3) The booking is a product feature, not just a marketing CTA. For most B2B SaaS sites, Cal.com or Calendly handles the use case and custom is overkill.</p>",
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

console.log(`✓ Refreshed /blog/add-google-calendar-on-webflow`);
console.log(`  _rev: ${result._rev}`);
