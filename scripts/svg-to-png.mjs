import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "fs";

const svgPath = process.argv[2] || "/tmp/schema-thumb.svg";
const outPath = process.argv[3] || "/tmp/schema-thumb.png";

const svg = readFileSync(svgPath, "utf8");

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1536, height: 1024 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

const html = `<!doctype html><html><head><style>
*{margin:0;padding:0;}
body,html{background:#0a0a0a;}
svg{display:block;width:1536px;height:1024px;}
</style></head><body>${svg}</body></html>`;

await page.setContent(html, { waitUntil: "load" });
await page.waitForTimeout(500);
const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1536, height: 1024 }, type: "png" });
writeFileSync(outPath, buf);

console.log(`Saved ${outPath} (${buf.length} bytes)`);
await browser.close();
