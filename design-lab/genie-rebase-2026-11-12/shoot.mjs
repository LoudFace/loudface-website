// Screenshots of the live Genie Teacher case study: the key results block and the results table.
// node design-lab/genie-rebase-2026-11-12/shoot.mjs <before|after>
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
const tag = process.argv[2];
if (!['before', 'after'].includes(tag)) throw new Error('pass before or after');
const dir = fileURLToPath(new URL('.', import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`https://www.loudface.co/case-studies/genie-teacher-organic-growth?shot=${Date.now()}`, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: 'header, [class*="nav"] { position: static !important; }' });
const shots = [['results', 'What changed for'], ['table', 'The results'], ['hero', null]];
for (const [name, text] of shots) {
  if (!text) { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600); await page.screenshot({ path: `${dir}${tag}-${name}.png` }); continue; }
  const h = page.getByRole('heading', { name: text }).first();
  await h.scrollIntoViewIfNeeded();
  const y = await h.evaluate((el) => el.getBoundingClientRect().top + window.scrollY - 40);
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${dir}${tag}-${name}.png` });
}
await browser.close();
console.log('done', tag);
