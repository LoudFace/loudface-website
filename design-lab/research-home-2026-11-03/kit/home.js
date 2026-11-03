/* Homepage research section boards: helpers shared by A, B and C. Data comes from kit/research.js (STUDIES), a
   local copy with the 3 Nov paper added. HEAD repeats kit/charts-v2.js SPEC heads, so a figure above a chart is the
   figure the chart draws. */
window.RH = (function () {
  const HEAD = {
    'cite-wait': ['42 days', 'until half of new pages had a first AI citation (estimated)'],
    agree: ['71.3%', 'of the agencies AI names come from one engine only'],
    'seo-time': ['101 of 336', 'new pages had a Google click by day 28'],
    'state-seo': ['180 of 180', 'B2B software searches showed an AI Overview'],
    'state-content': ['66.7%', 'of clicks went to ranked lists, 18.5% of the posts'],
    'state-ai': ['13.8%', 'of weeks the three engines shared a top agency'],
    sov: ['4 formulas', 'three different leaders on the same category'],
    hr: ['25 of 36', 'AI answers about HR software name Rippling'],
    devtools: ['12', 'categories, one leader named first in each'],
    cyber: ['14 of 36', 'SentinelOne’s score across ChatGPT and Google'],
    fintech: ['4.6×', 'Toku’s visibility swing between engines; the median brand’s is 2.4×'],
    gap: ['11 of 90', 'buyer questions no agency wins at a 10% threshold'],
    bench: ['50.7%', 'of 160,240 AI citations went to company websites'],
  };
  /* the four series (Measurement and Search share butter) and how their charts are drawn on their colour */
  const SER = [
    { key: 'index', name: 'AI Visibility Index', of: ['AI Visibility Index'], ground: ['stage', 'indigo'] },
    { key: 'saas', name: 'State of B2B SaaS', of: ['State of B2B SaaS'], ground: ['colour', 'coral'] },
    { key: 'ai', name: 'AI search behaviour', of: ['AI search behaviour'], ground: ['stage', 'indigo'] },
    { key: 'meas', name: 'Measurement and Search', of: ['Measurement', 'Search'], ground: ['colour', 'butter'] },
  ];
  const S = (id) => STUDIES.find((x) => x.id === id);
  const serOf = (s) => SER.find((x) => x.of.includes(s.series));
  const papersIn = (se) => STUDIES.filter((s) => se.of.includes(s.series));
  const T = (d) => Date.parse(d + 'T00:00:00Z');
  const short = (d) => new Date(T(d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const newest = (list) => [...list].sort((a, b) => T(b.date) - T(a.date))[0];
  // "101 of 336" -> 101<small>of 336</small>, "42 days" -> 42<small>days</small>
  const big = (h) => { const m = h.match(/^([\d.,]+) ((?:of [\d,]+)|days)$/); return m ? `${m[1]}<small>${m[2]}</small>` : h; };
  const url = (s) => `https://www.loudface.co/research/${s.src}`;
  const ARROW = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 9L9 3M4 3h5v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const RIGHT = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const cross = (pos) => `<span class="x" style="${pos}"><i></i><i></i></span>`;
  const mark = (s) => `<i class="s-mark s-${serOf(s).key}" aria-hidden="true"></i>`;
  const sentence = (s) => `${s.finding.replace(/\.$/, '')}.`;
  const kindOf = (s) => (serOf(s).name.includes(s.kind) ? '' : s.kind);
  return { HEAD, SER, S, serOf, papersIn, short, newest, big, url, ARROW, RIGHT, cross, mark, sentence, kindOf };
})();
