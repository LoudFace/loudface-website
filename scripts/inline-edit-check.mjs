#!/usr/bin/env node
/**
 * The five mechanical rules of the client inline editor, as a gate.
 *
 * Copied from the site-engineering skill's `check.mjs`, section 8, so this
 * repository can run them with nothing installed but itself. Each one is a
 * failure that has actually happened and that nobody caught by reading:
 *
 *   1. the bar is mounted, and only behind a Draft Mode gate;
 *   2. every content getter returns through `markTree()`;
 *   3. no `generateMetadata` reads a marked getter (a marker in a title tag);
 *   4. no component transforms a content value (it strips the marker);
 *   5. every content file name and key matches what the publish route accepts.
 *
 * Two of the skill's checks are deliberately not here: the editor tests, which
 * CI runs as their own step, and the anonymous-output curl, which needs the
 * live site and cannot run on a pull request.
 *
 * Exit code: 1 on any FAIL, 0 otherwise. WARN never fails the run.
 *
 * Usage: node scripts/inline-edit-check.mjs [repo-root]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? process.cwd();
if (!existsSync(join(root, 'package.json'))) {
  console.error(`No package.json in ${root} — pass the repo root as the first argument.`);
  process.exit(2);
}

const results = [];
const add = (level, id, msg, hits = []) => results.push({ level, id, msg, hits });

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'out', '.vercel', '.turbo', 'public']);
function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(join(dir, entry.name));
    } else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name)) {
      yield join(dir, entry.name);
    }
  }
}

const srcRoot = existsSync(join(root, 'src')) ? join(root, 'src') : root;
const codeFiles = [...walk(srcRoot)].map((path) => ({
  path,
  rel: relative(root, path),
  text: readFileSync(path, 'utf8'),
}));

function grep(fileList, regex) {
  const hits = [];
  for (const file of fileList) {
    file.text.split('\n').forEach((line, index) => {
      if (regex.test(line)) hits.push(`${file.rel}:${index + 1}  ${line.trim().slice(0, 120)}`);
    });
  }
  return hits;
}

if (!existsSync(join(root, 'src/lib/inline-edit'))) {
  add('PASS', 'inline-editor', 'Inline editor not installed on this site (installed only when the client asks).');
} else {
  // 1. The bar is mounted, and only behind a Draft Mode gate. The skill's copy
  // looks for `<InlineEditor />` alone; since the shell landed the editor wraps
  // the site (`<InlineEditor>{site}</InlineEditor>`), so both spellings count.
  const barFiles = codeFiles.filter((f) => /<InlineEditor[\s>]/.test(f.text));
  const barUngated = barFiles.filter((f) => !/draftMode\s*\(/.test(f.text));
  if (!barFiles.length) {
    add('FAIL', 'inline-editor-mounted', 'src/lib/inline-edit exists but no layout renders <InlineEditor /> — the client signs in and sees no bar.');
  } else if (barUngated.length) {
    add('FAIL', 'inline-editor-draft-gate', 'InlineEditor is rendered in a file with no draftMode() gate — editor code would reach anonymous visitors.', barUngated.map((f) => f.rel));
  } else {
    add('PASS', 'inline-editor-draft-gate', `InlineEditor mounted behind draftMode() (${barFiles.map((f) => f.rel).join(', ')}).`);
  }

  // 2. Every content getter returns through markTree().
  const utils = codeFiles.find((f) => /(^|\/)src\/lib\/content-utils\.tsx?$/.test(f.rel));
  if (!utils) {
    add('WARN', 'inline-editor-getters', 'No src/lib/content-utils.ts — where do the content getters live? Every getter must return through markTree().');
  } else {
    const getters = [...utils.text.matchAll(/export\s+async\s+function\s+(get\w+Content)\s*\([^)]*\)[^{]*\{([\s\S]*?)\n\}/g)];
    const unmarked = getters.filter((m) => !/markTree\s*\(/.test(m[2])).map((m) => m[1]);
    if (!getters.length) {
      add('WARN', 'inline-editor-getters', 'content-utils.ts exports no get<Page>Content getters — nothing on the site is editable.');
    } else if (unmarked.length) {
      add('FAIL', 'inline-editor-getters', `Content getters that do not return through markTree() (${unmarked.length}) — their pages render but nothing on them can be clicked.`, unmarked);
    } else {
      add('PASS', 'inline-editor-getters', `${getters.length} content getters return through markTree().`);
    }
  }

  // 3. A marker must never reach a <title>, JSON-LD or an attribute.
  const metaLeaks = [];
  for (const file of codeFiles) {
    const block = /export\s+async\s+function\s+generateMetadata[\s\S]*?\n\}/.exec(file.text);
    if (block && /await\s+get\w+Content\s*\(/.test(block[0])) metaLeaks.push(file.rel);
  }
  if (metaLeaks.length) {
    add('FAIL', 'inline-editor-metadata-raw', `generateMetadata calls a marked content getter (${metaLeaks.length}) — use rawContent(); a marker in a title tag is visible to crawlers.`, metaLeaks);
  } else {
    add('PASS', 'inline-editor-metadata-raw', 'No generateMetadata reads a marked getter.');
  }

  // 4. No component transforms a content value.
  const transforms = grep(
    codeFiles.filter((f) => /\.tsx$/.test(f.rel)),
    /\bcontent(?:\.[A-Za-z_$][\w$]*|\[[^\]]+\])+\.(?:split|slice|substring|toUpperCase|toLowerCase|trim|replace)\s*\(/,
  );
  if (transforms.length) {
    add('WARN', 'inline-editor-no-transforms', `Content values transformed in components (${transforms.length}) — split/slice/case changes strip the marker and the value silently stops being editable. Shape the value in the JSON.`, transforms.slice(0, 15));
  } else {
    add('PASS', 'inline-editor-no-transforms', 'No content value is transformed in a component.');
  }

  // 5. Content keys the publish route would reject: file [a-z0-9-], keys [A-Za-z0-9_].
  const contentDir = join(root, 'src/data/content');
  const badKeys = [];
  const badFiles = [];
  const walkKeys = (node, file, path) => {
    if (Array.isArray(node)) node.forEach((value, index) => walkKeys(value, file, `${path}.${index}`));
    else if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (!/^[A-Za-z0-9_]+$/.test(key)) badKeys.push(`${file}:${path ? `${path}.` : ''}${key}`);
        walkKeys(value, file, path ? `${path}.${key}` : key);
      }
    }
  };
  let contentFiles = [];
  try {
    contentFiles = readdirSync(contentDir).filter((name) => name.endsWith('.json'));
  } catch {
    /* no content dir */
  }
  for (const name of contentFiles) {
    if (!/^[a-z0-9-]+\.json$/.test(name)) badFiles.push(name);
    try {
      walkKeys(JSON.parse(readFileSync(join(contentDir, name), 'utf8')), name, '');
    } catch (error) {
      badFiles.push(`${name} (${error.message})`);
    }
  }
  if (!contentFiles.length) {
    add('WARN', 'inline-editor-content-keys', 'src/data/content holds no JSON — the editor has nothing to edit outside Sanity.');
  } else if (badFiles.length || badKeys.length) {
    add('FAIL', 'inline-editor-content-keys', `Content file names or keys the publish route rejects (${badFiles.length + badKeys.length}) — they render, accept typing, then fail the whole publish with "Bad field path".`, [...badFiles, ...badKeys]);
  } else {
    add('PASS', 'inline-editor-content-keys', `${contentFiles.length} content files, every key matches [A-Za-z0-9_].`);
  }
}

const order = { FAIL: 0, WARN: 1, PASS: 2 };
results.sort((a, b) => order[a.level] - order[b.level]);
const fails = results.filter((r) => r.level === 'FAIL');
const warns = results.filter((r) => r.level === 'WARN');

console.log(`\ninline editor check — ${new Date().toISOString()} — ${root}\n`);
for (const result of results) {
  console.log(`[${result.level}] ${result.id}: ${result.msg}`);
  for (const hit of result.hits.slice(0, 15)) console.log(`    ${hit}`);
  if (result.hits.length > 15) console.log(`    …and ${result.hits.length - 15} more`);
}
console.log(`\nSummary: ${fails.length} FAIL, ${warns.length} WARN, ${results.length - fails.length - warns.length} PASS`);
process.exit(fails.length ? 1 : 0);
