/* LoudFace research boards (3 Nov 2026): the real data and one way of drawing it, shared by every direction.
   Every number below is copied from the published study on loudface.co (2 Nov 2026 capture); `src` names the page.
   A page places a chart with <div data-chart="<study id>" data-size="sm|md|lg"></div> and loads this file last. */

const STUDIES = [
  { id: 'agree', date: '2026-10-15', kind: 'Study', series: 'AI search behaviour',
    title: 'Do ChatGPT, Perplexity and Google AI Overviews recommend the same agencies?',
    finding: '71% of the agencies AI recommends are named by one engine only',
    n: '987 same-day answer sets', src: 'do-ai-engines-recommend-the-same-agencies',
    abstract: 'Where all three engines named an agency on the same day, 3,019 of 4,235 names (71.3%) appeared on one engine only, and 332 (7.8%) on all three.',
    chart: { type: 'bars', unit: '%', max: 100, rows: [['One engine only', 71.3, '3,019'], ['Two engines', 20.9, '884'], ['All three engines', 7.8, '332']] } },
  { id: 'seo-time', date: '2026-10-25', kind: 'Study', series: 'Search',
    title: 'How long does SEO take to work?',
    finding: 'New pages show up in Google by day 4. Clicks take weeks.',
    n: '336 new pages', src: 'how-long-does-seo-take',
    abstract: 'Of 336 new pages, 318 appeared in Google at a median of day 4, but only 101 had a click by day 28.',
    chart: { type: 'funnel', rows: [['Published', 336], ['Seen in Google', 318], ['Clicked by day 28', 101]] } },
  { id: 'state-seo', date: '2026-10-24', kind: 'Report', series: 'State of B2B SaaS',
    title: 'The State of B2B SaaS SEO (2026)',
    finding: 'Google showed an AI Overview on all 180 B2B software searches',
    n: '180 searches, 24 Oct 2026', src: 'state-of-b2b-saas-seo',
    abstract: 'An AI Overview appeared on 180 of 180 searches. It cited YouTube on 133 and the top-ranking page on only 40.',
    chart: { type: 'bars', unit: '', max: 180, rows: [['AI Overview shown', 180], ['Cited YouTube', 133], ['Cited the #1 result', 40]] } },
  { id: 'state-content', date: '2026-10-24', kind: 'Report', series: 'State of B2B SaaS',
    title: 'The State of B2B SaaS Content Marketing (2026)',
    finding: 'Ranked lists were 18.5% of posts and drew 66.7% of clicks',
    n: '108 posts', src: 'state-of-b2b-saas-content-marketing',
    abstract: 'On one B2B blog, ranked lists were 18.5% of 108 posts and drew 53.1% of Google impressions and 66.7% of clicks.',
    chart: { type: 'columns', unit: '%', max: 100, rows: [['Share of posts', 18.5], ['Impressions', 53.1], ['Clicks', 66.7]] } },
  { id: 'state-ai', date: '2026-10-23', kind: 'Report', series: 'State of B2B SaaS',
    title: 'The State of B2B SaaS Marketing and AI Search (2026)',
    finding: 'The three AI engines agreed on a weekly top agency 13.8% of the time',
    n: 'Generic agency questions, weekly', src: 'state-of-b2b-saas-marketing-ai-search',
    abstract: 'SaaS marketing holds at a median 8% of ARR. Where all three engines named a tracked agency, they shared a weekly top pick 13.8% of the time.',
    chart: { type: 'split', a: ['Same top pick', 13.8], b: ['Different top pick', 86.2] } },
  { id: 'sov', date: '2026-10-19', kind: 'Study', series: 'Measurement',
    title: 'AI share of voice: four formulas, one category, different leaders',
    finding: 'Mentions crowned one agency. Citations crowned another.',
    n: '141 agency questions, 3 engines', src: 'ai-share-of-voice-formula',
    abstract: 'Visibility and mention share put Omniscient first on every engine. Citation share put LoudFace first on every engine.',
    chart: { type: 'matrix', cols: ['ChatGPT', 'Perplexity', 'AI Overviews'],
      rows: [['Visibility', ['Omniscient 44.6%', 'Omniscient 34.1%', 'Omniscient 33.7%']], ['Mention share', ['Omniscient 12.7%', 'Omniscient 14.9%', 'Omniscient 11.4%']], ['Citation share', ['LoudFace 11.3%', 'LoudFace 6.6%', 'LoudFace 3.5%']], ['Average position', ['Discovered Labs 3.16', 'LoudFace 2.73', 'LoudFace 2.45']]] } },
  { id: 'hr', date: '2026-08-12', kind: 'Index', series: 'AI Visibility Index',
    title: 'The HR Tech AI Visibility Index (2026)',
    finding: 'Rippling is named in 25 of 36 AI answers about HR software',
    n: '36 answers, 3 engines', src: 'hr-tech-ai-visibility-index-2026',
    abstract: 'Rippling leads, named in 25 of 36 answers across ChatGPT, Google and Perplexity. Deel and Gusto tie for second at 18.',
    chart: { type: 'bars', unit: '', max: 36, rows: [['Rippling', 25], ['Deel', 18], ['Gusto', 18], ['BambooHR', 15], ['ADP', 14], ['HiBob', 10]] } },
  { id: 'devtools', date: '2026-08-07', kind: 'Index', series: 'AI Visibility Index',
    title: 'The DevTools AI Visibility Index (2026)',
    finding: 'Which developer tools ChatGPT names first, in 12 categories',
    n: '12 categories', src: 'devtools-ai-visibility-index-2026',
    abstract: 'ChatGPT names Postman for API development, GitHub Actions for CI/CD, Datadog for observability and LaunchDarkly for feature flags.',
    chart: { type: 'list', rows: [['API development', 'Postman'], ['CI/CD', 'GitHub Actions'], ['Observability', 'Datadog'], ['Feature flags', 'LaunchDarkly'], ['API docs', 'ReadMe'], ['Error monitoring', 'Sentry']] } },
  { id: 'cyber', date: '2026-08-06', kind: 'Index', series: 'AI Visibility Index',
    title: 'The Cybersecurity SaaS AI Visibility Index (2026)',
    finding: 'SentinelOne leads AI answers about security software',
    n: '24 answers, ChatGPT and Google', src: 'cybersecurity-saas-ai-visibility-index-2026',
    abstract: 'SentinelOne scores 14 (ChatGPT count × 2 plus Google top-10 count, out of 36), ahead of Palo Alto Networks at 12.',
    chart: { type: 'bars', unit: '', max: 24, rows: [['SentinelOne', 14], ['Palo Alto Networks', 12], ['Microsoft Defender', 11], ['Wiz', 11], ['Rapid7', 10], ['CrowdStrike', 8]] } },
  { id: 'fintech', date: '2026-07-30', kind: 'Index', series: 'AI Visibility Index',
    title: 'The Fintech AI Visibility Index (2026)',
    finding: 'The same fintech brand can be 4.6 times more visible on one engine',
    n: '23,294 conversations', src: 'which-ai-engine-cites-fintech-brands',
    abstract: 'Across 10 vendors and 142 prompts, the median brand’s visibility swings 2.4 times between engines. Toku’s swings 4.6 times.',
    chart: { type: 'dots', cols: ['ChatGPT', 'AI Overviews', 'Perplexity'], max: 70,
      rows: [['Remote', [62.61, 48.90, 49.44]], ['Deel', [61.48, 60.61, 36.75]], ['Papaya Global', [34.63, 15.31, 22.66]], ['Toku', [15.67, 36.19, 7.92]], ['Bitwage', [10.40, 14.01, 5.55]]] } },
  { id: 'gap', date: '2026-07-28', kind: 'Study', series: 'AI search behaviour',
    title: 'The AI Answer Gap: buyer questions no agency is winning',
    finding: '11 of 90 B2B SaaS buyer questions get almost no agency citations',
    n: '90 buyer questions', src: 'ai-answer-gap-b2b-saas-2026',
    abstract: 'At a 10% visibility threshold, 11 of 90 tracked buyer questions have no agency winning in ChatGPT, Perplexity or AI Overviews.',
    chart: { type: 'columns', unit: '', max: 20, rows: [['Under 3%', 7], ['Under 5%', 8], ['Under 8%', 10], ['Under 10%', 11], ['Under 15%', 16]], hi: 3 } },
  { id: 'bench', date: '2026-06-01', kind: 'Benchmark', series: 'AI search behaviour',
    title: 'What AI actually cites: the B2B SaaS AI-Citation Benchmark (2026)',
    finding: 'Company websites win half of all AI citations',
    n: '160,240 citations, 23,545 conversations', src: 'ai-citation-benchmark-b2b-saas-2026',
    abstract: 'Across 160,240 citations from five B2B SaaS brands, company websites took 50.7%. Reddit was the single most-cited domain, almost entirely through ChatGPT.',
    chart: { type: 'bars', unit: '%', max: 60, rows: [['Corporate', 50.7], ['UGC', 13.2], ['Editorial', 11.1], ['Reference', 8.0], ['Competitor', 7.9], ['You (owned)', 5.0], ['Other', 2.0], ['Institutional', 2.0]] } },
];

/* The benchmark's own tables, for its paper page (ai-citation-benchmark-b2b-saas-2026, published 1 June 2026). */
const BENCH = {
  total: 160240, conversations: 23545, projects: 5, engines: ['ChatGPT', 'Perplexity', 'Google AI Overviews'], window: '30 days to 1 June 2026',
  domains: [['reddit.com', 'UGC', 11237, 7.0, 'ChatGPT 80.5%'], ['toku.com', 'You', 5766, 3.6, 'ChatGPT 53.7%'], ['riseworks.io', 'Competitor', 2518, 1.6, 'AI Overviews 43.5%'],
    ['remote.com', 'Competitor', 2011, 1.3, 'ChatGPT 81.7%'], ['youtube.com', 'UGC', 2005, 1.3, 'AI Overviews 72.4%'], ['investopedia.com', 'Editorial', 1839, 1.1, 'AI Overviews 71.0%'],
    ['businessinsider.com', 'Editorial', 1782, 1.1, 'Perplexity 37.6%'], ['deel.com', 'Competitor', 1197, 0.7, 'ChatGPT 59.2%'], ['loudface.co', 'You', 1097, 0.7, 'ChatGPT 58.5%']],
  engines_mix: [['ChatGPT', [48.0, 15.0, 10.2, 10.3, 7.4, 5.4], 80608], ['AI Overviews', [53.4, 14.0, 10.7, 3.5, 8.4, 4.6], 42147], ['Perplexity', [53.4, 8.4, 13.6, 8.3, 8.3, 4.8], 37485]],
  mix_keys: ['Corporate', 'UGC', 'Editorial', 'Reference', 'Competitor', 'You'],
  rates: [['You (owned)', 2.038, 0.775], ['Competitor', 0.946, 0.315], ['UGC', 0.901, 0.413], ['Institutional', 0.774, 0.058], ['Editorial', 0.740, 0.206], ['Corporate', 0.715, 0.091], ['Reference', 0.676, 0.127], ['Other', 0.598, 0.037]],
};

/* ------------------------------------------------------------------ drawing */
const C = { ink: '#1a1040', body: '#4a4466', muted: '#6b6788', line: '#e4e4ea', ind: '#4f39f6', lav: '#c9bdf5', lav2: '#eeecfe', peach: '#f59a7b' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fmt = (v, u) => (u === '%' ? `${v.toFixed(1)}%` : Number(v).toLocaleString('en-US'));
const hatch = (id, col) => `<defs><pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><line x1="0" y1="0" x2="0" y2="6" stroke="${col}" stroke-width="2"/></pattern></defs>`;
let uid = 0;

const DRAW = {
  // Horizontal bars: label left, bar, value right. The first bar is solid indigo, the rest lavender.
  bars(c, w, s) {
    const lab = s === 'sm' ? 112 : 150, val = s === 'sm' ? 46 : 64, rh = s === 'sm' ? 22 : 34, bh = s === 'sm' ? 10 : 14, fs = s === 'sm' ? 11.5 : 13.5;
    const bw = w - lab - val, h = c.rows.length * rh;
    const rows = c.rows.map((r, i) => { const y = i * rh, x = (r[1] / c.max) * bw;
      return `<text x="0" y="${y + rh / 2 + 4}" font-size="${fs}" fill="${C.body}">${esc(r[0])}</text>
      <rect x="${lab}" y="${y + (rh - bh) / 2}" width="${bw}" height="${bh}" rx="${bh / 2}" fill="${C.lav2}"/>
      <rect x="${lab}" y="${y + (rh - bh) / 2}" width="${Math.max(bh, x)}" height="${bh}" rx="${bh / 2}" fill="${i === 0 ? C.ind : C.lav}"/>
      <text x="${w}" y="${y + rh / 2 + 4}" font-size="${fs}" font-weight="500" text-anchor="end" fill="${C.ink}">${fmt(r[1], c.unit)}</text>`; }).join('');
    return [h, rows];
  },
  // Columns rising from a baseline; `hi` marks the chosen column.
  columns(c, w, s) {
    const h = s === 'sm' ? 120 : 220, fs = s === 'sm' ? 11 : 13, base = h - 22, n = c.rows.length, gap = s === 'sm' ? 10 : 18, cw = (w - gap * (n - 1)) / n;
    const hi = c.hi ?? n - 1;
    const cols = c.rows.map((r, i) => { const x = i * (cw + gap), ch = (r[1] / c.max) * (base - 22);
      return `<rect x="${x}" y="${base - ch}" width="${cw}" height="${ch}" rx="4" fill="${i === hi ? C.ind : C.lav}"/>
      <text x="${x + cw / 2}" y="${base - ch - 7}" font-size="${fs}" font-weight="500" text-anchor="middle" fill="${C.ink}">${fmt(r[1], c.unit)}</text>
      <text x="${x + cw / 2}" y="${h - 4}" font-size="${fs - 0.5}" text-anchor="middle" fill="${C.muted}">${esc(r[0])}</text>`; }).join('');
    return [h, `<line x1="0" x2="${w}" y1="${base}" y2="${base}" stroke="${C.line}"/>${cols}`];
  },
  // A funnel of three counts: each step a bar, the lost part hatched.
  funnel(c, w, s) {
    const id = `h${uid++}`, rh = s === 'sm' ? 30 : 44, bh = s === 'sm' ? 14 : 20, fs = s === 'sm' ? 11.5 : 13.5, max = c.rows[0][1];
    const rows = c.rows.map((r, i) => { const y = i * rh, x = (r[1] / max) * w;
      return `<rect x="0" y="${y}" width="${w}" height="${bh}" rx="4" fill="url(#${id})"/>
      <rect x="0" y="${y}" width="${x}" height="${bh}" rx="4" fill="${i === c.rows.length - 1 ? C.ind : C.lav}"/>
      <text x="0" y="${y + bh + 13}" font-size="${fs}" fill="${C.body}">${esc(r[0])}</text>
      <text x="${w}" y="${y + bh + 13}" font-size="${fs}" font-weight="500" text-anchor="end" fill="${C.ink}">${r[1]}</text>`; }).join('');
    return [c.rows.length * rh + 6, hatch(id, C.lav) + rows];
  },
  // One bar split in two.
  split(c, w, s) {
    const bh = s === 'sm' ? 26 : 40, fs = s === 'sm' ? 11.5 : 13.5, xa = (c.a[1] / 100) * w;
    return [bh + 46, `<rect x="0" y="22" width="${w}" height="${bh}" rx="6" fill="${C.lav2}"/><rect x="0" y="22" width="${xa}" height="${bh}" rx="6" fill="${C.ind}"/>
      <text x="0" y="14" font-size="${fs}" font-weight="500" fill="${C.ink}">${c.a[1]}% ${esc(c.a[0].toLowerCase())}</text>
      <text x="${w}" y="${22 + bh + 18}" font-size="${fs}" text-anchor="end" fill="${C.muted}">${c.b[1]}% ${esc(c.b[0].toLowerCase())}</text>`];
  },
  // Who leads each formula on each engine: a cell per pair, coloured by leader.
  matrix(c, w, s) {
    const lab = s === 'sm' ? 0 : 130, rh = s === 'sm' ? 24 : 40, top = s === 'sm' ? 16 : 24, fs = s === 'sm' ? 10.5 : 12.5, cw = (w - lab) / c.cols.length;
    const col = (n) => (n.startsWith('LoudFace') ? C.ind : n.startsWith('Omniscient') ? C.lav : '#f3d6c9');
    const tx = (n) => (n.startsWith('LoudFace') ? '#fff' : C.ink);
    const head = c.cols.map((h, i) => `<text x="${lab + i * cw + cw / 2}" y="${top - 8}" font-size="${fs}" text-anchor="middle" fill="${C.muted}">${esc(h)}</text>`).join('');
    const rows = c.rows.map((r, j) => { const y = top + j * rh;
      return (lab ? `<text x="0" y="${y + rh / 2 + 4}" font-size="${fs}" fill="${C.body}">${esc(r[0])}</text>` : '') +
        r[1].map((v, i) => `<rect x="${lab + i * cw + 2}" y="${y + 2}" width="${cw - 4}" height="${rh - 4}" rx="5" fill="${col(v)}"/>
        <text x="${lab + i * cw + cw / 2}" y="${y + rh / 2 + 4}" font-size="${fs}" font-weight="500" text-anchor="middle" fill="${tx(v)}">${esc(s === 'sm' ? v.split(' ')[0] : v)}</text>`).join(''); }).join('');
    return [top + c.rows.length * rh, head + rows];
  },
  // Per-engine visibility per vendor: three dots on one track.
  dots(c, w, s) {
    const lab = s === 'sm' ? 84 : 120, rh = s === 'sm' ? 22 : 34, fs = s === 'sm' ? 11 : 13, bw = w - lab - 8, cols = [C.ind, C.peach, '#9a8ee8'];
    const rows = c.rows.map((r, i) => { const y = i * rh + rh / 2, xs = r[1].map((v) => lab + (v / c.max) * bw), lo = Math.min(...xs), hi = Math.max(...xs);
      return `<text x="0" y="${y + 4}" font-size="${fs}" fill="${C.body}">${esc(r[0])}</text><line x1="${lab}" x2="${lab + bw}" y1="${y}" y2="${y}" stroke="${C.line}"/>
      <line x1="${lo}" x2="${hi}" y1="${y}" y2="${y}" stroke="${C.lav}" stroke-width="4" stroke-linecap="round"/>` +
        xs.map((x, k) => `<circle cx="${x}" cy="${y}" r="${s === 'sm' ? 4 : 5.5}" fill="${cols[k]}" stroke="#fff" stroke-width="1.5"/>`).join(''); }).join('');
    const key = s === 'sm' ? '' : c.cols.map((n, k) => `<circle cx="${lab + k * 120 + 6}" cy="${c.rows.length * rh + 14}" r="5" fill="${cols[k]}"/><text x="${lab + k * 120 + 16}" y="${c.rows.length * rh + 18}" font-size="12" fill="${C.muted}">${esc(n)}</text>`).join('');
    return [c.rows.length * rh + (s === 'sm' ? 4 : 28), rows + key];
  },
  // A ranked list of category leaders.
  list(c, w, s) {
    const rh = s === 'sm' ? 21 : 32, fs = s === 'sm' ? 11.5 : 13.5;
    return [c.rows.length * rh, c.rows.map((r, i) => `<text x="0" y="${i * rh + rh / 2 + 4}" font-size="${fs}" fill="${C.muted}">${esc(r[0])}</text>
      <text x="${w}" y="${i * rh + rh / 2 + 4}" font-size="${fs}" font-weight="500" text-anchor="end" fill="${i === 0 ? C.ind : C.ink}">${esc(r[1])}</text>
      <line x1="0" x2="${w}" y1="${(i + 1) * rh}" y2="${(i + 1) * rh}" stroke="${C.line}"/>`).join('')];
  },
};

function drawChart(el) {
  const st = STUDIES.find((x) => x.id === el.dataset.chart);
  if (!st) { el.textContent = `missing chart ${el.dataset.chart}`; return; }
  const w = Math.round(el.getBoundingClientRect().width) || 300, s = el.dataset.size || 'md';
  const [h, body] = DRAW[st.chart.type](st.chart, w, s);
  el.innerHTML = `<svg width="${w}" height="${Math.ceil(h)}" viewBox="0 0 ${w} ${Math.ceil(h)}" font-family="Satoshi, Helvetica, Arial, sans-serif" role="img" aria-label="${esc(st.finding)}">${body}</svg>`;
}

const fmtDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
function drawAll() { document.querySelectorAll('[data-chart]').forEach(drawChart); }
// After the page's own scripts have placed their charts, and after the fonts, so text widths are final.
window.addEventListener('load', () => document.fonts.ready.then(drawAll));
