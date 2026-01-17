# Webflow Cloud Requirements Specification
## For Building an Agency Website with Claude Code

---

## 1. Overview

This document outlines the technical requirements, limits, and best practices for building a website on **Webflow Cloud** using **Claude Code** with either **Next.js** or **Astro** frameworks.

### Why Webflow Cloud?
- Host custom-built Next.js/Astro sites on Webflow infrastructure
- Automatic "Webflow" detection in BuiltWith and similar tools
- GitHub integration for CI/CD deployments
- Access to Webflow's design system via DevLink
- No separate hosting management required

---

## 2. Supported Frameworks

| Framework | Support Level | Adapter Used |
|-----------|--------------|--------------|
| **Next.js** | Full support | OpenNext Cloudflare adapter |
| **Astro** | Full support | @astrojs/cloudflare adapter |

### Recommendation for Agency Website
**Astro** is recommended for a primarily static marketing/agency site because:
- Lighter weight, ships minimal JavaScript by default
- Excellent performance out of the box
- Simpler mental model for content-focused sites
- Full support for React components when needed (via `client:load`)

**Next.js** is better if you need:
- Heavy server-side rendering
- Complex API routes
- App Router features

---

## 3. Technical Limits

### Project Limits

| Resource | Free/Basic | CMS/Business | Enterprise |
|----------|------------|--------------|------------|
| Projects per site | 5 | 15 | 50 |
| Active environments per project | 10 | 10 | 10 |
| GitHub repos per site | 1 | 1 | 1 |

### Environment/Worker Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| Worker bundle size | 10 MB | Maximum deployment size |
| Worker CPU time | 30 seconds | Max execution per request |
| Worker memory | 128 MB | Per worker instance |
| Worker startup (cold start) | 400 ms | Maximum |
| Environment variables | 100 | Per environment |

### Request Handling Limits

| Limit | Value |
|-------|-------|
| Request body size | 500 MB |
| Request headers | 32 KB total, 16 KB per header |
| Response body size | Unlimited |
| Response headers | 32 KB total, 16 KB per header |
| Request timeout | 30 seconds |
| URL size | 16 KB |
| Simultaneous outgoing requests | 6 |
| Subrequests per request | 1,000 |

### Asset Limits

| Asset Type | Max Size |
|------------|----------|
| Images | 20 MB |
| Videos | 1 GB |
| 3D Models | 500 MB |
| Other static files | 20 MB |

### Storage Limits (SQLite)

| Feature | Free/Basic/CMS | Business/Enterprise |
|---------|----------------|---------------------|
| Max database size | 100 MB | 1 GB |
| Queries per invocation | 1,000 | 1,000 |
| Columns per table | 100 | 100 |
| SQL query duration | 30 seconds | 30 seconds |

### Storage Limits (Key-Value Store)

| Feature | Free/Basic/CMS | Business | Enterprise |
|---------|----------------|----------|------------|
| Storage per namespace | 100 MB | 500 MB | 2.5 GB |
| Reads per day | 100K | 500K | 5M |
| Writes to different keys/day | 10K | 50K | 500K |

### Storage Limits (Object Storage)

| Feature | Free/Basic/CMS | Business | Enterprise |
|---------|----------------|----------|------------|
| Storage per bucket | 1 GB | 5 GB | 25 GB |

### Usage-Based Limits (Billing)

| Metric | Description |
|--------|-------------|
| **Bandwidth** | Data transferred by your app (pooled with site bandwidth) |
| **Requests** | Page loads, API calls, server-side logic executions |
| **CPU Time** | Total compute time for server-side code |

**Surge Protection:** First month overage = no charge. Second consecutive month = auto-upgrade.

---

## 4. Framework-Specific Constraints

### Next.js Limitations on Webflow Cloud

| Feature | Status |
|---------|--------|
| Node.js runtime middleware | ❌ Not supported |
| Edge runtime middleware | ✅ Supported |
| ISR (Incremental Static Regeneration) | ⚠️ Experimental |
| On-demand revalidation | ⚠️ Experimental |
| `use cache` directive | ❌ Not supported |
| Static pages | ✅ Supported |
| API routes | ✅ Supported |
| Image optimization (local) | ✅ Automatic |
| Image optimization (external) | ❌ Not automatic |

### Astro Limitations on Webflow Cloud

| Feature | Status |
|---------|--------|
| Server-side rendering | ✅ Supported |
| API routes | ✅ Supported (use Edge runtime) |
| Server islands | ✅ Supported |
| Sessions | ✅ Supported |
| Static pre-rendering | ✅ Supported |
| Tailwind CSS (@tailwindcss/vite) | ✅ Supported |
| @astrojs/tailwind | ❌ Deprecated, not supported |
| CSRF protection | ⚠️ May need to disable for forms |

### Environment Variables

- **Available at runtime ONLY** — not during build
- Do NOT validate env vars at build time
- Use conditional logic for undefined vars during builds
- Access methods:
  - **Next.js:** `process.env.VARIABLE_NAME`
  - **Astro components:** `Astro.locals.runtime.env.VARIABLE_NAME`
  - **Astro API routes:** `locals.runtime.env.VARIABLE_NAME`

---

## 5. Header Behavior (Important)

Webflow Cloud overrides certain headers:

| Header | Behavior |
|--------|----------|
| `Cache-Control` (response) | Always replaced with `private, no-cache` |
| `Cache-Control` (request) | Stripped |
| `cache-tag` | Removed from responses |
| HSTS headers | Conditionally added by Webflow |

**Implication:** You cannot control caching via standard HTTP headers. Work within Webflow Cloud's caching behavior.

---

## 6. Deployment Retention

| Data Type | Free/Basic | CMS/Business | Enterprise |
|-----------|------------|--------------|------------|
| Previous deployments | 1 hour | 1 day | 3 days |
| Deployment logs | 1 hour | 1 day | 3 days |
| Runtime logs | 1 hour | 1 day | 3 days |

---

## 7. Setup Instructions for Claude Code

### Step 1: Install Webflow CLI

```bash
npm install -g @webflow/webflow-cli
```

### Step 2: Create Your Project

```bash
webflow cloud init
```

When prompted:
1. Choose framework: **Astro** (recommended) or **Next.js**
2. Enter mount path (e.g., `/` for root, or `/app` for subdirectory)
3. Authenticate with Webflow
4. Select your Webflow site

### Step 3: Project Structure (Astro)

```
your-project/
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   └── api/
│   ├── components/
│   └── layouts/
├── public/           # Static assets go here
├── devlink/          # Webflow components (auto-generated)
├── astro.config.mjs
├── package.json
└── .env              # Runtime environment variables
```

### Step 4: Configuration Files

**astro.config.mjs (Astro)**
```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  security: {
    checkOrigin: false, // Disable CSRF if using forms
  },
});
```

**next.config.js (Next.js)**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webflow Cloud specific config added by CLI
};

module.exports = nextConfig;
```

### Step 5: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 6: Connect to Webflow Cloud

1. Go to your Webflow site → Settings → Webflow Cloud
2. Click "Login to GitHub"
3. Click "Install GitHub App"
4. Click "Create New Project"
5. Select your GitHub repository
6. Create an environment (select branch and mount path)
7. Publish your Webflow site

### Step 7: Deploy

```bash
# Authenticate
webflow auth login

# Deploy
webflow cloud deploy
```

Or just push to GitHub — auto-deploys on commit.

---

## 8. MCP Server Setup for Claude Code (Agentive Access)

The Webflow MCP server allows Claude Code to interact directly with your Webflow site.

### Install MCP Server in Claude Code

```bash
claude mcp add-json "webflow" '{"command":"npx","args":["mcp-remote","https://mcp.webflow.com/sse"]}'
```

### Verify Installation

```bash
claude mcp list
```

### What MCP Enables

- **Data API Tools:** Manage sites, pages, CMS collections, custom code
- **Designer API Tools:** Create/modify elements, styles, assets, variables on the canvas
- **Natural language commands:** "Create a hero section with a CTA button"

### MCP Companion App

1. Open your site in Webflow Designer
2. Press `E` to open Apps panel
3. Launch "Webflow MCP Bridge App"
4. Wait for connection

**Note:** The Webflow Designer must be open for Designer API operations.

---

## 9. Best Practices for Agency Website

### Performance
- Compress images (use WebP/AVIF)
- Keep bundle size under 10 MB
- Use static pre-rendering for content pages
- Host videos externally (YouTube, Vimeo, Cloudflare Stream)

### Code Organization
- Use Astro components for static sections
- Use React components (`client:load`) only when interactivity needed
- Keep API routes lightweight
- Use DevLink to import Webflow design system

### SEO
- Ensure all pages have meta titles and descriptions
- Use proper heading hierarchy
- Add alt text to all images
- Generate sitemap

### Forms
- Disable Astro CSRF protection if needed (`security: { checkOrigin: false }`)
- Handle form submissions via API routes

---

## 10. Recommended Site Plan

For an agency website with moderate traffic:

| Plan | Bandwidth | Requests | CPU Time | Price |
|------|-----------|----------|----------|-------|
| **CMS** | 50 GB | Included | Included | $23/month |
| **Business** | 100 GB | Higher limits | Higher limits | $39/month |

**Note:** Webflow Cloud requires **CMS plan or higher** to mount to a custom domain.

---

## 11. Quick Reference Commands

```bash
# Install Webflow CLI
npm install -g @webflow/webflow-cli

# Initialize new project
webflow cloud init

# Authenticate
webflow auth login

# Deploy
webflow cloud deploy

# Local preview (mimics Webflow Cloud environment)
npm run preview

# Add Webflow MCP to Claude Code
claude mcp add-json "webflow" '{"command":"npx","args":["mcp-remote","https://mcp.webflow.com/sse"]}'
```

---

## 12. Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 after deployment | Publish your Webflow site after creating environment |
| Deployment not starting | Check GitHub app has access to repo |
| Assets not loading | Reference mount path in asset URLs |
| Env vars undefined | They're only available at runtime, not build time |
| Build fails | Check bundle size < 10 MB, no Node.js-only APIs |

---

## 13. Resources

- [Webflow Cloud Docs](https://developers.webflow.com/webflow-cloud/intro)
- [Webflow Cloud Limits](https://developers.webflow.com/webflow-cloud/limits)
- [Framework Optimization](https://developers.webflow.com/webflow-cloud/environment/framework-customization)
- [MCP Server Docs](https://developers.webflow.com/mcp/reference/overview)
- [Webflow Pricing](https://webflow.com/pricing)

---

*Document generated: January 2026*
*For use with Claude Code to build agency website on Webflow Cloud*