import { chromium } from 'playwright';
const [,, out, ...routes] = process.argv;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
for (const r of routes) {
  await p.goto('http://localhost:3005' + r, { waitUntil: 'load', timeout: 150000 });
  await p.addStyleTag({ content: 'header, nextjs-portal, [aria-label="Cookie consent"] { display: none !important; }' });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 800) { await p.evaluate((yy) => scrollTo(0, yy), y); await p.waitForTimeout(40); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/${r.replace(/\//g, '_') || 'home'}.png`, fullPage: true });
  console.log(r, h);
}
await b.close();
