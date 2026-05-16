import { chromium } from "playwright";
import { mkdirSync } from "fs";

const OUT = "/tmp/blog-audit-after";
mkdirSync(OUT, { recursive: true });

const pages = [
  { slug: "blog", path: "/blog", label: "index" },
  { slug: "blog/schema-markup-for-aeo-2026", path: "/blog/schema-markup-for-aeo-2026", label: "schema" },
  { slug: "blog/share-of-answer", path: "/blog/share-of-answer", label: "share-of-answer" },
  { slug: "blog/best-webflow-agencies", path: "/blog/best-webflow-agencies", label: "best-webflow" },
  { slug: "blog/answer-engine-optimization-guide-2026", path: "/blog/answer-engine-optimization-guide-2026", label: "aeo-guide" },
];

const viewports = [
  { name: "desktop", width: 1456, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch();

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  for (const p of pages) {
    const url = `http://localhost:3005${p.path}?cb=${Date.now()}`;
    console.log(`[${vp.name}] ${p.path}`);
    try {
      await page.goto(url, { waitUntil: "load", timeout: 30000 });
      await page.waitForSelector("h1, h2", { timeout: 10000 }).catch(() => null);
      // Disable animations for stable screenshots
      await page.addStyleTag({
        content: `*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }`,
      });
      await page.waitForTimeout(1200);

      await page.screenshot({
        path: `${OUT}/${vp.name}-${p.label}-hero.png`,
        clip: { x: 0, y: 0, width: vp.width, height: vp.height },
      });

      await page.screenshot({
        path: `${OUT}/${vp.name}-${p.label}-full.png`,
        fullPage: true,
      });
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }
  }

  await ctx.close();
}

await browser.close();
console.log(`\nSaved screenshots to ${OUT}/`);
