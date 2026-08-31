/**
 * Pull missing Bklit chart components from the registry configured in
 * components.json (`@bklit` -> https://ui.bklit.com/r/{name}.json).
 *
 * The charts directory is already vendored; this only adds what is absent.
 * Registry paths are `src/charts/*` and map onto `src/components/charts/*`.
 * Existing files are never overwritten — the vendored copies are the ones the
 * house components already import against.
 *
 *   node scripts/fetch-bklit-charts.mjs area-chart scatter-chart
 *   node scripts/fetch-bklit-charts.mjs --dry scatter-chart
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const REGISTRY = 'https://ui.bklit.com/r/{name}.json';
const CHARTS_DIR = 'src/components/charts';
const ROOT = process.cwd();

const args = process.argv.slice(2);
const dryRun = args.includes('--dry');
const roots = args.filter((a) => !a.startsWith('--'));

if (roots.length === 0) {
  console.error('usage: node scripts/fetch-bklit-charts.mjs [--dry] <item> [item...]');
  process.exit(1);
}

const seen = new Set();
const written = [];
const skipped = [];
const npmDeps = new Set();

/**
 * Registry paths are rooted at `src/`. Chart files re-root under the vendored
 * chart dir; anything else (e.g. `src/lib/utils.ts`) keeps its own path so a
 * shared helper does not get duplicated inside the charts folder.
 */
function localPath(registryPath) {
  if (registryPath.startsWith('src/charts/')) {
    return join(ROOT, CHARTS_DIR, registryPath.slice('src/charts/'.length));
  }
  return join(ROOT, registryPath);
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function fetchItem(name) {
  const key = name.replace(/^@bklit\//, '');
  if (seen.has(key)) return;
  seen.add(key);

  const url = REGISTRY.replace('{name}', key);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    console.warn(`  ! ${key}: registry returned ${res.status}`);
    return;
  }
  const item = await res.json();

  for (const dep of item.dependencies ?? []) npmDeps.add(dep);

  for (const file of item.files ?? []) {
    const target = localPath(file.path);
    if (await exists(target)) {
      skipped.push(file.path);
      continue;
    }
    if (!dryRun) {
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, file.content, 'utf8');
    }
    written.push(file.path);
  }

  for (const dep of item.registryDependencies ?? []) {
    if (dep.startsWith('@bklit/')) await fetchItem(dep);
  }
}

for (const root of roots) {
  console.log(`\n→ ${root}`);
  await fetchItem(root);
}

console.log(`\n${dryRun ? 'would write' : 'wrote'}: ${written.length} file(s)`);
for (const f of written) console.log(`  + ${f}`);
console.log(`already vendored, left alone: ${skipped.length} file(s)`);

const missingNpm = [];
const pkg = JSON.parse(await (await import('node:fs/promises')).readFile(join(ROOT, 'package.json'), 'utf8'));
const installed = { ...pkg.dependencies, ...pkg.devDependencies };
for (const d of npmDeps) if (!installed[d]) missingNpm.push(d);
if (missingNpm.length) {
  console.log(`\nnpm packages these components need but package.json lacks:`);
  console.log(`  npm install ${missingNpm.join(' ')}`);
} else {
  console.log('\nall required npm packages are already in package.json');
}
