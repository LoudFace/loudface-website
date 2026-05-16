import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1456, height: 1024 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("https://www.loudface.co/blog/schema-markup-for-aeo-2026", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3000);

// Find the table that has "Field" "Schema type" header (the one Arnel captured)
const target = await page.locator(".blog-table-wrap").nth(0); // first table on page
await target.scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
const box = await target.boundingBox();
console.log("box:", JSON.stringify(box));

// Take full-screen screenshot to see what the user sees at the same viewport
await page.screenshot({ path: "/tmp/table-screenshot.png", clip: { x: box.x - 20, y: box.y - 20, width: box.width + 40, height: box.height + 40 } });
console.log("saved /tmp/table-screenshot.png");

// Also screenshot zoomed-in on the top-left corner where the gap should be
await page.screenshot({ path: "/tmp/table-corner-tl.png", clip: { x: box.x - 5, y: box.y - 5, width: 100, height: 60 } });
console.log("saved /tmp/table-corner-tl.png (top-left zoom)");

await page.screenshot({ path: "/tmp/table-corner-bl.png", clip: { x: box.x - 5, y: box.y + box.height - 55, width: 100, height: 60 } });
console.log("saved /tmp/table-corner-bl.png (bottom-left zoom)");

await browser.close();
