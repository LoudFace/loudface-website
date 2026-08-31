/**
 * Case-study thumbnail renderer — the shared template behind every
 * /case-studies/* thumbnail (brand-gradient ground, two browser panels of real
 * screenshots, one white stat card).
 *
 * Written 2026-08-31 because five thumbnails had been hand-composed one at a
 * time and the sixth (stealth-fintech) shipped as a generic AI illustration
 * that broke the set.
 *
 * Usage:
 *   node scripts/case-study-thumbnail/render.mjs configs/<slug>.json [--variant b]
 *
 * Output: scripts/case-study-thumbnail/out/<slug>[-<variant>].png at 2880x1800.
 */
import { chromium } from 'playwright';
import { WIREFRAMES } from './wireframes.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './args.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const OUT = path.join(HERE, 'out');
const CACHE = path.join(HERE, 'out', '.shots');

const WIDTH = 1440;
const HEIGHT = 900;
const SCALE = 2; // -> 2880x1800, matching the existing thumbnails

const USAGE = 'render.mjs <config.json> [--variant b] [--no-cache]';
const argv = parseArgs(process.argv.slice(2), {
  booleans: ['no-cache'],
  values: ['variant'],
  usage: USAGE,
});
const configArg = argv._[0];
if (!configArg) { console.error(`usage: ${USAGE}`); process.exit(1); }
const variant = argv.variant ?? null;
const noCache = argv['no-cache'] === true;

const configPath = path.isAbsolute(configArg) ? configArg : path.join(HERE, configArg);
const config = JSON.parse(await readFile(configPath, 'utf8'));

const layout = variant
  ? config.variants?.[variant] ?? (() => { throw new Error(`no variant "${variant}" in ${configPath}`); })()
  : config;

const panels = layout.panels ?? config.panels;
const card = layout.card ?? config.card;

await mkdir(OUT, { recursive: true });
await mkdir(CACHE, { recursive: true });

const dataUri = async (absPath, mime) =>
  `data:${mime};base64,${(await readFile(absPath)).toString('base64')}`;

const browser = await chromium.launch();

/* ---------- 1. capture each panel's screenshot ---------- */
async function capture(panel, index) {
  // Hash, never a truncated encoding: every panel's key string starts with the
  // same long URL, so a truncated base64 collided across different scroll
  // positions and clips and served the wrong cached screenshot.
  const fingerprint = JSON.stringify({
    url: panel.url,
    scrollTo: panel.scrollTo ?? 0,
    viewport: panel.viewport ?? null,
    clipHeight: panel.clipHeight ?? null,
    hideSelectors: panel.hideSelectors ?? null,
  });
  const key = `${config.slug}-${index}-${
    panel.cacheKey ?? createHash('sha256').update(fingerprint).digest('hex').slice(0, 16)
  }.png`;
  const file = path.join(CACHE, key);
  if (!noCache) {
    try { await readFile(file); console.log(`  cached  panel ${index}`); return file; } catch {}
  }

  const vw = panel.viewport?.width ?? 1440;
  const vh = panel.viewport?.height ?? 900;
  const page = await browser.newPage({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: 2,
  });
  await page.goto(panel.url, { waitUntil: 'networkidle', timeout: 60_000 });
  // The site animates in on scroll; give it room to settle before capture.
  await page.waitForTimeout(1500);
  for (const sel of panel.hideSelectors ?? []) {
    await page.evaluate((s) => {
      document.querySelectorAll(s).forEach((el) => { el.style.visibility = 'hidden'; });
    }, sel);
  }
  if (panel.scrollTo) {
    await page.evaluate((y) => window.scrollTo(0, y), panel.scrollTo);
    await page.waitForTimeout(1500);
  }
  await page.screenshot({
    path: file,
    clip: panel.clipHeight
      ? { x: 0, y: 0, width: vw, height: panel.clipHeight }
      : undefined,
  });
  await page.close();
  console.log(`  shot    panel ${index}  ${panel.url}`);
  return file;
}

const shots = [];
for (const [i, panel] of panels.entries()) {
  shots.push(panel.wireframe ? null : await capture(panel, i));
}

/* ---------- 2. build the composite HTML ---------- */
const dots = ['#ff5f57', '#febc2e', '#28c840']
  .map((c) => `<div class="dot" style="background:${c}"></div>`)
  .join('');

const panelHtml = (
  await Promise.all(
    panels.map(async (panel, i) => {
      const s = panel.style ?? {};
      const css = Object.entries({
        left: s.left, right: s.right, top: s.top, bottom: s.bottom,
        width: s.width, 'z-index': s.z ?? i,
      })
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}:${typeof v === 'number' ? `${v}px` : v}`)
        .join(';');
      const chrome = panel.chrome === false ? '' :
        `<div class="chrome">${dots}<div class="url">${panel.chrome ?? ''}</div></div>`;

      if (panel.wireframe) {
        const build = WIREFRAMES[panel.wireframe];
        if (!build) throw new Error(`unknown wireframe "${panel.wireframe}"`);
        // Wireframes are authored in a 1440-wide space. `zoom` scales them to the
        // panel width AND affects layout, so the panel crops tight to the content
        // with no dead white band below it (transform: scale would not).
        const zoom = (s.width ?? 900) / 1440;
        return `<div class="panel" style="${css}">${chrome}
          <div style="--wf-accent:${panel.accent ?? '#4f46e5'};width:1440px;zoom:${zoom}">
            ${build()}
          </div></div>`;
      }

      const src = await dataUri(shots[i], 'image/png');
      return `<div class="panel" style="${css}">${chrome}<img class="shot" src="${src}"></div>`;
    })
  )
).join('\n');

const cardHtml = card
  ? `<div class="card" style="${Object.entries({
      left: card.left, right: card.right, top: card.top, bottom: card.bottom,
      width: card.width, 'z-index': 50,
    })
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}:${typeof v === 'number' ? `${v}px` : v}`)
      .join(';')}">
      ${card.label ? `<div class="label">${card.label}</div>` : ''}
      <div class="value">${card.value}</div>
      ${card.caption ? `<div class="rule"></div><div class="caption">${card.caption}</div>` : ''}
    </div>`
  : '';

const theme = config.theme ?? {};
let html = await readFile(path.join(HERE, 'template.html'), 'utf8');
const replacements = {
  __FONT_REGULAR__: await dataUri(path.join(REPO, 'public/fonts/NeueMontreal-Regular.woff2'), 'font/woff2'),
  __FONT_MEDIUM__: await dataUri(path.join(REPO, 'public/fonts/NeueMontreal-Medium.woff2'), 'font/woff2'),
  __BG__: theme.background ?? '#111',
  __BLOOM__: theme.bloom ?? 'none',
  __CARD_BG__: theme.cardBg ?? '#fbfaf8',
  __CARD_VALUE__: theme.cardValue ?? '#0f172a',
  __CARD_VALUE_SIZE__: `${card?.valueSize ?? 62}px`,
  __CARD_MUTED__: theme.cardMuted ?? 'rgba(15,23,42,.55)',
  __CARD_RULE__: theme.cardRule ?? 'rgba(15,23,42,.18)',
  __PANELS__: panelHtml,
  __CARD__: cardHtml,
};
for (const [k, v] of Object.entries(replacements)) html = html.split(k).join(v);

const htmlPath = path.join(OUT, `${config.slug}${variant ? `-${variant}` : ''}.html`);
await writeFile(htmlPath, html);

/* ---------- 3. render the canvas ---------- */
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: SCALE,
});
await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
const outPath = path.join(OUT, `${config.slug}${variant ? `-${variant}` : ''}.png`);
await page.screenshot({ path: outPath });
await browser.close();

console.log(`\n${outPath}  (${WIDTH * SCALE}x${HEIGHT * SCALE})`);
