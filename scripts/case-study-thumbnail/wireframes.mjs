/**
 * Wireframe panel presets — for engagements that cannot show a real screenshot
 * (stealth / NDA clients). Deliberately anonymous: placeholder bars where text
 * would be, no logo, no readable copy, no domain. The redaction IS the message.
 *
 * Every preset renders into a 1440x900 coordinate space and is scaled by the
 * panel's own width, so a preset looks identical at any panel size.
 */

const bar = (w, h, o = 1, r = 4, extra = '') =>
  `<div style="width:${w}px;height:${h}px;border-radius:${r}px;background:rgba(15,23,42,${o});${extra}"></div>`;

const accentBar = (w, h, o = 1, r = 4) =>
  `<div style="width:${w}px;height:${h}px;border-radius:${r}px;background:var(--wf-accent);opacity:${o}"></div>`;

/** Sidebar + toolbar + ledger rows + summary tiles. Reads as a B2B app. */
function app() {
  const rows = Array.from({ length: 7 }, (_, i) => {
    const fade = 1 - i * 0.06;
    return `<div style="display:flex;align-items:center;gap:22px;padding:15px 0;border-bottom:1px solid rgba(15,23,42,.07)">
      <div style="width:26px;height:26px;border-radius:7px;background:rgba(15,23,42,${0.08 * fade})"></div>
      ${bar(150, 9, 0.14 * fade)}
      ${bar(96, 9, 0.1 * fade)}
      ${bar(72, 9, 0.1 * fade)}
      <div style="flex:1"></div>
      ${accentBar(58, 9, 0.5 * fade)}
      <div style="width:9px;height:9px;border-radius:50%;background:var(--wf-accent);opacity:${0.6 * fade}"></div>
    </div>`;
  }).join('');

  const tiles = Array.from({ length: 3 }, (_, i) =>
    `<div style="flex:1;padding:18px 20px;border:1px solid rgba(15,23,42,.09);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      ${bar(64, 7, 0.12)}
      ${accentBar(96, 20, i === 0 ? 0.75 : 0.35, 5)}
    </div>`
  ).join('');

  return `<div style="display:flex;background:#fff">
    <div style="width:212px;padding:26px 20px;border-right:1px solid rgba(15,23,42,.08);display:flex;flex-direction:column;gap:26px">
      <div style="display:flex;align-items:center;gap:11px">
        <div style="width:26px;height:26px;border-radius:8px;background:var(--wf-accent);opacity:.85"></div>
        ${bar(84, 10, 0.16)}
      </div>
      <div style="display:flex;flex-direction:column;gap:17px">
        ${[0.5, 0.16, 0.16, 0.16, 0.16, 0.16].map((o, i) =>
          `<div style="display:flex;align-items:center;gap:12px">
            <div style="width:15px;height:15px;border-radius:4px;background:rgba(15,23,42,${o === 0.5 ? 0.2 : 0.1})"></div>
            ${bar(i === 0 ? 92 : 62 + ((i * 23) % 46), 9, o === 0.5 ? 0.24 : o)}
          </div>`
        ).join('')}
      </div>
    </div>
    <div style="flex:1;padding:26px 30px;display:flex;flex-direction:column;gap:24px">
      <div style="display:flex;align-items:center;gap:16px">
        ${bar(184, 15, 0.2, 5)}
        <div style="flex:1"></div>
        ${bar(76, 26, 0.06, 7)}
        <div style="width:100px;height:26px;border-radius:7px;background:var(--wf-accent);opacity:.85"></div>
      </div>
      <div style="display:flex;gap:14px">${tiles}</div>
      <div>${rows}</div>
    </div>
  </div>`;
}

/** A published page: headline bars, body lines, one metric block. */
function page() {
  const lines = [0.16, 0.15, 0.15, 0.13, 0.15, 0.12]
    .map((o, i) => bar(i === 5 ? 330 : 560 - (i % 3) * 34, 10, o))
    .join('');

  // A right-hand rail (contents + a callout) so the page fills the panel width —
  // a left-aligned column alone leaves a dead white half.
  const rail = `<div style="width:300px;flex:0 0 300px;display:flex;flex-direction:column;gap:26px;padding-top:6px">
    <div style="display:flex;flex-direction:column;gap:14px">
      ${bar(96, 8, 0.12)}
      ${[0, 1, 2, 3, 4].map((i) =>
        `<div style="display:flex;align-items:center;gap:10px;padding-left:${i === 0 ? 0 : 0}px">
          <div style="width:2px;height:14px;background:${i === 0 ? 'var(--wf-accent)' : 'rgba(15,23,42,.12)'}"></div>
          ${bar(150 - ((i * 27) % 62), 9, i === 0 ? 0.22 : 0.12)}
        </div>`
      ).join('')}
    </div>
    <div style="padding:22px 24px;border-radius:14px;background:rgba(15,23,42,.94);display:flex;flex-direction:column;gap:13px">
      <div style="width:170px;height:11px;border-radius:4px;background:rgba(255,255,255,.85)"></div>
      <div style="width:230px;height:8px;border-radius:4px;background:rgba(255,255,255,.35)"></div>
      <div style="width:196px;height:8px;border-radius:4px;background:rgba(255,255,255,.35)"></div>
      <div style="margin-top:6px;width:128px;height:30px;border-radius:15px;background:#fff"></div>
    </div>
  </div>`;

  return `<div style="background:#fff;padding:44px 54px;display:flex;gap:56px">
    <div style="flex:1;display:flex;flex-direction:column;gap:34px">
      <div style="display:flex;align-items:center;gap:12px">
        ${accentBar(74, 9, 0.6)}
        ${bar(120, 9, 0.1)}
      </div>
      <div style="display:flex;flex-direction:column;gap:15px">
        ${bar(660, 27, 0.26, 6)}
        ${bar(470, 27, 0.26, 6)}
      </div>
      <div style="display:flex;flex-direction:column;gap:13px">${lines}</div>
      <div style="display:flex;gap:16px;margin-top:6px">
        ${[0, 1].map((i) =>
          `<div style="flex:1;padding:22px 24px;border:1px solid rgba(15,23,42,.1);border-radius:12px;display:flex;flex-direction:column;gap:14px">
            ${bar(78, 8, 0.12)}
            ${accentBar(124, 24, i === 0 ? 0.8 : 0.4, 6)}
            ${bar(150, 8, 0.1)}
          </div>`
        ).join('')}
      </div>
    </div>
    ${rail}
  </div>`;
}

export const WIREFRAMES = { app, page };
