import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1456, height: 1024 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("https://www.loudface.co/blog/schema-markup-for-aeo-2026?cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(3000);

// Diagnose: get actual positions + computed styles
const diag = await page.evaluate(() => {
  const wrap = document.querySelector(".blog-table-wrap");
  const table = wrap?.querySelector("table");
  const thead = wrap?.querySelector("thead");
  const firstTh = wrap?.querySelector("thead th");
  const lastTd = wrap?.querySelectorAll("tbody td");
  const lastTdEl = lastTd?.[lastTd.length - 1];
  return {
    wrapBox: wrap?.getBoundingClientRect().toJSON(),
    tableBox: table?.getBoundingClientRect().toJSON(),
    theadBox: thead?.getBoundingClientRect().toJSON(),
    firstThBox: firstTh?.getBoundingClientRect().toJSON(),
    lastTdBox: lastTdEl?.getBoundingClientRect().toJSON(),
    wrapStyle: wrap ? {
      paddingTop: getComputedStyle(wrap).paddingTop,
      paddingBottom: getComputedStyle(wrap).paddingBottom,
      fontSize: getComputedStyle(wrap).fontSize,
      lineHeight: getComputedStyle(wrap).lineHeight,
      borderTop: getComputedStyle(wrap).borderTop,
    } : null,
    tableStyle: table ? {
      marginTop: getComputedStyle(table).marginTop,
      paddingTop: getComputedStyle(table).paddingTop,
      borderTop: getComputedStyle(table).borderTop,
      borderCollapse: getComputedStyle(table).borderCollapse,
      borderSpacing: getComputedStyle(table).borderSpacing,
      fontSize: getComputedStyle(table).fontSize,
    } : null,
    childNodes: wrap ? [...wrap.childNodes].map(n => ({
      type: n.nodeType,
      name: n.nodeName,
      text: n.nodeType === 3 ? JSON.stringify(n.textContent) : null,
    })) : null,
    tableChildNodes: table ? [...table.childNodes].map(n => ({
      type: n.nodeType,
      name: n.nodeName,
      text: n.nodeType === 3 ? JSON.stringify(n.textContent) : null,
    })) : null,
  };
});
console.log("DIAG:", JSON.stringify(diag, null, 2));

// Find the table that has "Field" "Schema type" header (the one Arnel captured)
const target = await page.locator(".blog-table-wrap").nth(0); // first table on page
await target.scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
const box = await target.boundingBox();
console.log("box:", JSON.stringify(box));

// Take full-screen screenshot to see what the user sees at the same viewport
await page.screenshot({ path: "/tmp/table-screenshot.png", clip: { x: box.x - 20, y: box.y - 20, width: box.width + 40, height: box.height + 40 } });
console.log("saved /tmp/table-screenshot.png");

// Zoomed corners CLIPPED to wrapper bounds only — no page-background bleed
await page.screenshot({ path: "/tmp/table-corner-tl.png", clip: { x: box.x, y: box.y, width: 200, height: 80 } });
console.log("saved /tmp/table-corner-tl.png (top-left, wrapper-only)");

await page.screenshot({ path: "/tmp/table-corner-bl.png", clip: { x: box.x, y: box.y + box.height - 80, width: 200, height: 80 } });
console.log("saved /tmp/table-corner-bl.png (bottom-left, wrapper-only)");

await browser.close();
