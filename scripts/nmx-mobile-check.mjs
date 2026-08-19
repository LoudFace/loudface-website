import { chromium, devices } from 'playwright';
const URL = 'http://localhost:3005/case-studies/trademomentum-niche-aeo-organic-growth';
const OUT = '/private/tmp/claude-504/-Users-arnel-Code-Projects-LoudFace-Agency-loudface-website/f49ba0dd-3979-4806-b8a8-bdcdc62b2692/scratchpad/chartlab/';

const lanes = [
  { name: 'iPhone14-390', device: devices['iPhone 14'], shot: 'live__iphone.png' },
  { name: 'SE-320', device: devices['iPhone SE'], shot: null },
  { name: 'Android-360', device: { ...devices['iPhone 14'], viewport: { width: 360, height: 780 } }, shot: null },
  { name: 'Tablet-768', device: { ...devices['iPhone 14'], viewport: { width: 768, height: 900 } }, shot: null },
];

const browser = await chromium.launch();
let fail = false;
for (const l of lanes) {
  const ctx = await browser.newContext({ ...l.device });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const m = await page.evaluate(() => {
    const nmx = document.querySelector('.nmx');
    const vw = window.innerWidth;
    const stacked = getComputedStyle(document.querySelector('.nmx .plot')).display === 'block';
    let rowsBad = 0;
    for (const b of nmx.querySelectorAll('.brow')) {
      const lab = b.querySelector('.bar-lab').getBoundingClientRect();
      const track = b.querySelector('.bar-track').getBoundingClientRect();
      const val = b.querySelector('.bar-val').getBoundingClientRect();
      const overflow = lab.right > vw + 1 || val.right > vw + 1 || track.right > vw + 1;
      const wrong = stacked ? track.top < Math.max(lab.bottom, val.bottom) - 2 : false;
      if (overflow || wrong) rowsBad++;
    }
    const labels = [...nmx.querySelectorAll('.dlab')].filter((e) => getComputedStyle(e).display !== 'none');
    const labelOverflow = labels.filter((e) => { const r = e.getBoundingClientRect(); return r.left < -1 || r.right > vw + 1; }).length;
    const nmxRect = nmx.getBoundingClientRect();
    return {
      vw, nmxW: Math.round(nmxRect.width), nmxOverflow: nmxRect.right > vw + 1,
      stacked, rows: nmx.querySelectorAll('.brow').length, rowsBad,
      visibleCurveLabels: labels.map((e) => e.textContent), labelOverflow,
      curveH: Math.round(nmx.querySelector('.curve-plot').getBoundingClientRect().height),
      statPx: Math.round(parseFloat(getComputedStyle(nmx.querySelector('.stat-n')).fontSize)),
    };
  });
  const expectStacked = l.device.viewport.width <= 640;
  const ok = !m.nmxOverflow && m.rowsBad === 0 && m.labelOverflow === 0 && m.stacked === expectStacked;
  if (!ok) fail = true;
  console.log(`${l.name}: ${ok ? 'PASS' : 'FAIL'}`, JSON.stringify(m));
  if (l.shot) {
    const el = await page.$('.nmx');
    await el.screenshot({ path: OUT + l.shot });
  }
  await ctx.close();
}
await browser.close();
console.log(fail ? 'RESULT: FAIL' : 'RESULT: PASS');
process.exit(fail ? 1 : 0);
