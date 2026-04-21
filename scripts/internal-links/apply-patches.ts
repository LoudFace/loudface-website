/**
 * Apply internal-link patches to Sanity.
 *
 * Reads every JSON file in scripts/internal-links/patches/, validates each,
 * and patches the corresponding blogPost's `content` field. Also defaults
 * `lastUpdated` to now so the ISR cache refreshes promptly.
 *
 * Validation (per patch file):
 *   - JSON is well-formed
 *   - slug references a real published blogPost
 *   - editedContent preserves original stripped text (no silent content loss)
 *   - editedContent has MORE internal links than the original (actually added some)
 *   - editedContent has no self-links
 *   - editedContent has no nested <a> tags
 *
 * Skipped patches (`"skip": true`) are logged and ignored.
 * Failed validations are logged with the reason; nothing is patched for that slug.
 *
 * Run: npx tsx scripts/internal-links/apply-patches.ts [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { sanityClient } from '../visuals/lib/sanity';

interface Patch {
  slug: string;
  skip?: boolean;
  reason?: string;
  currentLinksBefore?: number;
  linksAdded?: number;
  editedContent?: string;
  addedLinks?: Array<{ targetSlug: string; anchorText: string; context: string }>;
}

/**
 * Strip HTML to a canonical text form for before/after content comparison.
 *
 * Inserts a space where each tag used to be (so block-level boundaries
 * like `<p>a</p><p>b</p>` don't collapse to "ab"), then collapses runs of
 * whitespace, then REMOVES whitespace that was introduced adjacent to
 * punctuation by the tag-stripping step. That last pass is important
 * because when an agent wraps a word that ends a sentence —
 * `<a>dynamic content</a>.` — the naive strip gives "dynamic content ."
 * instead of "dynamic content.". The content is semantically identical,
 * so the validator should treat it as such.
 */
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?)\]}—–])/g, '$1')
    .replace(/([([{—–])\s+/g, '$1')
    .trim();
}

function countInternalLinks(html: string): number {
  const matches = html.match(/href="([^"]+)"/g) ?? [];
  return matches.filter((m) =>
    /href="(https?:\/\/(www\.)?loudface\.co[^"]*|\/[^"]*)/.test(m),
  ).length;
}

function hasNestedAnchors(html: string): boolean {
  // A very rough check: find any <a ...> that doesn't close before the next <a ...>
  const anchorRe = /<a\b[^>]*>/gi;
  const closeRe = /<\/a>/gi;
  const opens = [...html.matchAll(anchorRe)].map((m) => m.index ?? -1);
  const closes = [...html.matchAll(closeRe)].map((m) => m.index ?? -1);
  if (opens.length !== closes.length) return true;
  for (let i = 0; i < opens.length - 1; i++) {
    if (opens[i + 1] < closes[i]) return true;
  }
  return false;
}

function hasSelfLink(html: string, slug: string): boolean {
  const re = new RegExp(`href="(https?://(www\\.)?loudface\\.co)?/blog/${slug}(/|\\?|#|")`, 'i');
  return re.test(html);
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');

  const patchesDir = path.resolve(process.cwd(), 'scripts/internal-links/patches');
  if (!fs.existsSync(patchesDir)) {
    throw new Error(`Patches dir not found: ${patchesDir}`);
  }

  const files = fs.readdirSync(patchesDir).filter((f) => f.endsWith('.json'));
  console.log(`→ Found ${files.length} patch file(s) in ${patchesDir}`);

  const client = sanityClient();

  let applied = 0;
  let skipped = 0;
  let failed = 0;
  const failures: Array<{ slug: string; reason: string }> = [];

  for (const file of files) {
    const fullPath = path.join(patchesDir, file);
    let patch: Patch;
    try {
      patch = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    } catch (err) {
      failed++;
      failures.push({ slug: file, reason: `Malformed JSON: ${err instanceof Error ? err.message : err}` });
      continue;
    }

    if (patch.skip) {
      console.log(`  ○ ${patch.slug}: skipped (${patch.reason ?? 'no reason'})`);
      skipped++;
      continue;
    }

    if (!patch.slug || !patch.editedContent) {
      failed++;
      failures.push({ slug: patch.slug ?? file, reason: 'missing slug or editedContent' });
      continue;
    }

    // Fetch original from Sanity. This is the authoritative source — we
    // don't trust the agent's "currentLinksBefore" field.
    const original = await client.fetch<{ _id: string; content?: string }>(
      `*[_type == "blogPost" && !(_id in path("drafts.**")) && slug.current == $slug][0]{ _id, content }`,
      { slug: patch.slug },
    );

    if (!original || !original.content) {
      failed++;
      failures.push({ slug: patch.slug, reason: `No published post found for slug` });
      continue;
    }

    const origStripped = stripTags(original.content);
    const editStripped = stripTags(patch.editedContent);
    if (origStripped !== editStripped) {
      // Show the first divergence for debugging
      let divergeAt = 0;
      for (let i = 0; i < Math.min(origStripped.length, editStripped.length); i++) {
        if (origStripped[i] !== editStripped[i]) { divergeAt = i; break; }
      }
      const snippet = `orig:"…${origStripped.slice(Math.max(0, divergeAt - 30), divergeAt + 30)}…" vs edit:"…${editStripped.slice(Math.max(0, divergeAt - 30), divergeAt + 30)}…"`;
      failed++;
      failures.push({
        slug: patch.slug,
        reason: `stripped text differs (orig ${origStripped.length} chars, edit ${editStripped.length}). ${snippet}`,
      });
      continue;
    }

    const origLinks = countInternalLinks(original.content);
    const editLinks = countInternalLinks(patch.editedContent);
    if (editLinks <= origLinks) {
      failed++;
      failures.push({ slug: patch.slug, reason: `no new links (${origLinks} → ${editLinks})` });
      continue;
    }

    if (hasSelfLink(patch.editedContent, patch.slug)) {
      failed++;
      failures.push({ slug: patch.slug, reason: 'contains self-link' });
      continue;
    }

    if (hasNestedAnchors(patch.editedContent)) {
      failed++;
      failures.push({ slug: patch.slug, reason: 'nested <a> tags detected' });
      continue;
    }

    const added = editLinks - origLinks;
    console.log(`  ✓ ${patch.slug}: ${origLinks} → ${editLinks} (+${added})`);

    if (!dryRun) {
      await client
        .patch(original._id)
        .set({
          content: patch.editedContent,
          lastUpdated: new Date().toISOString(),
        })
        .commit();
    }

    applied++;
  }

  console.log(`\n━━━ Apply summary ━━━`);
  console.log(`  Applied:  ${applied}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Failed:   ${failed}`);
  if (dryRun) console.log(`  (dry-run — no writes committed)`);

  if (failures.length > 0) {
    console.log(`\nFailures:`);
    for (const f of failures) {
      console.log(`  · ${f.slug}: ${f.reason}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
