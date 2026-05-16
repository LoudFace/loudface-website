import { chromium } from "playwright";
import { mkdirSync } from "fs";

const OUT = "/tmp/blog-audit";
mkdirSync(OUT, { recursive: true });

const pages = [
  { slug: "blog", url: "https://www.loudface.co/blog", label: "index" },
  { slug: "blog/schema-markup-for-aeo-2026", url: "https://www.loudface.co/blog/schema-markup-for-aeo-2026", label: "schema" },
  { slug: "blog/share-of-answer", url: "https://www.loudface.co/blog/share-of-answer", label: "share-of-answer" },
  { slug: "blog/best-webflow-agencies", url: "https://www.loudface.co/blog/best-webflow-agencies", label: "best-webflow" },
  { slug: "blog/answer-engine-optimization-guide-2026", url: "https://www.loudface.co/blog/answer-engine-optimization-guide-2026", label: "aeo-guide" },
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
    console.log(`[${vp.name}] ${p.url}`);
    try {
      await page.goto(p.url + "?cb=" + Date.now(), {
        waitUntil: "load",
        timeout: 30000,
      });
      // Disable smooth-scroll, animations briefly
      await page.addStyleTag({
        content: `*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }`,
      });
      // Wait for hero image to be in DOM (LCP indicator) — bounded so a missing one doesn't kill the script
      await page.waitForSelector("h1", { timeout: 10000 }).catch(() => null);
      await page.waitForTimeout(1500);

      // Full-page screenshot (cropped to first viewport-height for hero)
      await page.screenshot({
        path: `${OUT}/${vp.name}-${p.label}-hero.png`,
        clip: { x: 0, y: 0, width: vp.width, height: vp.height },
      });

      // Full-page for layout/scanability
      await page.screenshot({
        path: `${OUT}/${vp.name}-${p.label}-full.png`,
        fullPage: true,
      });

      // Compute metrics on the page
      if (p.label !== "index") {
        const metrics = await page.evaluate(() => {
          const h1 = document.querySelector("h1");
          const article = document.querySelector("article");
          const toc = document.querySelector(".toc, nav.toc, [class*='toc']");
          const faq = document.querySelector("[class*='faq'], [id*='faq']");
          const tables = document.querySelectorAll(".blog-table-wrap").length;
          const h2s = document.querySelectorAll(".blog-prose h2").length;
          const paragraphs = document.querySelectorAll(".blog-prose p").length;
          const articleRect = article?.getBoundingClientRect();
          return {
            h1Text: h1?.textContent?.trim().slice(0, 80),
            h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
            articleWidth: articleRect?.width,
            tocPresent: !!toc,
            h2Count: h2s,
            paragraphCount: paragraphs,
            tableCount: tables,
            faqPresent: !!faq,
          };
        });
        console.log(`  metrics:`, metrics);
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }
  }

  await ctx.close();
}

await browser.close();
console.log(`\nSaved screenshots to ${OUT}/`);
