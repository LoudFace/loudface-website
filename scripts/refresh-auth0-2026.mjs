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

const DOC_ID = "imported-blogPost-67be8cae60f077ebbf24cbf6";

const NEW_NAME = "Webflow + Auth0 in 2026: When to Use It and When Webflow Memberships Wins";
const NEW_META_TITLE = "Webflow + Auth0 2026: When It's Worth The Setup";
const NEW_META_DESCRIPTION =
	"How to integrate Auth0 with Webflow in 2026: when the combination is worth the setup (enterprise SSO, customer portals), when Webflow Memberships handles it natively, and the full code walkthrough.";
const NEW_EXCERPT =
	"Webflow + Auth0 setup guide for B2B SaaS sites that need real auth — enterprise SSO, embedded portals, content gating. When it's worth the setup and when Webflow Memberships is the right call instead.";

const NEW_CONTENT = `
<p><strong>TL;DR:</strong> Auth0 (now part of Okta) handles authentication for sites that need real user accounts beyond Webflow's built-in Memberships. Webflow + Auth0 is the right call for B2B SaaS marketing sites that need to gate premium content, embed a logged-in customer portal, or integrate with an existing Okta-backed identity stack. It is the wrong call for simple "members-only blog post" gating (Webflow Memberships handles that natively for less) or for high-volume consumer apps where Auth0 pricing scales past affordability. Setup is a one-time custom code injection plus Auth0 Universal Login configuration.</p>

<p>I have integrated Auth0 with Webflow on B2B SaaS engagements where the marketing site needs to gate enterprise content (whitepapers behind a customer login, premium documentation, partner portals). The pattern that wastes the most time: teams choose Auth0 by default without checking whether Webflow Memberships would handle the use case. Auth0 is powerful and overkill for most marketing-site auth needs.</p>

<p>For broader Webflow context, see <a href="/blog/mastering-webflow-guide">Getting Started with Webflow in 2026</a>.</p>

<h2>What Auth0 actually is in 2026</h2>

<p>Auth0 is an identity-as-a-service platform owned by Okta since 2021. It handles user authentication (login, signup, password reset, social login, multi-factor authentication, single sign-on) as a managed service so you don't have to build auth from scratch. Auth0 supports OAuth, OIDC, SAML, and custom flows for enterprise SSO.</p>

<p>Pricing in 2026: free up to 7,500 monthly active users, Essentials plan starts at $35/month for 1,000 MAUs with custom domains and MFA, Professional starts at $240/month for 1,000 MAUs with role-based access control. Enterprise pricing scales custom from there.</p>

<p>Two things Auth0 is NOT:</p>

<ul>
<li><strong>Not a Webflow Memberships replacement for simple cases.</strong> Webflow Memberships ships native gating for content on Webflow sites with a built-in user database, sign-up forms, and email-based access. For marketing sites that just need "log in to read this whitepaper," Memberships is the right call and Auth0 is overkill.</li>
<li><strong>Not a full customer portal solution.</strong> Auth0 handles auth. It does not give you a dashboard, billing, or any product UI. For that, you need the customer portal logic to live in a custom frontend or in the product app the auth is gating access to.</li>
</ul>

<h2>When Webflow + Auth0 is the right call</h2>

<p>Three patterns where the combination consistently pays off:</p>

<ol>
<li><strong>Marketing site that gates content behind enterprise SSO.</strong> When the customer-facing whitepapers or documentation need to authenticate users against the same Okta directory the customers use for their product login. Webflow Memberships does not support enterprise SSO; Auth0 does.</li>
<li><strong>Embedded customer portal on Webflow.</strong> When you want logged-in customers to access a portal area on the Webflow marketing site (account settings, invoice download, support tickets) and the auth needs to be consistent with the product app. Auth0 handles the auth; the portal UI is built in Webflow.</li>
<li><strong>Existing Okta or Auth0 stack.</strong> When the rest of the company already runs on Okta/Auth0 and you need the Webflow site to plug in cleanly. Inheriting the identity stack is cheaper than running parallel auth systems.</li>
</ol>

<h2>When Webflow + Auth0 is the wrong call</h2>

<p>Three patterns where alternatives win:</p>

<ol>
<li><strong>Simple "log in to read a blog post" gating.</strong> Webflow Memberships handles this natively and ships sign-up, log-in, password reset, and content gating on the Webflow plan. No external auth provider needed. Use Memberships unless you need features Memberships lacks.</li>
<li><strong>Consumer apps with 10,000+ MAUs.</strong> Auth0 pricing scales linearly with monthly active users and gets expensive fast. For high-volume consumer auth, a self-hosted option (Supabase Auth, Clerk on a higher tier, or building on AWS Cognito) can be significantly cheaper at scale.</li>
<li><strong>Webflow sites without a backend.</strong> If the Webflow site is purely a marketing site with no logged-in functionality, adding Auth0 is feature creep. The auth needs to do something: gate content, access a customer portal, fetch user-specific data. Without a backend to authenticate against, Auth0 is solving a problem you don't have.</li>
</ol>

<h2>How to set up Webflow + Auth0</h2>

<p>The honest minimum to gate content on a Webflow page using Auth0:</p>

<h3>Step 1: Set up the Auth0 tenant</h3>

<p>Sign up for Auth0 (free tier is fine for testing). Create a new application: pick "Single Page Application" as the application type. Note the Domain, Client ID, and Client Secret from the application settings.</p>

<p>Configure Allowed Callback URLs: add your Webflow staging URL (e.g., <code>https://my-site.webflow.io</code>) and the production custom domain. Same for Allowed Logout URLs.</p>

<h3>Step 2: Configure Auth0 Universal Login</h3>

<p>In the Auth0 dashboard, customize the Universal Login screen (branding, colors, copy) to match your Webflow design system. This is the screen users see when they hit "log in" on your Webflow site.</p>

<p>Add Social Connections (Google, Microsoft, LinkedIn) if you want one-click login alongside email/password. For enterprise SSO, configure SAML or OIDC connections to the customer's identity provider.</p>

<h3>Step 3: Add the Auth0 SDK to Webflow</h3>

<p>In Webflow's Project Settings → Custom Code → Footer Code, add the Auth0 SPA SDK:</p>

<pre><code>&lt;script src="https://cdn.auth0.com/js/auth0-spa-js/2.1/auth0-spa-js.production.js"&gt;&lt;/script&gt;
&lt;script&gt;
let auth0Client;
async function initAuth() {
  auth0Client = await auth0.createAuth0Client({
    domain: 'YOUR_DOMAIN.auth0.com',
    clientId: 'YOUR_CLIENT_ID',
    authorizationParams: { redirect_uri: window.location.origin }
  });
}
initAuth();
&lt;/script&gt;</code></pre>

<h3>Step 4: Wire up login/logout buttons</h3>

<p>Add buttons to your Webflow Designer with IDs <code>login-button</code> and <code>logout-button</code>. In a custom code block at the page level, wire them to Auth0:</p>

<pre><code>&lt;script&gt;
document.getElementById('login-button')?.addEventListener('click', () =&gt;
  auth0Client.loginWithRedirect()
);
document.getElementById('logout-button')?.addEventListener('click', () =&gt;
  auth0Client.logout({ logoutParams: { returnTo: window.location.origin } })
);
&lt;/script&gt;</code></pre>

<h3>Step 5: Gate content based on auth state</h3>

<p>Hide the gated content by default with a class like <code>auth-required</code>. In a page-level custom code block, show the content only when the user is authenticated:</p>

<pre><code>&lt;script&gt;
window.addEventListener('load', async () =&gt; {
  if (await auth0Client.isAuthenticated()) {
    document.querySelectorAll('.auth-required').forEach(el =&gt; el.style.display = 'block');
    document.querySelectorAll('.auth-guest').forEach(el =&gt; el.style.display = 'none');
  }
});
&lt;/script&gt;</code></pre>

<h3>Step 6: Test the full flow</h3>

<p>Publish to staging. Click the login button. Complete the Auth0 Universal Login flow. Confirm the gated content appears post-login. Test logout. Test the social connections if configured.</p>

<h2>Common mistakes</h2>

<p>Three patterns I have seen on real engagements:</p>

<ol>
<li><strong>Storing the Auth0 Client Secret in Webflow custom code.</strong> Don't. The Client Secret should never appear in client-side code. Only the Domain and Client ID belong in the Webflow code. Anything that needs the Client Secret has to run server-side (a Webflow Cloud function, a separate Vercel function, or your product API).</li>
<li><strong>Forgetting to add the staging URL to Allowed Callback URLs.</strong> Auth0 redirect-mismatch errors are the #1 setup blocker. Add <code>webflow.io</code> staging URLs, custom domains, and any preview environments to the Allowed Callback URLs list in Auth0.</li>
<li><strong>Using Auth0 when Webflow Memberships would have worked.</strong> Memberships ships email-based signup, content gating, and a built-in user database for free on most Webflow plans. Check whether your use case is actually too complex for Memberships before adding Auth0.</li>
</ol>

<h2>The honest takeaway</h2>

<p>Webflow + Auth0 is the right call when the marketing site needs enterprise SSO, an embedded customer portal, or integration with an existing Okta-backed identity stack. It is overkill for simple content gating where Webflow Memberships handles the same use case for less money and less setup.</p>

<p>The cleanest setup is one Auth0 tenant connected to a Webflow site via the Auth0 SPA SDK, with content gating handled by simple JS that toggles visibility based on <code>isAuthenticated()</code>. Don't store the Client Secret in Webflow code, and don't reach for Auth0 when Memberships would have worked.</p>

<p>If you want help structuring auth on a B2B SaaS Webflow site, <a href="/services/seo-aeo">we run Webflow engagements that include auth architecture decisions as part of the SEO + AEO program</a>.</p>
`.trim();

const NEW_FAQ = [
	{
		_key: "faq1",
		_type: "faqItem",
		question: "What is Auth0 and how does it work with Webflow?",
		answer:
			"<p>Auth0 (owned by Okta since 2021) is an identity-as-a-service platform that handles login, signup, password reset, social login, MFA, and SSO. Webflow + Auth0 integration uses the Auth0 SPA SDK (added via custom code in Webflow's project settings) to authenticate users and gate content. Auth0 handles the auth flow on its hosted Universal Login screen; Webflow renders the rest of the site and toggles content visibility based on whether the user is authenticated.</p>",
	},
	{
		_key: "faq2",
		_type: "faqItem",
		question: "Should I use Auth0 or Webflow Memberships?",
		answer:
			"<p>Use Webflow Memberships when you need simple email-based signup with content gating on a Webflow marketing site (e.g., 'log in to read this whitepaper'). It ships native gating, a built-in user database, sign-up forms, and email-based access on most Webflow plans without an external auth provider. Use Auth0 when you need enterprise SSO, social logins beyond Memberships' basic set, integration with an existing Okta identity stack, multi-factor authentication, or custom auth flows. Auth0 is overkill for simple gating.</p>",
	},
	{
		_key: "faq3",
		_type: "faqItem",
		question: "How much does Auth0 cost for a Webflow site in 2026?",
		answer:
			"<p>Auth0 is free up to 7,500 monthly active users. Essentials plan starts at $35/month for 1,000 MAUs with custom domains and MFA. Professional plan starts at $240/month for 1,000 MAUs with role-based access control and advanced security features. Enterprise pricing is custom. For B2B SaaS marketing sites with under 1,000 logged-in users per month, the free tier or Essentials plan covers it. High-volume consumer apps get expensive fast — at 10,000+ MAUs, alternative providers (Supabase Auth, Clerk, AWS Cognito) are often significantly cheaper.</p>",
	},
	{
		_key: "faq4",
		_type: "faqItem",
		question: "Can I store the Auth0 Client Secret in Webflow custom code?",
		answer:
			"<p>No. The Client Secret should never appear in client-side code under any circumstance. Only the Auth0 Domain and Client ID belong in Webflow's custom code (those are public values, safe to expose). Anything that requires the Client Secret has to run server-side — a Webflow Cloud function, a separate Vercel/Cloudflare Worker function, or your product backend API. The Auth0 SPA SDK is designed for browser-side auth flows and uses PKCE so the Client Secret is never needed in the browser.</p>",
	},
	{
		_key: "faq5",
		_type: "faqItem",
		question: "How do I gate specific Webflow pages or sections behind Auth0 login?",
		answer:
			"<p>Three steps. (1) Hide the gated content by default — add a CSS class like <code>auth-required</code> with <code>display: none</code>. (2) In a page-level custom code block, check <code>auth0Client.isAuthenticated()</code> on page load. (3) If true, toggle the gated content visible and hide the guest-only content. For more sophisticated gating (role-based access, per-user content), use Auth0's claims and roles in the access token to drive page-level logic in custom code.</p>",
	},
	{
		_key: "faq6",
		_type: "faqItem",
		question: "Does Auth0 work with Webflow's CMS Collections?",
		answer:
			"<p>Yes, with custom code. The Auth0 SPA SDK runs at the page level in Webflow, so you can hide or show CMS Collection items based on auth state. For more advanced patterns (showing different Collection items per user role, gating individual CMS items behind specific Auth0 permissions), you'll need to write custom JavaScript that queries the auth state and filters the rendered Collection List. Webflow's CMS itself does not have native auth-aware filtering — that has to be implemented in custom code.</p>",
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

console.log(`✓ Refreshed /blog/webflow-and-auth0-guide`);
console.log(`  _rev: ${result._rev}`);
