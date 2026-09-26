// Re-import v11 preview pages into the Paper file as boards (desktop 1440 or phone 390), replacing the old board
// in place. Wraps the team plugin's import scripts (extract → localise → push) with the flags every v11 page needs,
// then fixes the one thing push misses: Paper keeps an image's crop in background-position and ignores
// object-position, so each image's object-position is copied across. Stops when Paper reports the file too large
// (the first v11 file hit that limit on 2026-09-26).
//
//   node scripts/design/paper-v11-import.mjs <jobs.json> <results.jsonl> <paperFileId>
//
// jobs.json: [{ "slug", "route", "name", "left", "top", "page", "width"?: 390, "replace"?: "<old board id>",
//               "raster"?: ["<extra selector to capture as an image>"], "skip"?: ["<selector to leave out>"] }]
// Needs the dev server on http://localhost:3005 and Paper Desktop open. Board positions: docs/v11-handoff.md.
import { spawnSync } from 'node:child_process';
import { readFileSync, appendFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const M = process.env.LF_PAPER_SCRIPTS
  || join(homedir(), '.claude/plugins/marketplaces/loudface/plugins/loudface-skills/skills/design-directions/scripts/paper');
const [jobsPath, outPath, FILE] = process.argv.slice(2);
if (!jobsPath || !outPath || !FILE) {
  console.error('usage: node scripts/design/paper-v11-import.mjs <jobs.json> <results.jsonl> <paperFileId>');
  process.exit(1);
}
const jobs = JSON.parse(readFileSync(jobsPath, 'utf8'));
const env = { ...process.env, PAPER_IMPORT_BASE: process.env.PAPER_IMPORT_BASE || 'http://localhost:3005' };
const run = (args) => spawnSync('node', args, { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const { connect, call } = await import(join(M, 'paper-client.mjs'));

// the last JSON object in a tool reply (Paper prefixes some replies with a file header)
const lastJson = (r) => {
  if (typeof r !== 'string') return r;
  const i = r.lastIndexOf('\n{');
  try { return JSON.parse(i >= 0 ? r.slice(i + 1) : r); } catch { return r; }
};

let connected = false;
async function sweep(board) {
  if (!connected) { await connect(); connected = true; }
  const raw = await call('find_nodes', { fileId: FILE, nodeId: board, filters: [{ styleName: 'objectPosition' }] });
  const tooLarge = typeof raw === 'string' && /too large/i.test(raw);
  const byValue = new Map();
  for (const n of lastJson(raw).nodes || []) {
    const v = (n.matched || []).find((m) => m.styleName === 'objectPosition')?.styleValue;
    if (!v || v === '50% 50%' || v === '50%') continue;
    if (!byValue.has(v)) byValue.set(v, []);
    byValue.get(v).push(n.id);
  }
  let fixed = 0;
  for (const [v, ids] of byValue) {
    await call('update_styles', { fileId: FILE, updates: [{ nodeIds: ids, styles: { backgroundPosition: v } }] });
    fixed += ids.length;
  }
  return { fixed, values: [...byValue.keys()], tooLarge };
}

for (const j of jobs) {
  const t0 = Date.now();
  // the logo marquee, the Cal.com embed and SVG hatch patterns import as images; the live cookie banner stays out
  const ex = [join(M, 'extract.mjs'), j.route, '--slug', j.slug, '--out', '.paper-import',
    '--raster', '.v11-lc > div:first-child', '--raster', '.v11-cal', '--raster', 'svg:has(pattern)',
    '--skip', '[aria-label="Cookie consent"]:not(.is-static)'];
  for (const r of j.raster || []) ex.push('--raster', r);
  for (const s of j.skip || []) ex.push('--skip', s);
  if (j.width) ex.push('--width', String(j.width));
  const a = run(ex);
  if (a.status !== 0) { appendFileSync(outPath, JSON.stringify({ ...j, ok: false, step: 'extract', err: (a.stderr || '').slice(-600) }) + '\n'); continue; }
  const b = run([join(M, 'localise-assets.mjs'), j.slug, '--dir', '.paper-import']);
  if (b.status !== 0) { appendFileSync(outPath, JSON.stringify({ ...j, ok: false, step: 'localise', err: (b.stderr || '').slice(-600) }) + '\n'); continue; }
  const push = [join(M, 'push.mjs'), `.paper-import/${j.slug}.paper.json`, '--file', FILE, '--page', j.page, '--name', j.name,
    '--left', String(j.left), '--top', String(j.top)];
  if (j.replace) push.push('--replace', j.replace);
  const c = run(push);
  const line = (c.stdout || '').trim().split('\n').filter((l) => l.startsWith('{"artboardId"')).pop();
  const board = line ? JSON.parse(line) : null;
  let swept = null;
  if (board) {
    try { swept = await sweep(board.artboardId); } catch (e) { swept = { err: String(e).slice(-300) }; }
  }
  appendFileSync(outPath, JSON.stringify({ ...j, ok: c.status === 0 && !!board, board, sweep: swept, secs: Math.round((Date.now() - t0) / 1000) }) + '\n');
  if (swept?.tooLarge) { appendFileSync(outPath, JSON.stringify({ stop: 'Paper says the file is too large' }) + '\n'); break; }
}
console.log('done', jobs.length);
process.exit(0);
