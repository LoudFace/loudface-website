/* Homepage research section, round 2: the six cards. RG.cards(mode) writes them into #rs-grid.
   mode 'accent' (A2): the chart on night, the paper's series lit as the one accent, every other mark grey-lavender.
   mode 'panels' (A3): the chart on an inset panel in the paper's full series colour, drawn as /research draws it.
   The six newest papers by date, from kit/research.js; the title is each paper's finding. */
window.RG = (function () {
  const { S, serOf, short, url } = RH;
  const IDS = [...STUDIES].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 6).map((s) => s.id);
  const LIT = { index: '#a5a1ff', saas: '#f8936f', ai: '#86dcb4', meas: '#f3c565' };
  const REST = '#625f8f';
  const CHART_H = { desk: 228, phone: 190 };
  const title = (s) => s.finding.replace(/\.$/, '');
  const source = (s) => `Source: ${s.n.replace(/, \d{1,2} \w{3} \d{4}$/, '')}`;

  function chart(s, se, mode, h) {
    const base = `data-chart2="${s.id}" data-size="sm" data-paint="off" data-caption="off" data-card="on" data-h="${h}"`;
    if (mode === 'accent') return `<div class="rc-chart" ${base} data-ground="stage" data-tone="night" data-accent="${LIT[se.key]}" data-rest="${REST}"></div>`;
    return `<div class="rc-panel on-${se.key}"><div class="rc-chart" ${base} data-ground="${se.ground[0]}" data-tone="${se.ground[1]}"></div></div>`;
  }

  function cards(mode) {
    const phone = matchMedia('(max-width: 899px)').matches, h = CHART_H[phone ? 'phone' : 'desk'];
    document.getElementById('rs-grid').innerHTML = IDS.map((id) => {
      const s = S(id), se = serOf(s);
      return `<a class="rc" href="${url(s)}">
        <div class="rc-meta"><span><i class="s-mark" style="background:${mode === 'accent' ? LIT[se.key] : `var(--s-${se.key})`}"></i>${se.name}</span><span>${short(s.date)}</span></div>
        <h3 class="rc-title">${title(s)}</h3>
        <div class="rc-fig">${chart(s, se, mode, h)}</div>
        <p class="rc-src">${source(s)}</p>
      </a>`;
    }).join('');
    const dots = document.getElementById('rs-dots');
    if (dots) dots.innerHTML = IDS.map(() => '<i></i>').join('');
  }
  return { IDS, cards };
})();
