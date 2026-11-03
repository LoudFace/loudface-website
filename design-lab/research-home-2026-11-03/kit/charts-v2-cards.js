/* CARD COPY for the homepage research section, round 2 (A2, A3; 3 Nov 2026). Same kit as charts-v2.js (this folder)
   plus a card mode, switched on with data-card="on" and data-h="<svg height>":
     - every form fills the same svg height, so six different charts sit in one frame at one height (Graphite's grid);
     - no callout chips; the funnel lights only its last step; state-seo and state-ai are drawn as columns of the same
       numbers (a 3-row bar list and a 2-part bar leave half the frame empty at card size);
     - the sov matrix gets a label column and cells sized to the frame;
     - data-accent="<hex>" and data-rest="<hex>" relight the night stage: one series accent, the rest grey-lavender;
     - the legend moves under the chart (out.legend for every form in card mode).
   LOCAL COPY for the homepage research section boards: adds the 'cite-wait' chart and scores cyber out of 36.
   LoudFace research charts, v2 (3 Nov 2026). Charts only; pages place them.

   Usage: <div data-chart2="<id>" data-ground="light|stage|colour" data-tone="…" data-size="sm|md|lg"></div>
   and load research.js, then this file. Drawn on window load, after fonts; redrawn when the width changes.

   ids: every STUDIES id (agree, seo-time, state-seo, state-content, state-ai, sov, hr, devtools, cyber, fintech, gap,
        bench) plus the benchmark's own tables: bench-domains, bench-engines, bench-rates.
   ground + tone:
     light   tone white (default) | warm (#f6f6f6)                  indigo marks, square columns, hatched losses
     stage   tone indigo (#3d38cf, default) | night (#0b0a2e) | navy (#030c5a)   white and lavender marks, faded bars
     colour  tone coral (default) | butter | green | indigo          ink marks on a saturated series colour
   options:
     data-head="on|off"     the big figure above the chart (on at lg, off below)
     data-caption="…|off"   replaces the source line, or removes it
     data-paint="on|off"    the kit paints its ground with padding (on for stage and colour, and for light+warm)
   JS: Charts2.draw(el), Charts2.drawAll().

   Every number comes from STUDIES and BENCH in research.js. The only arithmetic done here: the fintech swing
   (highest engine over lowest, per vendor) and shares of a funnel's first step. */
(function () {
  const SRC = document.currentScript ? document.currentScript.src : location.href;
  const LOGO = new URL('../../../public/lf-logo.svg', SRC).href;
  const NM = '"Neue Montreal", "Helvetica Neue", Arial, sans-serif';
  const SANS = 'Satoshi, "Helvetica Neue", Arial, sans-serif';
  let UID = 0;

  /* ------------------------------------------------------------ grounds */
  const INK = '#1a1040';
  const BASE_LIGHT = {
    paint: false, bg: '#ffffff', ink: INK, body: '#4a4466', muted: '#6b6788', axis: '#8a87a3', grid: '#eeedf4', base: '#dcdbe6',
    hi: '#4f39f6', rest: '#dcdbe6', rest2: '#c9bdf5', line2: '#c3c0d8', hatch: 'rgba(79,70,229,0.30)', hatchEdge: 'rgba(79,70,229,0.22)',
    callBg: '#4f39f6', callInk: '#ffffff', onHi: '#ffffff', water: 'rgba(26,16,64,0.24)', fade: null, band: 'rgba(79,57,246,0.05)',
    eng: ['#4f39f6', '#e8704c', '#a99cf0'], cellHi: '#4f39f6', cellHiInk: '#ffffff', cellA: '#eeecfe', cellB: '#fde6dc', cellInk: INK,
  };
  function theme(ground, tone) {
    if (ground === 'stage') {
      const bg = { night: '#0b0a2e', navy: '#030c5a' }[tone] || '#3d38cf';
      const deep = bg !== '#3d38cf';
      return { ...BASE_LIGHT, paint: true, bg, ink: '#ffffff', body: deep ? '#d6d2f5' : '#e4e1ff', muted: deep ? '#a8a2d6' : '#c9c5fb', axis: deep ? '#8f89c4' : 'rgba(255,255,255,0.62)',
        grid: deep ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)', base: deep ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
        hi: deep ? '#c9bdf5' : '#ffffff', rest: deep ? '#6a5fe0' : '#b7aaf2', rest2: deep ? '#5b50c9' : '#8b80ec', line2: deep ? 'rgba(201,189,245,0.45)' : 'rgba(255,255,255,0.38)',
        hatch: deep ? 'rgba(201,189,245,0.30)' : 'rgba(255,255,255,0.30)', hatchEdge: deep ? 'rgba(201,189,245,0.22)' : 'rgba(255,255,255,0.26)',
        callBg: deep ? '#c9bdf5' : '#ffffff', callInk: deep ? bg : '#3d38cf', onHi: bg, water: deep ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.26)',
        fade: { hi: [0.14, 1], rest: [0.06, 0.78] }, band: 'rgba(255,255,255,0.06)',
        eng: ['#ffffff', '#fcd68a', '#f59a7b'], cellHi: deep ? '#c9bdf5' : '#ffffff', cellHiInk: deep ? bg : '#3d38cf', cellA: 'rgba(255,255,255,0.14)', cellB: 'outline', cellInk: '#ffffff' };
    }
    if (ground === 'colour') {
      if (tone === 'indigo') return { ...theme('stage', 'indigo'), bg: '#4f46e5', onHi: '#4f46e5', callInk: '#4f46e5', cellHiInk: '#4f46e5' };
      const bg = { butter: '#fcd68a', green: '#43c98d' }[tone] || '#f59a7b';
      const ink = 'rgba(26,16,64,';
      return { ...BASE_LIGHT, paint: true, bg, ink: INK, body: `${ink}0.84)`, muted: `${ink}0.70)`, axis: `${ink}0.62)`, grid: `${ink}0.11)`, base: `${ink}0.34)`,
        hi: INK, rest: 'rgba(255,255,255,0.78)', rest2: '#ffffff', line2: `${ink}0.30)`, hatch: `${ink}0.26)`, hatchEdge: `${ink}0.20)`,
        callBg: INK, callInk: '#ffffff', onHi: '#ffffff', water: `${ink}0.22)`, fade: null, band: 'rgba(255,255,255,0.22)',
        eng: tone === 'butter' ? [INK, '#4f39f6', '#e8704c'] : [INK, '#ffffff', '#4f39f6'],
        cellHi: INK, cellHiInk: '#ffffff', cellA: 'rgba(255,255,255,0.55)', cellB: `${ink}0.09)`, cellInk: INK };
    }
    if (tone === 'warm') return { ...BASE_LIGHT, paint: true, bg: '#f6f6f6', grid: '#e8e7ef', rest: '#d9d7e4', cellA: '#ebe8fd' };
    return BASE_LIGHT;
  }

  /* ------------------------------------------------------------ sizes */
  const SZ = {
    sm: { fs: 12, ax: 11, val: 14, fig: 20, row: 30, bar: 19, call: 11.5, callH: 22, head: 40, pad: 18 },
    md: { fs: 13.5, ax: 13, val: 17, fig: 26, row: 40, bar: 27, call: 13, callH: 26, head: 52, pad: 26 },
    lg: { fs: 14.5, ax: 13, val: 19, fig: 30, row: 48, bar: 33, call: 13, callH: 28, head: 72, pad: 36 },
  };

  /* ------------------------------------------------------------ text */
  const cv = document.createElement('canvas').getContext('2d');
  const tw = (s, fs, wt = 400, fam = SANS) => { cv.font = `${wt} ${fs}px ${fam}`; return cv.measureText(String(s)).width; };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const r1 = (n) => Math.round(n * 10) / 10;
  function T(x, y, s, o) {
    const a = o.a ? ` text-anchor="${o.a}"` : '';
    const fam = o.fig ? ` font-family='${NM}' letter-spacing="${o.ls ?? '-0.02em'}"` : o.ls ? ` letter-spacing="${o.ls}"` : '';
    return `<text x="${r1(x)}" y="${r1(y)}"${a} font-size="${o.fs}" font-weight="${o.w || 400}" fill="${o.c}"${fam}${o.extra || ''}>${o.raw ? s : esc(s)}</text>`;
  }
  function wrap(s, maxW, fs, wt) {
    const words = String(s).split(' '), out = [];
    let cur = '';
    for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (cur && tw(t, fs, wt) > maxW) { out.push(cur); cur = w; } else cur = t; }
    if (cur) out.push(cur);
    return out;
  }
  const nf = (v) => Number(v).toLocaleString('en-US');
  const pct = (v) => `${Number(v).toFixed(1)}%`;

  /* ------------------------------------------------------------ the drawing context for one chart */
  function ctx(th, size, w) {
    const id = `c2-${++UID}`, defs = [], seen = {};
    const c = { th, s: SZ[size], size, w, id, defs };
    // a bar fill: solid on light; on stage and colour a fade from the value end to the base (Graphite's finish)
    c.fill = (col, kind, dir) => {
      const f = th.fade && th.fade[kind];
      if (!f) return col;
      const k = `${col}|${kind}|${dir}`;
      if (!seen[k]) {
        seen[k] = `${id}-g${Object.keys(seen).length}`;
        const [x1, y1, x2, y2] = dir === 'h' ? [0, 0, 1, 0] : [0, 1, 0, 0];
        defs.push(`<linearGradient id="${seen[k]}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${col}" stop-opacity="${f[0]}"/><stop offset="1" stop-color="${col}" stop-opacity="${f[1]}"/></linearGradient>`);
      }
      return `url(#${seen[k]})`;
    };
    c.solid = (col) => col;
    c.hatch = () => {
      if (!seen.hatch) {
        seen.hatch = `${id}-h`;
        defs.push(`<pattern id="${seen.hatch}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="${th.hatch}" stroke-width="2"/></pattern>`);
      }
      return `url(#${seen.hatch})`;
    };
    // the annotation callout: a filled label (the homepage's end label) with a leader to the point
    c.callout = (x, y, text, o = {}) => {
      const s = c.s, fw = tw(text, s.call, 500) + 18, h = s.callH;
      let x0 = o.anchor === 'start' ? x : o.anchor === 'end' ? x - fw : x - fw / 2;
      x0 = Math.max(o.min ?? 0, Math.min(x0, (o.max ?? w) - fw));
      const lead = o.to != null ? `<line x1="${r1(o.lx ?? x)}" x2="${r1(o.lx ?? x)}" y1="${r1(y + h)}" y2="${r1(o.to)}" stroke="${th.callBg}" stroke-width="1.5"/>` : '';
      return `${lead}<rect x="${r1(x0)}" y="${r1(y)}" width="${r1(fw)}" height="${h}" rx="6" fill="${th.callBg}"/>` +
        T(x0 + 9, y + h / 2 + s.call * 0.36, text, { fs: s.call, w: 500, c: th.callInk });
    };
    // the LoudFace mark: the logo in a disc, as the homepage pins it
    c.pin = (x, y, r) => {
      const cid = `${id}-p${UID++}`;
      return `<defs><clipPath id="${cid}"><circle cx="${r1(x)}" cy="${r1(y)}" r="${r}"/></clipPath></defs><circle cx="${r1(x)}" cy="${r1(y)}" r="${r + 1.5}" fill="#ffffff"/>` +
        `<image href="${LOGO}" x="${r1(x - r)}" y="${r1(y - r)}" width="${r * 2}" height="${r * 2}" clip-path="url(#${cid})"/>`;
    };
    return c;
  }

  /* ------------------------------------------------------------ chart forms */

  // Ranked horizontal bars: label, square bar, the figure at its end. One highlighted mark, one callout.
  function hbars(c, o) {
    const { th, s, w } = c, n = o.rows.length;
    const labW = Math.min(w * 0.42, Math.max(...o.rows.map((r) => tw(r.label, s.fs, r.hi ? 500 : 400))) + 16);
    const valW = Math.max(...o.rows.map((r) => tw(r.text, s.val, 500, NM))) + 12;
    const x0 = labW, x1 = w - valW - (c.wm || 0), bw = x1 - x0;
    const top = 6, bottom = top + n * s.row, H = bottom + 26;
    let g = '';
    for (const t of o.ticks) {
      const x = x0 + (t / o.max) * bw;
      g += `<line x1="${r1(x)}" x2="${r1(x)}" y1="${top}" y2="${bottom}" stroke="${t === 0 ? th.base : th.grid}"/>`;
      g += T(x, bottom + 19, o.tick ? o.tick(t) : t, { fs: s.ax, c: th.axis, a: t === 0 ? 'start' : 'middle' });
    }
    o.rows.forEach((r, i) => {
      const yc = top + i * s.row + s.row / 2, bl = Math.max(2, (r.v / o.max) * bw);
      g += `<rect x="${r1(x0)}" y="${r1(yc - s.bar / 2)}" width="${r1(bl)}" height="${s.bar}" fill="${c.fill(r.hi ? th.hi : th.rest, r.hi ? 'hi' : 'rest', 'h')}"/>`;
      g += T(0, yc + s.fs * 0.35, r.label, { fs: s.fs, w: r.hi ? 500 : 400, c: r.hi ? th.ink : th.body });
      g += T(x0 + bl + 8, yc + s.val * 0.34, r.text, { fs: s.val, w: 500, c: r.hi ? th.hi : th.ink, fig: true });
      if (r.hi && o.call && c.size !== 'sm') {
        const vx = x0 + bl + 8 + tw(r.text, s.val, 500, NM) + 12, fw = tw(o.call, s.call, 500) + 18;
        if (vx + fw <= w - (c.wm || 0)) g += c.callout(vx, yc - s.callH / 2, o.call, { anchor: 'start' });
      }
    });
    return { h: H, svg: g };
  }

  // Columns on a y axis: the figure on each column, the chosen column called out.
  function columns(c, o) {
    const { th, s, w } = c, n = o.rows.length;
    const axW = Math.max(...o.ticks.map((t) => tw(o.tick ? o.tick(t) : t, s.ax))) + 12;
    const x0 = axW, x1 = w - (c.wm || 0), band = (x1 - x0) / n, cw = Math.min(band * 0.7, c.size === 'lg' ? 124 : 96);
    const lines = o.rows.map((r) => wrap(r.label, band - 6, s.ax, 400));
    const nl = Math.max(...lines.map((l) => l.length)), lh = s.ax + 4;
    if (c.card) o = { ...o, call: null };
    const top0 = (o.call ? s.callH + 16 : 0) + s.val + 10;
    const plotH = c.fixH ? c.fixH - top0 - 14 - nl * lh : { sm: 150, md: 230, lg: 300 }[c.size];
    const top = top0, bottom = top + plotH, H = bottom + 14 + nl * lh;
    const y = (v) => bottom - (v / o.max) * plotH;
    let g = '';
    for (const t of o.ticks) {
      g += `<line x1="${x0}" x2="${x1}" y1="${r1(y(t))}" y2="${r1(y(t))}" stroke="${t === 0 ? th.base : th.grid}"/>`;
      g += T(0, y(t) + s.ax * 0.35, o.tick ? o.tick(t) : t, { fs: s.ax, c: th.axis });
    }
    o.rows.forEach((r, i) => {
      const cx = x0 + band * i + band / 2, yt = y(r.v);
      g += `<rect x="${r1(cx - cw / 2)}" y="${r1(yt)}" width="${r1(cw)}" height="${r1(bottom - yt)}" fill="${c.fill(r.hi ? th.hi : th.rest, r.hi ? 'hi' : 'rest', 'v')}"/>`;
      g += T(cx, yt - 8, r.text, { fs: s.val, w: 500, c: r.hi ? th.hi : c.card ? th.body : th.ink, fig: true, a: 'middle' });
      lines[i].forEach((l, k) => { g += T(cx, bottom + 18 + k * lh, l, { fs: s.ax, c: r.hi ? th.ink : th.muted, w: r.hi ? 500 : 400, a: 'middle' }); });
      if (r.hi && o.call) g += c.callout(cx, 2, o.call, { lx: cx, to: yt - s.val - 12, min: x0, max: x1 });
    });
    return { h: H, svg: g };
  }

  // A funnel of counts, the methodology page's form: each step's kept share solid, what was lost hatched.
  function funnel(c, o) {
    const { th, s, w } = c, n = o.rows.length, first = o.rows[0][1];
    const gap = { sm: 10, md: 16, lg: 20 }[c.size], x1 = w - (c.wm || 0), cw = (x1 - gap * (n - 1)) / n;
    const lfs = c.card ? s.ax : s.fs;
    const lines = o.rows.map((r) => wrap(r[0], cw, lfs, 500)), nl = Math.max(...lines.map((l) => l.length)), lh = lfs + 5;
    const plotH = c.fixH ? c.fixH - (s.fig + 14) - 16 - nl * lh : { sm: 150, md: 220, lg: 280 }[c.size];
    const top = s.fig + 14, bottom = top + plotH, H = bottom + 16 + nl * lh;
    let g = '';
    o.rows.forEach((r, i) => {
      const x = i * (cw + gap), kept = (r[1] / first) * plotH, yt = bottom - kept, last = i === n - 1;
      const rx = c.size === 'sm' ? 4 : 6;
      g += `<rect x="${r1(x + 0.5)}" y="${top + 0.5}" width="${r1(cw - 1)}" height="${plotH - 1}" rx="${c.card ? 0 : rx}" fill="${c.hatch()}" stroke="${th.hatchEdge}"/>`;
      g += `<rect x="${r1(x)}" y="${r1(yt)}" width="${r1(cw)}" height="${r1(kept)}" rx="${c.card ? 0 : rx}" fill="${c.card ? c.fill(last ? th.hi : th.rest, last ? 'hi' : 'rest', 'v') : th.hi}"/>`;
      if (c.card && th.fade) g = g.replace(/(<rect[^>]*>)$/, `<rect x="${r1(x)}" y="${r1(yt)}" width="${r1(cw)}" height="${r1(kept)}" fill="${th.bg}"/>$1`);
      const big = i === 0 ? nf(r[1]) : c.size === 'sm' ? `${nf(r[1])}<tspan font-size="${r1(s.fig * 0.62)}" fill="${th.muted}" letter-spacing="-0.01em"> of ${nf(first)}</tspan>` : `${nf(r[1])} of ${nf(first)}`;
      g += T(x, top - 12, big, { fs: s.fig, w: 500, c: last ? th.hi : c.card ? th.body : th.ink, fig: true, raw: true, ls: '-0.03em' });
      const lost = first - r[1];
      if (lost > 0 && c.size !== 'sm' && plotH - kept > 40) {
        const t = `${nf(lost)} lost`, tw0 = tw(t, s.ax, 500) + 14;
        g += `<rect x="${r1(x + cw / 2 - tw0 / 2)}" y="${r1(top + (plotH - kept) / 2 - 11)}" width="${r1(tw0)}" height="22" fill="${th.bg}"/>`;
        g += T(x + cw / 2, top + (plotH - kept) / 2 + s.ax * 0.36, t, { fs: s.ax, w: 500, c: th.muted, a: 'middle' });
      }
      if (c.size !== 'sm' && i > 0) g += T(x + 10, yt + s.ax + 8, `${((r[1] / first) * 100).toFixed(1)}%`, { fs: s.ax, w: 500, c: th.onHi });
      lines[i].forEach((l, k) => { g += T(x, bottom + 18 + k * lh, l, { fs: lfs, w: c.card && !last ? 400 : 500, c: c.card && !last ? th.muted : th.ink }); });
    });
    return { h: H, svg: g };
  }

  // A 100% bar: the highlighted share solid, the next one plain, the remainder hatched; a key below.
  function stack(c, o) {
    const { th, s, w } = c, x1 = w - (c.wm || 0), bh = { sm: 30, md: 44, lg: 56 }[c.size];
    const top = 4;
    let g = '', x = 0;
    o.segs.forEach((sg) => {
      const sw = (sg.v / 100) * x1;
      const fill = sg.style === 'hi' ? th.hi : sg.style === 'rest' ? th.rest : c.hatch();
      if (sg.style === 'hatch') g += `<rect x="${r1(x + 0.5)}" y="${top + 0.5}" width="${r1(sw - 1)}" height="${bh - 1}" fill="${fill}" stroke="${th.hatchEdge}"/>`;
      else g += `<rect x="${r1(x)}" y="${top}" width="${r1(sw)}" height="${bh}" fill="${fill}"/>`;
      const tt = pct(sg.v), need = tw(tt, s.val, 500, NM) + 16;
      if (sw > need) {
        // A hatched (remainder) segment carries its label at its far end, so it never reads as the
        // narrow highlighted segment's value beside it.
        if (sg.style === 'hatch') {
          g += `<rect x="${r1(x + sw - need + 2)}" y="${r1(top + bh / 2 - s.val * 0.62)}" width="${r1(need - 4)}" height="${r1(s.val * 1.24)}" fill="${th.bg}"/>`;
          g += T(x + sw - 10, top + bh / 2 + s.val * 0.34, tt, { fs: s.val, w: 500, c: th.ink, fig: true, a: 'end' });
        } else g += T(x + 10, top + bh / 2 + s.val * 0.34, tt, { fs: s.val, w: 500, c: sg.style === 'hi' ? th.onHi : th.ink, fig: true });
      }
      x += sw;
    });
    // quarter ticks under the bar
    let y = top + bh;
    [0, 25, 50, 75, 100].forEach((t) => {
      const tx = (t / 100) * x1;
      g += `<line x1="${r1(tx)}" x2="${r1(tx)}" y1="${y}" y2="${y + 6}" stroke="${th.base}"/>`;
      g += T(tx, y + 20, `${t}%`, { fs: s.ax, c: th.axis, a: t === 0 ? 'start' : t === 100 ? 'end' : 'middle' });
    });
    y += 40;
    // the key: swatch, label, count, share
    const kh = s.row;
    o.segs.forEach((sg, i) => {
      const yc = y + i * kh + kh / 2, sq = 12;
      g += `<line x1="0" x2="${x1}" y1="${r1(y + i * kh)}" y2="${r1(y + i * kh)}" stroke="${th.grid}"/>`;
      const fill = sg.style === 'hi' ? th.hi : sg.style === 'rest' ? th.rest : c.hatch();
      g += `<rect x="0" y="${r1(yc - sq / 2)}" width="${sq}" height="${sq}" fill="${fill}"${sg.style === 'hatch' ? ` stroke="${th.hatchEdge}"` : ''}/>`;
      g += T(sq + 10, yc + s.fs * 0.35, sg.label, { fs: s.fs, w: sg.style === 'hi' ? 500 : 400, c: sg.style === 'hi' ? th.ink : th.body });
      if (sg.count && c.size !== 'sm') g += T(x1 - 80, yc + s.fs * 0.35, sg.count, { fs: s.fs, c: th.muted, a: 'end' });
      g += T(x1, yc + s.val * 0.34, pct(sg.v), { fs: s.val, w: 500, c: sg.style === 'hi' ? th.hi : th.ink, fig: true, a: 'end' });
    });
    g += `<line x1="0" x2="${x1}" y1="${r1(y + o.segs.length * kh)}" y2="${r1(y + o.segs.length * kh)}" stroke="${th.grid}"/>`;
    return { h: y + o.segs.length * kh + 2, svg: g };
  }

  // Slope: two readings per row, the owned row drawn heavy, labels kept apart.
  function slope(c, o) {
    const { th, s, w } = c;
    const H = { sm: 320, md: 380, lg: 460 }[c.size], top = s.ax + 22, bot = H - 14;
    const y = (v) => bot - (v / o.max) * (bot - top);
    const fmt = o.fmt;
    const nameW = Math.max(...o.rows.map((r) => tw(r.label, s.fs, 500)));
    const lvW = Math.max(...o.rows.map((r) => tw(fmt(r.a), s.val, 500, NM)));
    const rvW = Math.max(...o.rows.map((r) => tw(fmt(r.b), s.val, 500, NM)));
    const x0 = nameW + lvW + 30, x1 = w - rvW - 16 - (c.wm || 0);
    const relax = (arr, gap) => {
      const hiB = bot + 4;
      const a = arr.slice().sort((p, q) => p.y - q.y);
      for (let k = 0; k < 40; k++) for (let i = 1; i < a.length; i++) if (a[i].ly - a[i - 1].ly < gap) { const d = (gap - (a[i].ly - a[i - 1].ly)) / 2; a[i].ly += d; a[i - 1].ly -= d; }
      const over = a[a.length - 1].ly - (hiB ?? Infinity);
      if (over > 0) a.forEach((p) => { p.ly -= over; });
      for (let i = a.length - 2; i >= 0; i--) if (a[i + 1].ly - a[i].ly < gap) a[i].ly = a[i + 1].ly - gap;
      return a;
    };
    const L = relax(o.rows.map((r) => ({ r, y: y(r.a), ly: y(r.a) })), s.fs + 5);
    const R = relax(o.rows.map((r) => ({ r, y: y(r.b), ly: y(r.b) })), s.fs + 5);
    let g = '';
    for (const t of o.ticks) g += `<line x1="${r1(x0)}" x2="${r1(x1)}" y1="${r1(y(t))}" y2="${r1(y(t))}" stroke="${t === 0 ? th.base : th.grid}"/>`;
    g += `<line x1="${r1(x0)}" x2="${r1(x0)}" y1="${top - 8}" y2="${bot}" stroke="${th.base}"/><line x1="${r1(x1)}" x2="${r1(x1)}" y1="${top - 8}" y2="${bot}" stroke="${th.base}"/>`;
    g += T(x0, s.ax, o.aTitle, { fs: s.ax, w: 500, c: th.muted, a: 'middle' }) + T(x1, s.ax, o.bTitle, { fs: s.ax, w: 500, c: th.muted, a: 'middle' });
    const rows = o.rows.slice().sort((p, q) => (p.hi ? 1 : 0) - (q.hi ? 1 : 0));
    for (const r of rows) {
      const col = r.hi ? th.hi : th.line2, sw = r.hi ? 3 : 1.5, rad = r.hi ? 5.5 : 3.5;
      g += `<line x1="${r1(x0)}" y1="${r1(y(r.a))}" x2="${r1(x1)}" y2="${r1(y(r.b))}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`;
      g += `<circle cx="${r1(x0)}" cy="${r1(y(r.a))}" r="${rad}" fill="${r.hi ? th.bg : th.bg}" stroke="${col}" stroke-width="${r.hi ? 2.5 : 1.5}"/>`;
      g += `<circle cx="${r1(x1)}" cy="${r1(y(r.b))}" r="${rad}" fill="${col}" stroke="${r.hi ? col : th.bg}" stroke-width="${r.hi ? 2.5 : 1.5}"/>`;
    }
    for (const p of L) {
      const hi = p.r.hi;
      if (Math.abs(p.ly - p.y) > 3) g += `<line x1="${r1(x0 - 5)}" y1="${r1(p.y)}" x2="${r1(x0 - 11)}" y2="${r1(p.ly)}" stroke="${th.line2}"/>`;
      g += T(x0 - 14, p.ly + s.val * 0.34, fmt(p.r.a), { fs: s.val, w: 500, c: hi ? th.hi : th.ink, fig: true, a: 'end' });
      g += T(x0 - 22 - lvW, p.ly + s.fs * 0.35, p.r.label, { fs: s.fs, w: hi ? 500 : 400, c: hi ? th.hi : th.body, a: 'end' });
    }
    for (const p of R) if (Math.abs(p.ly - p.y) > 3) g += `<line x1="${r1(x1 + 5)}" y1="${r1(p.y)}" x2="${r1(x1 + 11)}" y2="${r1(p.ly)}" stroke="${th.line2}"/>`;
    for (const p of R) g += T(x1 + 14, p.ly + s.val * 0.34, fmt(p.r.b), { fs: s.val, w: 500, c: p.r.hi ? th.hi : th.muted, fig: true });
    return { h: H, svg: g };
  }

  // Dot and range per vendor: one dot per engine on a shared axis, the swing written at the right.
  function dots(c, o) {
    const { th, s, w } = c, n = o.rows.length;
    const labW = Math.max(...o.rows.map((r) => tw(r.label, s.fs, 500))) + 16;
    const swW = Math.max(tw('Swing', s.ax, 500), tw('4.6×', s.val, 500, NM)) + 14;
    const x0 = labW, x1 = w - swW - (c.wm || 0) - 8, bw = x1 - x0, x = (v) => x0 + (v / o.max) * bw;
    const top = s.ax + 16, rh = s.row + (c.size === 'sm' ? 2 : 6), bottom = top + n * rh, H = bottom + 30;
    const ticks = c.size === 'sm' ? [0, 35, 70] : [0, 10, 20, 30, 40, 50, 60, 70];
    let g = '';
    for (const t of ticks) {
      g += `<line x1="${r1(x(t))}" x2="${r1(x(t))}" y1="${top - 4}" y2="${bottom}" stroke="${t === 0 ? th.base : th.grid}"/>`;
      g += T(x(t), bottom + 19, `${t}%`, { fs: s.ax, c: th.axis, a: t === 0 ? 'start' : 'middle' });
    }
    g += T(w - (c.wm || 0), s.ax, 'Swing', { fs: s.ax, w: 500, c: th.muted, a: 'end' });
    const dr = { sm: 5, md: 6, lg: 7 }[c.size];
    o.rows.forEach((r, i) => {
      const yc = top + i * rh + rh / 2, xs = r.vals.map(x), lo = Math.min(...xs), hi = Math.max(...xs);
      const swing = Math.max(...r.vals) / Math.min(...r.vals);
      if (r.hi) g += `<rect x="0" y="${r1(top + i * rh + 1)}" width="${r1(w - (c.wm || 0))}" height="${rh - 2}" fill="${th.band}"/>`;
      g += `<line x1="${r1(lo)}" x2="${r1(hi)}" y1="${r1(yc)}" y2="${r1(yc)}" stroke="${r.hi ? th.hi : th.line2}" stroke-width="${r.hi ? 3 : 2}"/>`;
      xs.forEach((cx, k) => { g += `<circle cx="${r1(cx)}" cy="${r1(yc)}" r="${dr}" fill="${th.eng[k]}" stroke="${th.bg}" stroke-width="2"/>`; });
      g += T(8, yc + s.fs * 0.35, r.label, { fs: s.fs, w: r.hi ? 500 : 400, c: r.hi ? th.ink : th.body });
      g += T(w - (c.wm || 0) - 8, yc + s.val * 0.34, `${swing.toFixed(1)}×`, { fs: s.val, w: 500, c: r.hi ? th.hi : th.ink, fig: true, a: 'end' });
    });
    return { h: H, svg: g, legend: o.cols.map((nme, k) => ({ label: nme, color: th.eng[k], dot: true })) };
  }

  // Small multiples: one panel of bars per engine, the categories shared down the left.
  function multiples(c, o) {
    const { th, s, w } = c, n = o.keys.length, m = o.panels.length;
    const labW = Math.max(...o.keys.map((k) => tw(k, s.fs, 500))) + 14;
    const gap = { sm: 8, md: 18, lg: 24 }[c.size], pw = (w - labW - (c.wm || 0) - gap * (m - 1)) / m;
    const valW = tw('53.4', s.fs, 500, NM) + 8, bw = pw - valW - 4;
    const head = c.size === 'sm' ? s.ax + 10 : s.fs + s.ax + 18, rh = c.size === 'sm' ? 24 : s.row - 4;
    const top = head + 6, bottom = top + n * rh, H = bottom + 4;
    let g = '';
    o.keys.forEach((k, i) => {
      const yc = top + i * rh + rh / 2;
      g += T(0, yc + s.fs * 0.35, k, { fs: s.fs, w: i === o.hi ? 500 : 400, c: i === o.hi ? th.ink : th.body });
    });
    o.panels.forEach((p, j) => {
      const px = labW + j * (pw + gap);
      if (c.size === 'sm') g += T(px, s.ax, p.name.replace('AI Overviews', 'AIO'), { fs: s.ax, w: 500, c: th.ink });
      else { g += T(px, s.fs, p.name, { fs: s.fs, w: 500, c: th.ink }); g += T(px, s.fs + s.ax + 6, `${nf(p.n)} citations`, { fs: s.ax, c: th.muted }); }
      g += `<line x1="${r1(px)}" x2="${r1(px)}" y1="${top - 2}" y2="${bottom}" stroke="${th.base}"/>`;
      p.vals.forEach((v, i) => {
        const yc = top + i * rh + rh / 2, bl = (v / o.max) * bw, hi = i === o.hi, bh = Math.min(s.bar, rh - 8);
        g += `<rect x="${r1(px)}" y="${r1(yc - bh / 2)}" width="${r1(bl)}" height="${r1(bh)}" fill="${c.fill(hi ? th.hi : th.rest, hi ? 'hi' : 'rest', 'h')}"/>`;
        g += T(px + bl + 6, yc + s.fs * 0.36, v.toFixed(1), { fs: s.fs, w: 500, c: hi ? th.hi : th.ink, fig: true });
      });
    });
    return { h: H, svg: g };
  }

  // Leaders matrix: who comes first under each formula on each engine; LoudFace's cells solid with the mark.
  function matrix(c, o) {
    if (c.card) return matrixCard(c, o);
    const { th, s, w } = c, m = o.cols.length, sm = c.size === 'sm';
    const labW = sm ? 0 : Math.max(...o.rows.map((r) => tw(r[0], s.fs, 500))) + 18;
    const gap = 3, cw = (w - labW - (c.wm || 0) - gap * (m - 1)) / m, ch = { sm: 46, md: 62, lg: 72 }[c.size];
    const rowLab = sm ? s.ax + 10 : 0;
    const top = s.ax + 12;
    let g = '', y = top;
    o.cols.forEach((h, i) => { g += T(labW + i * (cw + gap) + (sm ? 0 : 12), s.ax, sm ? h.replace('AI Overviews', 'AIO') : h, { fs: s.ax, w: 500, c: th.muted }); });
    o.rows.forEach((r) => {
      if (sm) { g += T(0, y + s.ax + 2, r[0], { fs: s.ax, w: 500, c: th.body }); y += rowLab; }
      else g += T(0, y + ch / 2 + s.fs * 0.35, r[0], { fs: s.fs, w: 500, c: th.ink });
      r[1].forEach((v, i) => {
        const parts = v.split(' '), num = parts.pop(), name = parts.join(' '), lf = name === 'LoudFace', om = name === 'Omniscient';
        const x = labW + i * (cw + gap), bg = lf ? th.cellHi : om ? th.cellA : th.cellB, ink = lf ? th.cellHiInk : th.cellInk;
        g += bg === 'outline' ? `<rect x="${r1(x + 0.75)}" y="${r1(y + 0.75)}" width="${r1(cw - 1.5)}" height="${ch - 1.5}" fill="none" stroke="${th.line2}" stroke-width="1.5"/>` : `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(cw)}" height="${ch}" fill="${bg}"/>`;
        const pad = sm ? 8 : 12, pr = sm ? 0 : 8;
        let nx = x + pad;
        if (lf && !sm) { g += c.pin(nx + pr, y + pad + pr, pr); nx += pr * 2 + 7; }
        g += T(nx, y + pad + (sm ? s.ax : s.fs) * 0.82 + (sm ? 0 : 1), name, { fs: sm ? s.ax : s.fs, w: 500, c: ink });
        g += T(x + pad, y + ch - pad, num.endsWith('%') ? num : num, { fs: sm ? s.val - 1 : s.val + 1, w: 500, c: ink, fig: true });
      });
      y += ch + gap;
    });
    const legend = [{ label: 'LoudFace leads', color: th.cellHi }, { label: 'Omniscient leads', color: th.cellA }, { label: 'Another agency leads', color: th.cellB === 'outline' ? 'transparent' : th.cellB, outline: th.cellB === 'outline' ? th.line2 : null }];
    return { h: y, svg: g, legend };
  }

  // The matrix in a card: a label column, three engine columns, cells sized to the frame, name over number.
  function matrixCard(c, o) {
    const { th, s, w } = c, m = o.cols.length, n = o.rows.length;
    const labs = w < 330 ? { 'Mention share': 'Mentions', 'Citation share': 'Citations', 'Average position': 'Avg. position' } : { 'Average position': 'Avg. position' };
    const labW = Math.max(...o.rows.map((r) => tw(labs[r[0]] || r[0], s.ax, 500))) + 12;
    const gap = 3, cw = (w - labW - gap * (m - 1)) / m, top = s.ax + 10;
    const ch = ((c.fixH || 220) - top - gap * (n - 1)) / n;
    let g = '';
    o.cols.forEach((h, i) => { g += T(labW + i * (cw + gap) + 8, s.ax, h.replace('AI Overviews', 'AI Overviews'), { fs: s.ax, w: 500, c: th.muted }); });
    o.rows.forEach((r, j) => {
      const y = top + j * (ch + gap);
      g += T(0, y + ch / 2 + s.ax * 0.35, labs[r[0]] || r[0], { fs: s.ax, w: 500, c: th.body });
      r[1].forEach((v, i) => {
        const parts = v.split(' '), num = parts.pop(), name = parts.join(' '), lf = name === 'LoudFace', om = name === 'Omniscient';
        const x = labW + i * (cw + gap), bg = lf ? th.cellHi : om ? th.cellA : th.cellB, ink = lf ? th.cellHiInk : th.cellInk;
        g += bg === 'outline' ? `<rect x="${r1(x + 0.75)}" y="${r1(y + 0.75)}" width="${r1(cw - 1.5)}" height="${r1(ch - 1.5)}" fill="none" stroke="${th.line2}" stroke-width="1.5"/>` : `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(cw)}" height="${r1(ch)}" fill="${bg}"/>`;
        const nm = tw(name, s.ax, 500) > cw - 14 ? name.split(' ')[0] : name;
        if (tw(nm, s.ax, 500) <= cw - 12) g += T(x + 7, y + 8 + s.ax * 0.82, nm, { fs: s.ax, w: 500, c: ink });
        g += T(x + 7, y + ch - 8, num, { fs: s.val - 1, w: 500, c: ink, fig: true });
      });
    });
    const legend = [{ label: 'LoudFace', color: th.cellHi }, { label: 'Omniscient', color: th.cellA }, { label: 'Another agency', color: th.cellB === 'outline' ? 'transparent' : th.cellB, outline: th.cellB === 'outline' ? th.line2 : null }];
    return { h: top + n * ch + (n - 1) * gap, svg: g, legend };
  }

  // Ranked domain table with an inline bar per row; the owned domains marked.
  function table(c, o) {
    const { th, s, w } = c, sm = c.size === 'sm', x1 = w - (c.wm || 0);
    const rh = sm ? 40 : s.row, top = s.ax + 14;
    const domW = Math.max(...o.rows.map((r) => tw(r[0], s.fs, 500))) + 24;
    const typeW = tw('Source type', s.ax, 500) + 22, citW = tw('Citations', s.ax, 500);
    const engW = Math.max(...o.rows.map((r) => tw(r[4], s.fs))), shareW = tw('11.0%', s.val, 500, NM);
    const cols = sm
      ? { dom: 0, bar: x1 * 0.5, share: x1 }
      : { dom: 0, type: domW, cit: domW + typeW + citW, bar: domW + typeW + citW + 22, eng: x1 - engW, share: x1 - engW - 24 };
    const barW = (sm ? x1 - 46 : cols.share - shareW - 14) - cols.bar;
    let g = '';
    const head = (x, t, a) => T(x, s.ax, t, { fs: s.ax, w: 500, c: th.muted, a });
    g += head(0, 'Domain');
    if (!sm) { g += head(cols.type, 'Source type') + head(cols.cit, 'Citations', 'end') + head(cols.share, 'Share', 'end') + head(cols.eng, 'Most from'); }
    else g += head(cols.share, 'Share', 'end');
    g += `<line x1="0" x2="${r1(x1)}" y1="${top - 4}" y2="${top - 4}" stroke="${th.base}"/>`;
    o.rows.forEach((r, i) => {
      const [dom, type, cit, share, eng] = r, own = type === 'You', y0 = top - 4 + i * rh, yc = y0 + rh / 2;
      if (own) g += `<rect x="0" y="${r1(y0 + 1)}" width="${r1(x1)}" height="${rh - 1}" fill="${th.band}"/>`;
      const dc = own ? th.hi : th.ink;
      if (sm) {
        g += T(0, yc - 2, dom, { fs: s.fs, w: 500, c: dc });
        g += T(0, yc + s.ax + 1, `${type === 'You' ? 'Owned' : type} · ${nf(cit)}`, { fs: s.ax, c: th.muted });
      } else {
        g += T(0, yc + s.fs * 0.35, dom, { fs: s.fs, w: 500, c: dc });
        g += T(cols.type, yc + s.fs * 0.35, type === 'You' ? 'Owned' : type, { fs: s.fs, c: th.body });
        g += T(cols.cit, yc + s.fs * 0.35, nf(cit), { fs: s.fs, c: th.body, a: 'end' });
        const [en, ep] = [eng.replace(/ [\d.]+%$/, ''), eng.match(/[\d.]+%$/)[0]];
        g += T(cols.eng, yc + s.fs * 0.35, `${en} `, { fs: s.fs, c: th.body }) + T(cols.eng + tw(`${en} `, s.fs), yc + s.fs * 0.35, ep, { fs: s.fs, c: th.muted });
      }
      const bl = Math.max(2, (share / o.max) * barW), bh = sm ? 10 : 12;
      g += `<rect x="${r1(cols.bar)}" y="${r1(yc - bh / 2)}" width="${r1(bl)}" height="${bh}" fill="${c.fill(i === 0 || own ? th.hi : th.rest, i === 0 || own ? 'hi' : 'rest', 'h')}"/>`;
      g += T(cols.share, yc + s.val * 0.34, pct(share), { fs: s.val, w: 500, c: own || i === 0 ? th.hi : th.ink, fig: true, a: 'end' });
      g += `<line x1="0" x2="${r1(x1)}" y1="${r1(y0 + rh)}" y2="${r1(y0 + rh)}" stroke="${th.grid}"/>`;
    });
    return { h: top - 4 + o.rows.length * rh + 2, svg: g };
  }

  // Category leaders: a ruled list, the category quiet, the leader named.
  function list(c, o) {
    const { th, s, w } = c, x1 = w - (c.wm || 0), rh = s.row, top = s.ax + 14;
    let g = T(0, s.ax, 'Category', { fs: s.ax, w: 500, c: th.muted }) + T(x1, s.ax, 'Named first by ChatGPT', { fs: s.ax, w: 500, c: th.muted, a: 'end' });
    g += `<line x1="0" x2="${r1(x1)}" y1="${top - 4}" y2="${top - 4}" stroke="${th.base}"/>`;
    o.rows.forEach((r, i) => {
      const y0 = top - 4 + i * rh, yc = y0 + rh / 2;
      g += T(0, yc + s.fs * 0.35, r[0], { fs: s.fs, c: th.body });
      const lw = tw(r[1], s.val, 500, NM);
      g += `<rect x="${r1(x1 - lw - 18)}" y="${r1(yc - 4)}" width="8" height="8" fill="${i === 0 ? th.hi : th.rest}"/>`;
      g += T(x1, yc + s.val * 0.34, r[1], { fs: s.val, w: 500, c: i === 0 ? th.hi : th.ink, fig: true, a: 'end' });
      g += `<line x1="0" x2="${r1(x1)}" y1="${r1(y0 + rh)}" y2="${r1(y0 + rh)}" stroke="${th.grid}"/>`;
    });
    return { h: top - 4 + o.rows.length * rh + 2, svg: g };
  }

  /* ------------------------------------------------------------ the studies, mapped to forms */
  const S = (id) => STUDIES.find((x) => x.id === id);
  const benchSrc = () => ({ n: `${nf(BENCH.total)} citations, ${nf(BENCH.conversations)} conversations`, date: '2026-06-01' });
  const rowsOf = (st, fmt, hi) => st.chart.rows.map((r, i) => ({ label: r[0], v: r[1], text: fmt(r[1], r), hi: i === hi }));

  const SPEC = {
    'cite-wait': { head: ['42 days', 'until half of new pages had a first AI citation (estimated)'], axis: 'New pages with a first AI citation, by day',
      draw: (c) => columns(c, { rows: rowsOf(S('cite-wait'), pct, S('cite-wait').chart.hi), max: 100, ticks: [0, 25, 50, 75, 100], tick: (t) => `${t}%`, call: 'Over half by day 60' }) },
    agree: { head: ['71.3%', 'of the agencies AI names come from one engine only'], axis: 'Share of 4,235 agency names',
      draw: (c) => stack(c, { segs: S('agree').chart.rows.map((r, i) => ({ label: r[0], v: r[1], count: `${r[2]} names`, style: ['hi', 'rest', 'hatch'][i] })) }) },
    'seo-time': { head: ['101 of 336', 'new pages had a Google click by day 28'], axis: 'New pages, first 28 days',
      draw: (c) => funnel(c, { rows: S('seo-time').chart.rows }) },
    'state-seo': { head: ['180 of 180', 'B2B software searches showed an AI Overview'], axis: 'Searches, of 180',
      draw: (c) => hbars(c, { rows: rowsOf(S('state-seo'), (v) => nf(v), 0), max: 180, ticks: [0, 45, 90, 135, 180], call: 'Every search' }) },
    'state-content': { head: ['66.7%', 'of clicks went to ranked lists, 18.5% of the posts'], axis: 'Ranked lists, share of each total',
      draw: (c) => columns(c, { rows: rowsOf(S('state-content'), pct, 2), max: 100, ticks: [0, 25, 50, 75, 100], tick: (t) => `${t}%`, call: 'From 18.5% of posts' }) },
    'state-ai': { head: ['13.8%', 'of weeks the three engines shared a top agency'], axis: 'Weekly top pick across the three engines',
      draw: (c) => { const ch = S('state-ai').chart; return stack(c, { segs: [{ label: ch.a[0], v: ch.a[1], style: 'hi' }, { label: ch.b[0], v: ch.b[1], style: 'hatch' }] }); } },
    sov: { head: ['4 formulas', 'three different leaders on the same category'], axis: 'First place, by formula and engine',
      draw: (c) => matrix(c, S('sov').chart) },
    hr: { head: ['25 of 36', 'AI answers about HR software name Rippling'], axis: 'Answers naming the vendor, of 36',
      draw: (c) => hbars(c, { rows: rowsOf(S('hr'), (v) => nf(v), 0), max: 36, ticks: [0, 9, 18, 27, 36], call: '25 of 36 answers' }) },
    devtools: { head: ['12', 'categories, one leader named first in each'], axis: 'First tool ChatGPT names, by category',
      draw: (c) => list(c, S('devtools').chart) },
    cyber: { head: ['14 of 36', 'SentinelOne’s score across ChatGPT and Google'], axis: 'Score across ChatGPT and Google, of 36',
      draw: (c) => hbars(c, { rows: rowsOf(S('cyber'), (v) => nf(v), 0), max: 36, ticks: [0, 9, 18, 27, 36], call: 'Leads at 14 of 36' }) },
    fintech: { head: ['4.6×', 'Toku’s visibility swing between engines; the median brand’s is 2.4×'], axis: 'Visibility per engine',
      draw: (c) => { const ch = S('fintech').chart; return dots(c, { cols: ch.cols, max: ch.max, rows: ch.rows.map((r) => ({ label: r[0], vals: r[1], hi: r[0] === 'Toku' })) }); } },
    gap: { head: ['11 of 90', 'buyer questions no agency wins at a 10% threshold'], axis: 'Buyer questions with no agency above the threshold, of 90',
      draw: (c) => columns(c, { rows: rowsOf(S('gap'), (v) => nf(v), S('gap').chart.hi), max: 20, ticks: [0, 5, 10, 15, 20], call: '10% threshold' }) },
    bench: { head: ['50.7%', 'of 160,240 AI citations went to company websites'], axis: 'Share of all citations, by source type',
      draw: (c) => hbars(c, { rows: rowsOf(S('bench'), pct, 0), max: 60, ticks: [0, 20, 40, 60], tick: (t) => `${t}%`, call: 'Half of every citation' }) },
    'bench-domains': { head: ['11,237', 'citations of reddit.com, the most-cited domain'], axis: 'Most-cited domains', src: benchSrc,
      draw: (c) => table(c, { rows: BENCH.domains, max: 7.0 }) },
    'bench-engines': { head: ['53.4%', 'Corporate’s share on AI Overviews and Perplexity, 48.0% on ChatGPT'], axis: 'Share of each engine’s citations, by source type (%)', src: benchSrc,
      draw: (c) => multiples(c, { keys: BENCH.mix_keys.map((k) => (k === 'You' ? 'You (owned)' : k)), panels: BENCH.engines_mix.map((e) => ({ name: e[0], vals: e[1], n: e[2] })), max: 60, hi: 0 }) },
    'bench-rates': { head: ['2.04', 'citations per retrieval for owned pages, the highest of any type'], axis: 'Citation rate against retrieval rate, by source type', src: benchSrc,
      draw: (c) => slope(c, { rows: BENCH.rates.map((r) => ({ label: r[0], a: r[1], b: r[2], hi: r[0].startsWith('You') })), max: 2.2, ticks: [0, 0.5, 1, 1.5, 2], fmt: (v) => v.toFixed(2), aTitle: 'Citation rate', bTitle: 'Retrieval rate' }) },
  };

  /* card mode: the same numbers in a form that fills the frame, and a legend under every chart */
  const pctT = (t) => `${t}%`;
  const CARD = {
    'state-seo': { axis: 'Searches, of 180', draw: (c) => columns(c, { rows: rowsOf(S('state-seo'), (v) => nf(v), 0), max: 180, ticks: [0, 45, 90, 135, 180] }),
      legend: (th) => [{ label: 'AI Overview shown', color: th.hi }, { label: 'What it cited', color: th.rest }] },
    'state-ai': { axis: 'Weeks, by the three engines’ top pick', draw: (c) => { const ch = S('state-ai').chart; return columns(c, { rows: [{ label: ch.a[0], v: ch.a[1], text: pct(ch.a[1]), hi: true }, { label: ch.b[0], v: ch.b[1], text: pct(ch.b[1]) }], max: 100, ticks: [0, 25, 50, 75, 100], tick: pctT }); },
      legend: (th) => [{ label: 'Engines agreed', color: th.hi }, { label: 'Engines differed', color: th.rest }] },
    'cite-wait': { legend: (th) => [{ label: 'Over half cited', color: th.hi }, { label: 'Earlier checkpoints', color: th.rest }] },
    'state-content': { legend: (th) => [{ label: 'Share of clicks', color: th.hi }, { label: 'Posts and impressions', color: th.rest }] },
    'seo-time': { legend: (th) => [{ label: 'Had a click', color: th.hi }, { label: 'Earlier steps', color: th.rest }, { label: 'Dropped out', color: 'transparent', outline: th.hatchEdge, hatch: th.hatch }] },
  };

  /* ------------------------------------------------------------ the wrapper */
  const fmtDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const legendHtml = (lg) => `<span class="c2-legend">${lg.map((l) => `<span><i style="background:${l.hatch ? `repeating-linear-gradient(135deg, ${l.hatch} 0 1.5px, transparent 1.5px 4px)` : l.color}${l.outline ? `;box-shadow:inset 0 0 0 1px ${l.outline}` : ''}"${l.dot ? ' class="is-dot"' : ''}></i>${esc(l.label)}</span>`).join('')}</span>`;
  function draw(el) {
    const id = el.dataset.chart2, card = el.dataset.card === 'on', spec = card && CARD[id] && CARD[id].draw ? { ...SPEC[id], ...CARD[id] } : SPEC[id];
    if (!spec) { el.textContent = `missing chart ${id}`; return; }
    const ground = el.dataset.ground || 'light', size = SZ[el.dataset.size] ? el.dataset.size : 'md';
    let th = theme(ground, el.dataset.tone);
    if (el.dataset.accent) { const a = el.dataset.accent; th = { ...th, hi: a, callBg: a, cellHi: a, cellHiInk: th.bg }; }
    if (el.dataset.rest) th = { ...th, rest: el.dataset.rest, rest2: el.dataset.rest, cellA: `${el.dataset.rest}80` };
    const paint = el.dataset.paint ? el.dataset.paint === 'on' : th.paint;
    const s = SZ[size];
    el.classList.add('c2', `is-${size}`);
    el.style.setProperty('--c2-bg', th.bg); el.style.setProperty('--c2-ink', th.ink); el.style.setProperty('--c2-muted', th.muted);
    el.style.setProperty('--c2-hi', th.hi); el.style.setProperty('--c2-head', th.ink); el.style.setProperty('--c2-grid', th.grid); el.style.setProperty('--c2-pad', `${s.pad}px`);
    el.classList.toggle('is-paint', paint);
    // content width: measure an empty pass so the padding is known
    el.innerHTML = '';
    const cs = getComputedStyle(el);
    const w = Math.floor(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) || 300;
    const c = ctx(th, size, w);
    c.wm = size === 'lg' ? 30 : 0; // room for the vertical watermark
    c.card = card; c.fixH = +el.dataset.h || 0;
    const out = spec.draw(c);
    if (card && !out.legend && CARD[id] && CARD[id].legend) out.legend = CARD[id].legend(th);
    const st = STUDIES.find((x) => x.id === id);
    const src = spec.src ? spec.src() : { n: st.n.replace(/, \d{1,2} \w{3} \d{4}$/, ''), date: st.date };
    const showHead = el.dataset.head ? el.dataset.head === 'on' : size === 'lg';
    const cap = el.dataset.caption === 'off' ? '' : el.dataset.caption || (size === 'sm' ? `Source: ${src.n}` : `Source: LoudFace research, ${src.n}`);
    let water = '';
    if (c.wm) water = `<text transform="translate(${w - 4} ${out.h - 2}) rotate(-90)" font-size="14" font-weight="700" letter-spacing="0.24em" fill="${th.water}">LOUDFACE</text>`;
    const label = esc(st ? st.finding : spec.head[1]);
    el.innerHTML =
      (showHead ? `<div class="c2-head"><b>${esc(spec.head[0])}</b><span>${esc(spec.head[1])}</span></div>` : '') +
      `<div class="c2-top"><span class="c2-axis">${esc(spec.axis)}</span>${out.legend && !card ? legendHtml(out.legend) : ''}</div>` +
      `<svg width="${w}" height="${Math.ceil(out.h)}" viewBox="0 0 ${w} ${Math.ceil(out.h)}" font-family='${SANS}' role="img" aria-label="${label}"><defs>${c.defs.join('')}</defs>${out.svg}${water}</svg>` +
      (card && out.legend ? `<div class="c2-under">${legendHtml(out.legend)}</div>` : '') +
      (cap ? (size === 'sm' ? `<div class="c2-cap"><span>${esc(cap)}, ${fmtDate(src.date)}</span></div>` : `<div class="c2-cap"><span>${esc(cap)}</span><span class="is-date">${fmtDate(src.date)}</span></div>`) : '');
    el.dataset.c2w = el.clientWidth;
  }

  const CSS = `
.c2{--c2-pad:24px;position:relative;min-width:0;color:var(--c2-ink);font-family:Satoshi,"Helvetica Neue",Arial,sans-serif;font-variant-numeric:tabular-nums}
.c2.is-paint{background:var(--c2-bg);padding:var(--c2-pad);border-radius:20px}
.c2.is-sm.is-paint{border-radius:14px}
.c2 svg{display:block;overflow:visible;font-variant-numeric:tabular-nums}
.c2-head{display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
.c2-head b{font-family:"Neue Montreal","Helvetica Neue",Arial,sans-serif;font-weight:500;font-size:40px;line-height:.95;letter-spacing:-.05em;color:var(--c2-head)}
.c2-head span{font-size:15px;line-height:1.4;color:var(--c2-muted);max-width:420px;text-wrap:balance}
.c2.is-lg .c2-head b{font-size:72px}
.c2.is-lg .c2-head span{font-size:16px}
.c2-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px 20px;margin-bottom:14px;font-size:13px}
.c2.is-sm .c2-top{font-size:11.5px;margin-bottom:10px}
.c2-axis{font-weight:500;color:var(--c2-muted)}
.c2-legend{display:flex;flex-wrap:wrap;gap:6px 16px;color:var(--c2-muted)}
.c2-legend>span{display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
.c2-legend i{display:block;width:10px;height:10px;border-radius:2px;box-shadow:inset 0 0 0 1px var(--c2-grid)}
.c2-legend i.is-dot{border-radius:99px;box-shadow:none}
.c2-cap{display:flex;justify-content:space-between;gap:16px;margin-top:16px;padding-top:12px;border-top:1px solid var(--c2-grid);font-size:13px;color:var(--c2-muted)}
.c2.is-sm .c2-cap{font-size:11.5px;margin-top:12px;padding-top:10px}
.c2-cap span.is-date{white-space:nowrap}
.c2-under{margin-top:16px;font-size:11.5px}
.c2-under .c2-legend{gap:6px 18px}
.c2-under .c2-legend i{width:9px;height:9px;border-radius:0;box-shadow:none}`;

  function drawAll() { document.querySelectorAll('[data-chart2]').forEach(draw); }
  function boot() {
    if (!document.getElementById('c2-style')) { const st = document.createElement('style'); st.id = 'c2-style'; st.textContent = CSS; document.head.appendChild(st); }
    const want = ['400 13px Satoshi', '500 13px Satoshi', '700 11px Satoshi', '500 20px "Neue Montreal"'];
    Promise.all(want.map((f) => document.fonts.load(f).catch(() => null))).then(() => document.fonts.ready).then(() => {
      drawAll();
      let t;
      window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => document.querySelectorAll('[data-chart2]').forEach((el) => { if (String(el.clientWidth) !== el.dataset.c2w) draw(el); }), 120); });
    });
  }
  window.Charts2 = { draw, drawAll, ids: () => Object.keys(SPEC) };
  if (document.readyState === 'complete') boot(); else window.addEventListener('load', boot);
})();
