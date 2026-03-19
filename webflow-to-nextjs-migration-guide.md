# Webflow → Next.js Migration Guide

A step-by-step playbook for migrating client Webflow sites to custom Next.js builds using Claude Code. Written for LoudFace developers.

---

## How This Guide Is Organized

This guide walks through the full migration, start to finish:

1. **Exporting the Webflow site** — getting the code out of Webflow
2. **Setting up the Next.js project** — creating the foundation
3. **Connecting the Webflow CMS** — keeping content in Webflow, rendering in Next.js
4. **Building the component system** — how we structure reusable UI
5. **Teaching Claude Code the project** — rules, skills, and config files
6. **Deploying to Vercel** — going live
7. **Scaling across the team** — sharing config so everyone builds consistently

Each section tells you *what to do* and *why*, with real examples from the LoudFace site migration.

---

## Prerequisites

Before starting, make sure you have:

- **Node.js 18+** installed (check with `node -v` in your terminal)
- **Git** installed (check with `git -v`)
- **A code editor** — VS Code is fine, but you'll mostly be working in Claude Code
- **Claude Code** installed and working ([docs.claude.com](https://docs.claude.com))
- **A Webflow account** with access to the site you're migrating
- **A Vercel account** for hosting (free tier works)
- **A GitHub account** for version control

---

## Phase 1: Export the Webflow Site

### What you're doing

Getting the existing website's HTML, CSS, images, and structure out of Webflow so Claude Code has something to work from.

### Steps

1. **Open the Webflow project** in the Webflow Designer
2. **Export the site code:**
   - Go to the Webflow dashboard for the project
   - Click the "Export Code" button (top-right of the Designer, or from the project settings)
   - Download the `.zip` file
3. **Unzip the export** into a folder on your computer — call it something like `client-name-webflow-export`

The export gives you:
- `index.html` and other page HTML files
- A `css/` folder with stylesheets
- An `images/` folder with all uploaded assets
- A `js/` folder with Webflow interactions

> **Note:** The exported code is raw HTML/CSS — it's *not* a framework. That's fine. Claude Code uses it as a reference to understand the design, layout, and content structure. It doesn't copy-paste the code directly.

### What about the CMS?

The export does NOT include CMS data (blog posts, case studies, testimonials, etc.). That's intentional — we keep the CMS in Webflow and connect to it via API. More on that in Phase 3.

---

## Phase 2: Set Up the Next.js Project

### What you're doing

Creating a fresh Next.js project that will become the production site.

### Steps

1. **Create a new folder** for the project on your machine:

```bash
mkdir client-name-website
cd client-name-website
```

2. **Initialize a Next.js project:**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
```

When it asks you questions, choose:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Import alias: **@/*** (the default)

3. **Copy the Webflow export into the project folder** — put it somewhere Claude Code can see it, like a `_webflow-reference/` folder at the project root. This is just a reference, not part of the build:

```bash
mkdir _webflow-reference
cp -r ../client-name-webflow-export/* _webflow-reference/
```

4. **Copy images from the export** into the Next.js `public/` folder:

```bash
cp -r _webflow-reference/images/* public/images/
```

5. **Initialize Git:**

```bash
git init
git add .
git commit -m "Initial Next.js project with Webflow reference"
```

### What your folder should look like

```
client-name-website/
├── _webflow-reference/     ← The exported Webflow code (for reference)
│   ├── index.html
│   ├── css/
│   ├── images/
│   └── js/
├── public/
│   └── images/             ← Copied from Webflow export
├── src/
│   ├── app/                ← Pages live here (Next.js App Router)
│   ├── components/         ← Reusable UI components
│   ├── lib/                ← Utilities, types, API helpers
│   └── data/               ← Static content (JSON files)
├── package.json
└── tsconfig.json
```

---

## Phase 3: Connect the Webflow CMS

This is the core architectural decision: **keep content management in Webflow, render it in Next.js.** Clients keep editing in Webflow's visual CMS editor. Your Next.js site pulls data from Webflow's API at build time or request time.

### 3.1 — Get Your Webflow API Token

1. Go to **Webflow Dashboard → Site Settings → Apps & Integrations**
2. Generate a **Site API Token** (not a user token — site tokens are scoped to one site)
3. Save this token somewhere safe — you'll need it in your `.env` file

### 3.2 — Find Your Collection IDs

Every CMS collection in Webflow (Blog, Case Studies, Clients, etc.) has a unique ID. You need these to fetch data.

**How to find them:**

1. In the Webflow Designer, go to the CMS panel (the database icon on the left)
2. Click on a collection (e.g., "Blog Posts")
3. Look at the URL in your browser — it contains the collection ID:
   ```
   https://webflow.com/design/your-site#/collections/67b46d898180d5b8499f87e8
                                                       ^^^^^^^^^^^^^^^^^^^^^^^^
                                                       This is the collection ID
   ```

Or use the Webflow API to list them:

```bash
curl -s "https://api.webflow.com/v2/sites/YOUR_SITE_ID/collections" \
  -H "Authorization: Bearer YOUR_API_TOKEN" | json_pp
```

### 3.3 — Set Up Environment Variables

Create a `.env.local` file at the project root (this file is NOT committed to Git):

```bash
WEBFLOW_SITE_API_TOKEN=your-token-here
WEBFLOW_SITE_ID=your-site-id-here
```

### 3.4 — Create the CMS Data Layer

This is the backbone of the integration. Here's how the LoudFace project structures it:

**`src/lib/constants.ts`** — Central map of collection names to IDs:

```typescript
export const COLLECTION_IDS = {
  blog: "67b46d898180d5b8499f87e8",
  "case-studies": "67bcc512271a06e2e0acc70d",
  testimonials: "67bd0c6f1a9fdd9770be5469",
  clients: "67c6f017e3221db91323ff13",
  // ... add all your collections
} as const;

export type CollectionName = keyof typeof COLLECTION_IDS;

export function getCollectionId(name: CollectionName): string {
  return COLLECTION_IDS[name];
}

export function isValidCollection(name: string): name is CollectionName {
  return name in COLLECTION_IDS;
}
```

**`src/lib/types.ts`** — TypeScript types for each collection. These mirror the fields in Webflow's CMS:

```typescript
export interface WebflowImage {
  url: string;
  alt: string | null;
}

export interface BlogPost {
  id: string;
  name: string;
  slug: string;
  thumbnail?: WebflowImage;
  excerpt?: string;
  content?: string;          // Rich text (HTML string)
  "published-date"?: string;
  category?: string;         // Reference ID to another collection
}

// Add interfaces for each of your collections...
```

> **Important:** Webflow uses kebab-case for field names (like `published-date`, `main-body`). Your TypeScript interfaces need to use the exact same names with bracket notation: `post['published-date']`.

**`src/lib/cms-data.ts`** — The main data fetching file. This is where all the API calls live:

```typescript
import { COLLECTION_IDS } from "./constants";
import type { BlogPost, CaseStudy } from "./types";

// Fetch a single collection
export async function fetchCollection<T>(
  collectionKey: keyof typeof COLLECTION_IDS,
  accessToken: string
): Promise<{ items: T[] } | null> {
  const collectionId = COLLECTION_IDS[collectionKey];

  const res = await fetch(
    `https://api.webflow.com/v2/collections/${collectionId}/items`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 60 }, // Cache for 60 seconds, then re-fetch
    }
  );

  if (!res.ok) return null;
  return await res.json();
}

// Normalize a CMS item — Webflow nests fields inside `fieldData`
function normalizeItem<T>(item: Record<string, unknown>): T {
  return {
    id: item.id,
    ...(item.fieldData as Record<string, unknown>),
  } as T;
}

// Filter out unpublished items
function isPublished(item: Record<string, unknown>): boolean {
  return !item.isDraft && !item.isArchived;
}
```

**Why `normalizeItem`?** Webflow's API v2 returns items in this shape:

```json
{
  "id": "abc123",
  "fieldData": {
    "name": "My Blog Post",
    "slug": "my-blog-post",
    "content": "<p>Hello world</p>"
  },
  "isDraft": false,
  "isArchived": false
}
```

The `normalizeItem` function flattens this so you can just write `post.name` instead of `post.fieldData.name`.

### 3.5 — Create API Routes (Optional but Recommended)

API routes give you a clean internal endpoint for your CMS data. This is useful for client-side fetches or if you want to add middleware later.

**`src/app/api/cms/[collection]/route.ts`** — Generic route that handles any collection:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { COLLECTION_IDS, isValidCollection } from '@/lib/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;

  if (!collection || !isValidCollection(collection)) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }

  const collectionId = COLLECTION_IDS[collection];
  const accessToken = process.env.WEBFLOW_SITE_API_TOKEN;

  if (!accessToken) {
    return NextResponse.json({ error: 'CMS not configured' }, { status: 500 });
  }

  const response = await fetch(
    `https://api.webflow.com/v2/collections/${collectionId}/items`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
```

> **Note about `await params`:** In Next.js 15+, route params are a Promise and must be awaited. This is different from older Next.js versions.

### 3.6 — Use CMS Data in Pages

In your Next.js pages (which are Server Components by default), you fetch CMS data directly:

```typescript
// src/app/blog/page.tsx
import { fetchCollection, getAccessToken } from '@/lib/cms-data';
import type { BlogPost } from '@/lib/types';

export default async function BlogPage() {
  const accessToken = getAccessToken();
  let posts: BlogPost[] = [];

  if (accessToken) {
    const data = await fetchCollection<Record<string, unknown>>('blog', accessToken);
    if (data?.items) {
      posts = data.items
        .filter(item => !item.isDraft && !item.isArchived)
        .map(item => ({
          id: item.id,
          ...(item.fieldData as Record<string, unknown>),
        })) as BlogPost[];
    }
  }

  return (
    <main>
      <h1>Blog</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.name}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
}
```

### 3.7 — Handle CMS Images

Webflow hosts images on its own CDN. You can use them directly, but for better performance, route them through an image proxy for resizing and format conversion.

The LoudFace project uses [weserv.nl](https://images.weserv.nl/) (free, open-source image proxy):

```typescript
// src/lib/image-utils.ts
export function optimizeImage(url: string | undefined, width: number): string | undefined {
  if (!url || !url.startsWith('http')) return url;

  const params = new URLSearchParams();
  params.set('url', url);
  params.set('w', String(width));
  params.set('q', '80');
  params.set('output', 'webp');

  return `https://images.weserv.nl/?${params.toString()}`;
}

// Convenience functions
export function thumbnailImage(url?: string) { return optimizeImage(url, 800); }
export function logoImage(url?: string) { return optimizeImage(url, 300); }
export function avatarImage(url?: string) { return optimizeImage(url, 80); }
```

Then in your components:

```tsx
import { thumbnailImage } from '@/lib/image-utils';

<img src={thumbnailImage(post.thumbnail?.url)} alt={post.name} />
```

---

## Phase 4: Prompt Claude Code to Migrate

### What you're doing

This is where the actual magic happens. You're opening the project in Claude Code and giving it instructions to convert the Webflow HTML into proper Next.js components.

### 4.1 — Open Your Project in Claude Code

```bash
cd client-name-website
claude
```

### 4.2 — The Migration Prompt

Here's the kind of prompt that works well. Adapt it for your specific project:

```
I'm migrating a website from Webflow to Next.js. The exported Webflow code is in
_webflow-reference/. The Next.js project is already set up with Tailwind CSS v4
and the App Router.

Please migrate the Webflow site page by page:

1. Start with the homepage (_webflow-reference/index.html)
2. Analyze the layout, sections, and visual design
3. Recreate each section as a reusable React component in src/components/sections/
4. Use Tailwind CSS for all styling (no styled-jsx, no CSS modules)
5. Use the existing CMS data layer in src/lib/cms-data.ts for dynamic content
6. Keep things as Server Components unless interactivity is needed

For each page:
- Create a page.tsx in the appropriate src/app/ directory
- Extract reusable patterns into src/components/ui/
- Put static text content in src/data/content/ as JSON files
- Follow the project's design token system in globals.css
```

### 4.3 — Work Through Pages Iteratively

Don't try to do the whole site in one prompt. Work page by page:

1. **Homepage first** — this establishes the component library
2. **Blog listing + blog detail pages** — tests the CMS integration
3. **Service pages** — usually static content, straightforward
4. **About page** — often has unique layouts
5. **Legal pages** (privacy, terms) — quick wins

After each page, run `npm run build` to make sure nothing is broken.

### 4.4 — Key Things to Watch For

**Static content vs CMS content:** Not everything comes from the CMS. Headlines, CTAs, and page descriptions are usually hardcoded. In this project, we put those in JSON files under `src/data/content/` and load them with getter functions:

```json
// src/data/content/hero.json
{
  "headline": "We Build Websites<br>That Drive Growth",
  "description": "Award-winning agency specializing in...",
  "ctaText": "Get Started"
}
```

**Rich text from Webflow:** CMS fields marked as "Rich Text" in Webflow come back as HTML strings. You'll need `dangerouslySetInnerHTML` to render them:

```tsx
<div dangerouslySetInnerHTML={{ __html: post.content }} />
```

**Reference fields:** Webflow CMS references (like a blog post's "Author" field pointing to a Team Member) come back as just an ID string. You need to fetch the referenced collection separately and build a lookup map:

```typescript
// Fetch team members separately
const membersMap = new Map(teamMembers.map(m => [m.id, m]));

// Look up the author
const author = membersMap.get(post.author);
```

---

## Phase 5: Set Up the Claude Code Config System

This is what makes the workflow repeatable across your team. When Claude Code opens a project, it reads specific config files to understand how the project works.

### 5.1 — The File Hierarchy

```
project-root/
├── CLAUDE.md                    ← Main project instructions (Claude reads this first)
├── COMPONENTS.md                ← Registry of all reusable components
├── .claude/
│   ├── settings.local.json      ← Local permissions
│   ├── rules/                   ← Coding standards Claude must follow
│   │   ├── component-system.md  ← How the component system works
│   │   ├── component-patterns.md ← Code examples and templates
│   │   ├── styling.md           ← Color tokens, spacing, typography rules
│   │   └── seo-standards.md     ← SEO requirements
│   ├── skills/                  ← Reusable task instructions
│   │   ├── cms-component/
│   │   │   └── SKILL.md         ← How to build CMS-driven components
│   │   ├── deploy/
│   │   │   └── SKILL.md         ← Deployment checklist
│   │   └── seo-audit/
│   │       └── SKILL.md         ← SEO audit process
│   ├── agents/                  ← Specialist agents for specific jobs
│   │   ├── seo-reviewer.md
│   │   ├── accessibility-audit.md
│   │   └── performance-audit.md
│   └── commands/                ← Slash commands
│       ├── deploy.md
│       └── audit.md
```

### 5.2 — CLAUDE.md (The Main Instruction File)

This is the most important file. It's the first thing Claude reads when it opens the project. Think of it as the "welcome packet" for anyone (human or AI) working on the codebase.

**What goes in CLAUDE.md:**

- **Session protocol** — what to do before writing code, what to do before ending a session
- **Critical rules** — things that will break production if ignored (image paths, Next.js gotchas, Tailwind version quirks)
- **Project structure** — where to find things (a table mapping concepts to file paths)
- **CMS collection IDs** — the mapping of collection names to Webflow IDs
- **Dev & deploy commands** — how to run the dev server, build, and deploy
- **Design guidelines** — what aesthetics to aim for, what to avoid

Here's a simplified template you can start with:

```markdown
# [Client Name] Website — Claude Code Instructions

## Session Protocol

### Before Writing Any Code
1. Read `COMPONENTS.md` — check what already exists
2. Check the barrel exports — imports come from `@/components/ui`
3. Check `globals.css` for available color tokens

### Before Ending a Session
1. Update `COMPONENTS.md` if you changed any components
2. Run `npm run build` to verify nothing is broken

## Critical Rules

### Static Image Paths
Use `asset()` from `@/lib/assets` for all hardcoded image paths.

### Tailwind CSS v4
No tailwind.config.ts — all tokens live in globals.css @theme block.
Use project tokens (primary-*, surface-*), never default Tailwind colors.

## CMS Collection IDs

| Collection | ID |
|---|---|
| Blog | `paste-id-here` |
| Case Studies | `paste-id-here` |

## Dev Commands

npm run dev   # Start dev server
npm run build # Build for production
```

### 5.3 — COMPONENTS.md (The Component Registry)

This is a live document that lists every reusable component, its props, and how to use it. Claude reads this before writing any UI code to avoid recreating things that already exist.

**Format:**

```markdown
# Component Registry

Import all UI primitives from the barrel:
import { Button, Card, SectionContainer, SectionHeader } from '@/components/ui';

## Button

Multi-variant button component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'ghost' | 'primary' | Visual style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| href | string | — | Makes it a link |

Usage:
<Button variant="primary" size="lg" href="/contact">Get Started</Button>
```

**The rule:** Anyone (human or Claude) who adds or changes a component MUST update this file. If it falls out of date, the system breaks.

### 5.4 — Rules (`.claude/rules/`)

Rules are markdown files that define coding standards. Claude Code loads them automatically. They're great for things you'd otherwise have to repeat in every prompt.

**Examples of good rules:**

- `component-system.md` — "Always check COMPONENTS.md before writing markup. Import from barrels, not direct file paths."
- `styling.md` — "Use `surface-900` for heading text on light backgrounds. Use `surface-300` for body text on dark backgrounds. Never use `gray-*`."
- `seo-standards.md` — "Every page needs a unique title (50-60 chars), meta description (150-160 chars), one H1, and proper heading hierarchy."

### 5.5 — Skills (`.claude/skills/`)

Skills are reusable task instructions. When Claude encounters a specific kind of work (like building a CMS component), it can read the relevant SKILL.md for best practices.

**Example: `cms-component/SKILL.md`**

```markdown
# CMS Component Creation

## Quick Start
- Import types from @/lib/types
- Use SectionContainer for layout
- Handle empty collections gracefully
- Build lookup maps for reference fields

## Field Access Patterns
item.name                          // Direct fields
item['project-title']              // Kebab-case fields
clientsMap.get(item.client)?.name  // Reference lookups
item.thumbnail?.url                // Image fields
```

### 5.6 — Agents (`.claude/agents/`)

Agents are specialist personas with specific tools and responsibilities. They're great for audit tasks.

**Example: `seo-reviewer.md`**

```markdown
---
name: seo-reviewer
description: Technical SEO expert for auditing pages
tools: Read, Grep, Glob, Bash, WebFetch
model: sonnet
---

You are a technical SEO specialist. When auditing a page:
1. Check meta tags (title, description, OG tags)
2. Verify heading hierarchy (one H1, no skipped levels)
3. Check image alt text
4. Validate structured data (JSON-LD)
5. Count internal links (target 3-5 per page)
```

### 5.7 — Commands (`.claude/commands/`)

Slash commands are shortcuts for common workflows. When someone types `/deploy` in Claude Code, it reads `commands/deploy.md` and follows those instructions.

```markdown
# Deploy Command

1. Run `npm run build` to verify no errors
2. Commit changes with `git add . && git commit -m "message"`
3. Push to GitHub: `git push origin main` (triggers Vercel auto-deploy)
4. Verify: check the live site, test CMS pages, test booking modal
```

---

## Phase 6: SEO Setup

One of the main advantages of moving off Webflow is full SEO control. Here's what the project sets up.

### 6.1 — Metadata

Every page exports a `metadata` object (or `generateMetadata` for dynamic pages):

```typescript
// Static page
export const metadata: Metadata = {
  title: 'Our Services',  // Template in layout.tsx adds " | BrandName"
  description: 'A compelling 150-160 character description with keywords and a CTA.',
};

// Dynamic page (e.g., blog post)
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  return {
    title: post.name,
    description: post.excerpt,
  };
}
```

### 6.2 — Sitemap

Next.js can generate sitemaps automatically. Create `src/app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.example.com';

  // Static pages
  const staticPages = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/blog`, changeFrequency: 'daily', priority: 0.8 },
    // ...
  ];

  // Dynamic pages from CMS
  const posts = await fetchAllPosts();
  const blogPages = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post['published-date'] ? new Date(post['published-date']) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
```

### 6.3 — Robots.txt

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: 'https://www.example.com/sitemap.xml',
  };
}
```

### 6.4 — Structured Data (JSON-LD)

Add structured data to the layout for global schemas (Organization, WebSite) and to individual pages for page-specific schemas (Article, FAQ, Breadcrumbs).

```tsx
// In layout.tsx
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Brand Name",
  url: "https://www.example.com",
  logo: "https://www.example.com/images/logo.svg",
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
/>
```

### 6.5 — Redirects

When you change URL structures during migration, set up redirects in `next.config.ts` so old Webflow URLs still work:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/work', destination: '/case-studies', permanent: true },
      { source: '/contact', destination: '/', permanent: true },
      { source: '/about-us', destination: '/about', permanent: true },
    ];
  },
};
```

---

## Phase 7: Deploy to Vercel

### 7.1 — Connect to GitHub

1. Push your project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Import Project" and select your GitHub repo
4. Vercel auto-detects it's a Next.js project

### 7.2 — Set Environment Variables

In Vercel's project settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `WEBFLOW_SITE_API_TOKEN` | Your Webflow API token |
| `WEBFLOW_SITE_ID` | Your Webflow site ID |

### 7.3 — Deploy

Vercel auto-deploys whenever you push to `main`. The workflow is:

```bash
npm run build              # Verify locally
git add .
git commit -m "Description of changes"
git push origin main       # Triggers Vercel deployment
```

### 7.4 — Point the Domain

1. In Vercel, go to project Settings → Domains
2. Add your custom domain
3. Update your DNS records to point to Vercel (Vercel gives you the exact records)
4. Vercel handles SSL certificates automatically

---

## Phase 8: Scaling Across the Team

This is the long-term vision — making it so any team member can pick up a project and Claude Code already knows how to work with it.

### 8.1 — Shareable Config Files

The `.claude/` directory and `CLAUDE.md` travel with the Git repository. When someone clones the project and opens it in Claude Code, they get all the rules, skills, and context automatically.

**What to standardize across projects:**

| File | Purpose | Reuse Level |
|------|---------|-------------|
| `CLAUDE.md` | Project-specific instructions | Per project (customize) |
| `COMPONENTS.md` | Component registry | Per project (build up) |
| `.claude/rules/styling.md` | Design token rules | Template (adapt per brand) |
| `.claude/rules/component-system.md` | Component workflow | Shared (same across projects) |
| `.claude/rules/seo-standards.md` | SEO checklist | Shared (same across projects) |
| `.claude/skills/cms-component/` | CMS component patterns | Shared (same for Webflow CMS) |
| `.claude/skills/deploy/` | Deploy checklist | Template (adapt per host) |
| `.claude/agents/seo-reviewer.md` | SEO audit agent | Shared (same across projects) |

### 8.2 — Creating a Starter Template

Once you've done a few migrations, you'll have a good starting point. Create a template repo on GitHub with:

- The Next.js boilerplate already set up
- The CMS data layer (`constants.ts`, `cms-data.ts`, `types.ts`, `image-utils.ts`) ready to configure
- The `.claude/` directory with shared rules and skills
- A `CLAUDE.md` template with blanks to fill in
- A `COMPONENTS.md` with your base component library

For each new client migration, fork the template and customize.

### 8.3 — Team Workflow

1. **Developer starts a migration** → forks the template repo
2. **Exports the Webflow site** → copies code into `_webflow-reference/`
3. **Fills in `CLAUDE.md`** → adds collection IDs, site URLs, brand guidelines
4. **Opens in Claude Code** → starts prompting page-by-page
5. **Runs `/deploy`** → uses the deploy command to push to Vercel
6. **Runs `/audit`** → uses the audit command to check SEO and accessibility

---

## Quick Reference: Key Files

| What You Need | Where To Find It |
|---------------|-----------------|
| CMS collection IDs | `src/lib/constants.ts` and `CLAUDE.md` |
| TypeScript types for CMS data | `src/lib/types.ts` |
| CMS fetch functions | `src/lib/cms-data.ts` |
| Image optimization helpers | `src/lib/image-utils.ts` |
| Static asset helper (`asset()`) | `src/lib/assets.ts` |
| Design tokens (colors, fonts) | `src/app/globals.css` (@theme block) |
| Static text content | `src/data/content/*.json` |
| Content getter functions | `src/lib/content-utils.ts` |
| All reusable components | `COMPONENTS.md` |
| Coding rules for Claude | `.claude/rules/` |
| Task-specific skills | `.claude/skills/` |
| Specialist agents | `.claude/agents/` |

---

## Common Pitfalls

**"My images show locally but 404 in production"**
You're probably using a bare path like `/images/logo.svg`. Wrap it with `asset('/images/logo.svg')` so all asset paths go through one normalizer.

**"Tailwind classes aren't working"**
This project uses Tailwind v4 with CSS-native config. There is no `tailwind.config.ts` file. All tokens are defined in the `@theme` block inside `globals.css`. If you need a new color or breakpoint, add it there.

**"CMS data isn't loading on the deployed site"**
Check that your environment variables (`WEBFLOW_SITE_API_TOKEN`, `WEBFLOW_SITE_ID`) are set in Vercel's project settings. They're separate from your local `.env.local`.

**"I'm getting type errors with `params`"**
In Next.js 15+, `params` in dynamic routes is a Promise. You must `await` it:
```typescript
const { slug } = await params;  // Correct
const { slug } = params;        // Will error
```

**"My components look different from what's on the Webflow site"**
Claude Code uses the exported Webflow HTML as a *reference*, not a pixel-perfect template. After migration, do a visual review side-by-side and prompt Claude to adjust specific things: "Make the hero section heading larger" or "The card grid should be 3 columns on desktop, not 2."

**"COMPONENTS.md is out of date and Claude keeps recreating things"**
This is the most common system failure. After every session where components changed, update `COMPONENTS.md`. Put it in your session-end checklist.

---

## Next Steps

This guide covers the core migration workflow. As you do more projects, you'll build up:

- A richer component library that carries across projects
- More refined Claude rules based on patterns you discover
- Additional skills for things like email template generation, analytics setup, or A/B testing
- A more opinionated starter template that reduces setup time

The key insight is: **the config files are the product.** The Next.js code is the output, but the `.claude/` directory and `CLAUDE.md` are what make it repeatable. Invest time in keeping them sharp.
