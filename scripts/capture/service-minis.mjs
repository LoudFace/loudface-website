// Captures each service page's hero picture (the art on its tinted panel, without the panel or the proof card)
// as a transparent PNG for the /services hub cards. Run with the dev server up: node scripts/capture/service-minis.mjs
import { chromium } from 'playwright';
const SLUGS = ['geo-agency', 'ai-overviews', 'seo-aeo', 'organic-growth', 'growth-autopilot', 'cro', 'copywriting', 'ux-ui-design', 'webflow'];
const base = process.env.BASE ?? 'http://localhost:3005';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
for (const slug of SLUGS) {
  await page.goto(`${base}/dev-preview/home-v11-service/${slug}`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3500);
  await page.addStyleTag({ content: '.sv-hero2-card { visibility: hidden !important; } .sv-hero2-panel { background: transparent !important; } html, body, .sv-hero2 { background: transparent !important; } header, .v11-hero-photo { visibility: hidden !important; }' });
  const clip = await page.evaluate(() => {
    const p = document.querySelector('.sv-hero2-panel').getBoundingClientRect();
    const a = document.querySelector('.sv-hero2-art').getBoundingClientRect();
    const x = Math.max(p.left, a.left) - 30, y = Math.max(p.top, a.top) - 30;
    return { x, y: y + window.scrollY, width: Math.min(p.right, a.right) - x, height: Math.min(p.bottom, a.bottom) - y };
  });
  await page.screenshot({ path: `public/images/home-v11/services/${slug}.png`, clip, omitBackground: true });
  console.log(slug, Math.round(clip.width), Math.round(clip.height));
}
await browser.close();
