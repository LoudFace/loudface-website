// Reports two DESIGN.md §2.7 numbers for a page, as diagnostics, never pass marks: the tinted radial-gradient grounds
// (above 3, each must sit behind a UI picture, §2.3) and the share of section area that is photographs, videos and
// live charts (on 2026-09-25 pricing v1 measured 3% and 5 tints and beat v2 at 30% and 0). The pass/fail judgement is
// the §2.1 picture test, done by a person. Needs the dev server (default http://localhost:3005).
//
//   node scripts/design/measure-look.mjs /dev-preview/home-v11 /dev-preview/home-v11-pricing
//
// The homepage measured 41% pictures and 2 tinted grounds on 2026-09-25.
// Reading sections (an article body: [data-lf-body] or .v11-prose; an FAQ: .v11-faq-list; a comparison table) are left
// out: text is their job, and the homepage the target comes from has none. The count with them is printed too.
import { chromium } from 'playwright';

const base = process.env.BASE ?? 'http://localhost:3005';
const routes = process.argv.slice(2);
if (!routes.length) {
  console.error('usage: node scripts/design/measure-look.mjs <route> [route ...]');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
for (const route of routes) {
  await page.goto(base + route, { waitUntil: 'load', timeout: 90000 });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 800) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(1500);
  const m = await page.evaluate(() => {
    // top-level sections between the header and the closing, footer excluded
    const sections = [...document.querySelectorAll('.v11 section, .v11 header')]
      .filter((s) => !s.closest('footer') && !s.parentElement.closest('section, .v11 > article > header') && !s.matches('.v11-closing') && s.getBoundingClientRect().height > 200);
    const reading = (s) => !!s.querySelector('[data-lf-body], .v11-prose, .v11-faq-list, table');
    let area = 0, pics = 0, allArea = 0;
    const tints = new Set();
    for (const s of sections) {
      const sr = s.getBoundingClientRect();
      allArea += sr.width * sr.height;
      for (const el of [s, ...s.querySelectorAll('*')]) {
        const bg = getComputedStyle(el).backgroundImage;
        if (bg.includes('radial-gradient')) tints.add(bg.slice(0, 80));
      }
      if (reading(s)) continue;
      area += sr.width * sr.height;
      for (const el of s.querySelectorAll('img, video, .v11-lc')) {
        const r = el.getBoundingClientRect();
        if (r.width < 120 || r.height < 80) continue;
        // clip to the section so bleeding pictures are not counted twice
        const w = Math.max(0, Math.min(r.right, sr.right) - Math.max(r.left, sr.left));
        const h = Math.max(0, Math.min(r.bottom, sr.bottom) - Math.max(r.top, sr.top));
        pics += w * h;
      }
    }
    return { sections: sections.length, pictures: +(100 * pics / Math.max(area, 1)).toFixed(1), withReading: +(100 * pics / Math.max(allArea, 1)).toFixed(1), tints: tints.size };
  });
  console.log(`${route}  tinted grounds ${m.tints}${m.tints > 3 ? ' (above 3: each must sit behind a UI picture)' : ''}  ·  picture share ${m.pictures}% (${m.withReading}% with reading sections)  sections ${m.sections}`);
}
await browser.close();

