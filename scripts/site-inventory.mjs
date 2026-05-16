#!/usr/bin/env node
// scripts/site-inventory.mjs
//
// Outputs a structured site inventory: every published Sanity entry + every
// static Next.js route. Used by /draft-content (Step 4.5) and /critique-content
// (internal-link validation) so blog drafts reference real pages, not
// hallucinated URLs.
//
// Usage:
//   node scripts/site-inventory.mjs            → JSON output
//   node scripts/site-inventory.mjs --markdown → markdown digest
//
// Always pulls from live data (Sanity + filesystem). No caching — runs in a
// few seconds. Safe to invoke repeatedly.

import { createClient } from "@sanity/client";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const env = readFileSync(".env.local", "utf8").split("\n").reduce((a, l) => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) a[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  return a;
}, {});

const client = createClient({
  projectId: "xjjjqhgt",
  dataset: "production",
  apiVersion: "2025-03-29",
  useCdn: false,
  token: env.SANITY_API_TOKEN,
});

// ─── 1. Sanity collections ────────────────────────────────────────────────

const blogPosts = await client.fetch(`
  *[_type == "blogPost" && !(_id in path("drafts.**"))]{
    "slug": slug.current,
    name,
    excerpt,
    "category": category->name,
    publishedDate,
    lastUpdated
  } | order(publishedDate desc)
`);

const caseStudies = await client.fetch(`
  *[_type == "caseStudy" && !(_id in path("drafts.**"))]{
    "slug": slug.current,
    name,
    "industry": industry->name,
    "client": client->name,
    publishedDate
  } | order(publishedDate desc)
`);

const serviceCategories = await client.fetch(`
  *[_type == "serviceCategory" && !(_id in path("drafts.**"))]{
    "slug": slug.current,
    name,
    description
  } | order(name asc)
`);

const industries = await client.fetch(`
  *[_type == "industry" && !(_id in path("drafts.**"))]{
    "slug": slug.current,
    name
  } | order(name asc)
`);

const seoPages = await client.fetch(`
  *[_type == "seoPage" && !(_id in path("drafts.**"))]{
    "slug": slug.current,
    name
  } | order(name asc)
`);

const teamMembers = await client.fetch(`
  *[_type == "teamMember" && !(_id in path("drafts.**"))]{
    "slug": slug.current,
    name,
    role
  } | order(name asc)
`);

// ─── 2. Static Next.js routes (walk src/app) ──────────────────────────────

const appRoot = "src/app";
const staticRoutes = [];

function walkRoutes(dir, urlPath = "") {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });

  // Look for page.tsx in current dir
  const hasPage = entries.some(
    (e) => e.isFile() && (e.name === "page.tsx" || e.name === "page.ts"),
  );
  if (hasPage) {
    // Skip dynamic routes ([slug]) and parallel routes (@), we list the static parents only
    if (!urlPath.includes("[") && !urlPath.includes("@")) {
      staticRoutes.push({
        path: urlPath || "/",
        file: join(dir, "page.tsx").replace(/\\/g, "/"),
      });
    }
  }

  // Recurse into directories that aren't private (_), parallel (@), or interception ((..))
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (name.startsWith("_") || name.startsWith(".")) continue;

    // Route groups (parens) don't add to URL path
    const newUrlPath = name.startsWith("(") && name.endsWith(")")
      ? urlPath
      : `${urlPath}/${name}`;

    walkRoutes(join(dir, name), newUrlPath);
  }
}

function existsSync(p) {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}

walkRoutes(appRoot);

// ─── 3. Output ─────────────────────────────────────────────────────────────

const inventory = {
  generatedAt: new Date().toISOString(),
  summary: {
    blogPosts: blogPosts.length,
    caseStudies: caseStudies.length,
    serviceCategories: serviceCategories.length,
    industries: industries.length,
    seoPages: seoPages.length,
    teamMembers: teamMembers.length,
    staticRoutes: staticRoutes.length,
  },
  blogPosts,
  caseStudies,
  serviceCategories,
  industries,
  seoPages,
  teamMembers,
  staticRoutes,
};

const arg = process.argv[2];

if (arg === "--markdown" || arg === "-m") {
  // Human-readable digest
  const lines = [];
  lines.push(`# Site Inventory — ${inventory.generatedAt}\n`);
  lines.push(`**Summary:** ${blogPosts.length} blog posts · ${caseStudies.length} case studies · ${serviceCategories.length} service pages · ${industries.length} industries · ${staticRoutes.length} static routes\n`);

  lines.push(`## Static Next.js routes (${staticRoutes.length})\n`);
  for (const r of staticRoutes.sort((a, b) => a.path.localeCompare(b.path))) {
    lines.push(`- \`${r.path}\``);
  }

  lines.push(`\n## Service categories (${serviceCategories.length})\n`);
  for (const s of serviceCategories) {
    lines.push(`- /services/${s.slug} — ${s.name}`);
  }

  lines.push(`\n## Industries (${industries.length})\n`);
  for (const i of industries) {
    lines.push(`- /seo-for/${i.slug} — ${i.name}`);
  }

  lines.push(`\n## Case studies (${caseStudies.length})\n`);
  for (const c of caseStudies) {
    lines.push(`- /case-studies/${c.slug} — ${c.name}${c.industry ? ` (${c.industry})` : ""}`);
  }

  lines.push(`\n## Blog posts — most-recent first (${blogPosts.length})\n`);
  for (const b of blogPosts.slice(0, 50)) {
    lines.push(`- /blog/${b.slug} — ${b.name}${b.category ? ` [${b.category}]` : ""}`);
  }
  if (blogPosts.length > 50) {
    lines.push(`\n_…and ${blogPosts.length - 50} more older posts. Re-run with \`--json\` for full list._`);
  }

  lines.push(`\n## SEO pages (${seoPages.length})`);
  for (const p of seoPages) lines.push(`- /${p.slug} — ${p.name}`);

  lines.push(`\n## Team members (${teamMembers.length})`);
  for (const t of teamMembers) lines.push(`- /team/${t.slug} — ${t.name}${t.role ? ` (${t.role})` : ""}`);

  console.log(lines.join("\n"));
} else {
  console.log(JSON.stringify(inventory, null, 2));
}
