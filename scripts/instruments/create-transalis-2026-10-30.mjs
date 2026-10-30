/**
 * Create the Transalis GEO case study as an UNPUBLISHED Sanity draft (30 Oct 2026).
 *
 * Every AI figure is measured on one fixed set: the 73 Peec AI prompts tracked in both windows, 27 Jul – 23 Aug
 * and 24 – 30 Oct 2026, on ChatGPT, Google AI Overviews and Perplexity, against nine named EDI providers. Peec
 * added 18 prompts on 26 Oct and Transalis scores higher on those, so the all-prompt line in Peec's own dashboard
 * runs above these figures from that day; they are left out here so the climb is a change in answers, not in
 * questions. The 27 prompts tracked in August and since archived never named Transalis (all-prompt August 5.0%).
 * Google search is not part of this study.
 *
 * Input: --peec <JSON, read 30 Oct through Executor: windows, brands [name, visibility %, share of voice %,
 * position] per window, engines { visibility %, cited % of answers, cited rank among domains } per window, Ahrefs
 * Domain Rating, and the daily visibility share on the 73 prompts>. Aggregate percentages only.
 *
 * Every figure the copy prints must match the input, or nothing is written. Writes a draft only.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/create-transalis-2026-10-30.mjs --peec <f> --logo <svg> [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync, createReadStream } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const arg = (k) => {
  const v = args[args.indexOf(k) + 1];
  if (!args.includes(k) || !v || v.startsWith('--')) throw new Error(`${k} <file> is required`);
  return v;
};
const p = JSON.parse(readFileSync(arg('--peec'), 'utf8'));
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const CASE_ID = 'caseStudy-transalis-ai-visibility';
const SLUG = 'transalis-ai-visibility';

/* ── Figures the copy prints, checked against the input ─────────────── */
const brand = (w, name) => p.brands[w].find((b) => b[0] === name);
const rank = (w, name) => [...p.brands[w]].sort((a, b) => b[1] - a[1]).findIndex((b) => b[0] === name) + 1;
const T = { A: brand('A', 'Transalis'), B: brand('B', 'Transalis') };
const e = p.engines;
const x1 = (v) => `${(Math.round(v * 10) / 10).toFixed(1)}×`;
const growth = (name) => brand('B', name)[1] / brand('A', name)[1];
const others = p.brands.A.map((b) => b[0]).filter((n) => n !== 'Transalis' && brand('A', n)[1] >= 5);
const checks = {
  prompts: [p.prompts, 73],
  visA: [T.A[1], 5.2], visB: [T.B[1], 16.5], growth: [x1(T.B[1] / T.A[1]), '3.2×'],
  rankA: [rank('A', 'Transalis'), 6], rankB: [rank('B', 'Transalis'), 5], passed: [rank('B', 'OpenText'), 6],
  sovA: [T.A[2], 4.3], sovB: [T.B[2], 13.4], posA: [T.A[3], 4.9], posB: [T.B[3], 3.6],
  fastest: [others.every((n) => growth(n) < T.B[1] / T.A[1]), true], nextFastest: [x1(Math.max(...others.map(growth))), '1.5×'],
  gptA: [e.chatgpt.A.vis, 7.7], gptB: [e.chatgpt.B.vis, 24.2], gptCitedA: [`${e.chatgpt.A.cited}/${e.chatgpt.A.citedRank}`, '3.4/21'], gptCitedB: [`${e.chatgpt.B.cited}/${e.chatgpt.B.citedRank}`, '12.2/1'],
  aioA: [e.googleAio.A.vis, 7.2], aioB: [e.googleAio.B.vis, 18], aioCitedA: [`${e.googleAio.A.cited}/${e.googleAio.A.citedRank}`, '11.8/7'], aioCitedB: [`${e.googleAio.B.cited}/${e.googleAio.B.citedRank}`, '23.2/3'],
  pxA: [e.perplexity.A.vis, 0.7], pxB: [e.perplexity.B.vis, 7.2], pxCitedA: [`${e.perplexity.A.cited}/${e.perplexity.A.citedRank}`, '1.9/19'], pxCitedB: [`${e.perplexity.B.cited}/${e.perplexity.B.citedRank}`, '14.6/2'],
  drJun: [p.ahrefsDr['2026-06-01'], 38], drOct: [p.ahrefsDr['2026-10-01'], 48],
  lastDay: [p.daily.at(-1)[0], '2026-10-30'], lastDayPct: [Math.round(p.daily.at(-1)[1] * 1000) / 10, 22.5],
};
for (const [k, [got, want]] of Object.entries(checks)) if (got !== want) throw new Error(`copy says ${k} = ${want}, data says ${got}`);
const row = (n) => { const a = brand('A', n), b = brand('B', n); return `<tr><td>${n === 'Transalis' ? '<strong>Transalis</strong>' : n}</td><td>${a[1].toFixed(1)}%</td><td>${n === 'Transalis' ? `<strong>${b[1].toFixed(1)}%</strong>` : `${b[1].toFixed(1)}%`}</td><td>${n === 'Transalis' ? `<strong>${x1(b[1] / a[1])}</strong>` : x1(b[1] / a[1])}</td></tr>`; };

/* ── Copy ───────────────────────────────────────────────────────────── */
const mainBody = `<p><strong>Short answer:</strong> Transalis's visibility in AI answers rose from 5.2% to 16.5% on the same 73 tracked buyer prompts between August (27 July to 23 August) and the seven days to 30 October 2026 (Peec AI), the fastest climb of the ten EDI providers tracked, and it passed OpenText to fifth. ChatGPT now names Transalis in 24.2% of answers, up from 7.7%, and transalis.com is the website ChatGPT cites most on those prompts, up from 21st. Google AI Overviews cite transalis.com in 23.2% of answers, third among all websites, and Perplexity cites it second only to cleo.com.</p>
<p>A UK EDI provider with 22 years in the market was close to invisible when buyers asked AI assistants who to use. In August, ChatGPT, Google AI Overviews and Perplexity named Transalis in about one answer in twenty, behind four larger rivals. Ten weeks later they name it in one answer in six, and they cite its own website more than almost any other.</p>

<h2>The client</h2>
<p>Transalis is a UK managed EDI and eInvoicing provider. Suppliers, retailers and manufacturers connect once to the Transalis Trading Network, which already holds their trading partners, and run EDI and Peppol eInvoicing on that one connection at fixed pricing.</p>

<h2>The problem</h2>
<p>B2B buyers now ask AI assistants which EDI provider to choose, what EDI costs and what a retailer will require of them. On those questions the answers went to TrueCommerce, SPS Commerce, Data Interchange and Cleo. In August Transalis was named in 5.2% of answers on the prompts we track, sixth of ten providers, and ChatGPT cited twenty other websites more often than transalis.com.</p>

<h2>The strategy</h2>
<p>Three moves.</p>
<p><strong>Rebuild the site for AI crawlers as well as people.</strong> We moved transalis.com from WordPress to a fast Next.js site in July, with a clean page architecture and structured data, so every product, integration and directory page can be read and quoted.</p>
<p><strong>Answer the questions buyers ask, with sources.</strong> As part of our <a href="/services/seo-aeo">SEO and AEO program</a>, from August we published more than 25 verified articles and buyer guides: what EDI costs, how to choose a provider, the EDI requirements retailers set for their suppliers, affordable EDI for small UK businesses, the UK eInvoicing mandate and Peppol, and a glossary of supply-chain terms from GTIN and SSCC to OTIF. Every claim is checked against its primary source before it goes live.</p>
<p><strong>Measure the same questions every day.</strong> We track 73 buyer prompts daily on ChatGPT, Google AI Overviews and Perplexity against nine named competitors, so a change in the numbers is a change in the answers, not in the questions. It is the same method behind <a href="/case-studies/loudface-aeo-case-study">LoudFace’s own climb in AI answers</a>.</p>

<h2>The results</h2>

<h3>Visibility more than tripled, the fastest climb of ten providers</h3>
<p>On the same 73 prompts, Transalis was named in 5.2% of AI answers from 27 July to 23 August and in 16.5% in the seven days to 30 October 2026, 3.2× the August level. No other tracked provider grew faster than 1.5×. Its share of voice among the ten rose from 4.3% to 13.4%, and when it is named it now comes earlier in the answer: average position 4.9 in August, 3.6 now.</p>
<table>
<thead><tr><th>Provider</th><th>AI visibility, Aug 2026</th><th>24–30 Oct 2026</th><th>Change</th></tr></thead>
<tbody>
${['Data Interchange', 'TrueCommerce', 'SPS Commerce', 'Cleo', 'Transalis', 'OpenText'].map(row).join('\n')}
</tbody>
</table>
<p>The climb began in the week of 12 October and has not levelled off: on 30 October alone, Transalis was named in 22.5% of answers.</p>

<h3>ChatGPT now cites transalis.com more than any other website</h3>
<p>In ChatGPT, Transalis went from 7.7% of answers to 24.2%. Its website went from the 21st most-cited source on these prompts to the first: 12.2% of ChatGPT's answers now cite transalis.com, ahead of spscommerce.com and truecommerce.com.</p>

<h3>Google AI Overviews and Perplexity cite it too</h3>
<table>
<thead><tr><th>Engine</th><th>Answers naming Transalis, Aug → 24–30 Oct</th><th>Answers citing transalis.com, Aug → 24–30 Oct</th></tr></thead>
<tbody>
<tr><td>ChatGPT</td><td>7.7% → <strong>24.2%</strong></td><td>3.4% (21st) → <strong>12.2% (1st)</strong></td></tr>
<tr><td>Google AI Overviews</td><td>7.2% → <strong>18.0%</strong></td><td>11.8% (7th) → <strong>23.2% (3rd)</strong></td></tr>
<tr><td>Perplexity</td><td>0.7% → <strong>7.2%</strong></td><td>1.9% (19th) → <strong>14.6% (2nd)</strong></td></tr>
</tbody>
</table>
<p>Google AI Overviews now cite only truecommerce.com and youtube.com more often. Perplexity, which in August almost never named Transalis, now cites transalis.com second only to cleo.com.</p>

<h3>The domain grew with it</h3>
<p>Ahrefs rated transalis.com at Domain Rating 38 in June 2026, when the work began, and 48 in October.</p>

<h2>What made this different</h2>
<p>The assistants did not only mention Transalis more often. They read and cited its own pages, the guides and comparison pages we published, and that is what moves an answer from naming the usual four to naming Transalis. The proof is measured on a fixed set: Peec added 18 prompts to the tracked set on 26 October, and Transalis does better on those, but every figure on this page uses only the 73 prompts tracked since July.</p>
<p>AI figures come from Peec AI: 73 buyer prompts tracked daily on ChatGPT, Google AI Overviews and Perplexity since 27 July 2026, against nine named EDI providers. August means 27 July to 23 August; the latest window is the seven days to 30 October. The short rise on 12–15 September is a known Peec reading, when Perplexity returned about twice its usual number of sources. Published 30 October 2026.</p>
<p>Engagement: website rebuild and <a href="/services/geo-agency">AI-search (GEO) content program</a>, from June 2026.</p>`;

const lead = `Transalis's visibility in AI answers rose from 5.2% to 16.5% on the same 73 tracked buyer prompts, the fastest climb of ten EDI providers tracked by Peec AI.`;
if (lead.length > 160 || lead.length < 120) throw new Error(`summary lead is ${lead.length} characters; the meta description needs 120–160`);
const paragraphSummary = `${lead} ChatGPT now names it in 24.2% of answers, up from 7.7%, and transalis.com became the website ChatGPT cites most on those prompts, up from 21st. Google AI Overviews cite transalis.com in 23.2% of answers, third among all websites. Windows: 27 July to 23 August and the seven days to 30 October 2026.`;

const faq = [
  ['What does Transalis do?', 'Transalis is a UK managed EDI and eInvoicing provider. Suppliers, retailers and manufacturers connect once to its Trading Network and run EDI and Peppol eInvoicing on that one connection at fixed pricing.'],
  ['What did LoudFace do for Transalis?', 'We rebuilt transalis.com on Next.js, published more than 25 verified articles and buyer guides on the questions EDI buyers ask, and track 73 of those questions every day in ChatGPT, Google AI Overviews and Perplexity.'],
  ['How is AI visibility measured?', 'Visibility is the share of AI answers that name Transalis, read daily by Peec AI on the same 73 buyer prompts in ChatGPT, Google AI Overviews and Perplexity, against nine named EDI providers.'],
  ['Why only 73 prompts when Peec tracks more?', 'Peec added 18 prompts on 26 October, and Transalis does better on those. Every figure here uses only the 73 prompts tracked since July, so the climb reflects changed answers, not new questions.'],
].map(([question, answer], i) => ({ _key: `faq-${i}`, _type: 'object', question, answer }));

/* ── Document ───────────────────────────────────────────────────────── */
const exists = await client.fetch('*[_id in $ids]._id', { ids: [CASE_ID, `drafts.${CASE_ID}`] });
const slugTaken = await client.fetch('count(*[_type=="caseStudy" && slug.current==$s])', { s: SLUG });
if (exists.length || slugTaken) throw new Error(`already exists: ${exists.join(', ') || 'slug'}`);
const ref = (id, key) => ({ _type: 'reference', _ref: id, ...(key ? { _key: key } : {}) });

const doc = (logo) => ({
  _id: `drafts.${CASE_ID}`,
  _type: 'caseStudy',
  name: 'Transalis: 3.2× AI Visibility, First in ChatGPT Citations',
  slug: { _type: 'slug', current: SLUG },
  projectTitle: 'How Transalis more than tripled its AI visibility',
  paragraphSummary,
  mainBody,
  clientLogo: logo && { _type: 'image', alt: 'Transalis logo', asset: { _type: 'reference', _ref: logo } },
  clientColor: '#0d2236',
  secondaryClientColor: '#e6f1f9',
  country: 'United Kingdom',
  websiteLink: 'https://www.transalis.com/',
  visitTheWebsite: 'https://www.transalis.com/',
  result1Number: '5.2% → 16.5%',
  result1Title: 'AI visibility on the same 73 tracked buyer prompts, 27 Jul–23 Aug → 24–30 Oct 2026 (Peec AI)',
  result2Number: '21st → 1st',
  result2Title: 'transalis.com among the websites ChatGPT cites on those prompts, same windows (Peec AI)',
  result3Number: '11.8% → 23.2%',
  result3Title: 'Google AI Overview answers citing transalis.com, now 3rd among all websites, same windows',
  featured: false,
  disciplines: ['AI Search & Organic Growth'],
  industry: ref('imported-industry-67bd4204162fa29541707292'),
  industries: [ref('imported-industry-67bd4204162fa29541707292', 'ind-0'), ref('imported-industry-67bd0a908413cf5c63201f71', 'ind-1')],
  instruments: {
    aiSource: 'Peec AI · daily, 28 Jul – 30 Oct 2026 · the same 73 prompts',
    engagementStart: '2026-06-09',
    topicClimb: {
      title: 'AI visibility, same 73 prompts, daily',
      caption: '5.2% from 27 July to 23 August to 16.5% over 24–30 October 2026, on ChatGPT, Google AI Overviews and Perplexity; 22.5% on 30 October. The short rise on 12–15 September is a Perplexity source-count change.',
      points: p.daily.map(([week, value], i) => ({ _key: `d-${i}`, week, value })),
    },
    engineBeforeAfter: {
      beforeLabel: 'Aug 2026',
      afterLabel: '24–30 Oct 2026',
      caption: 'Share of answers naming Transalis, by engine, on the same 73 prompts.',
      rows: [['chatgpt', 'chatgpt'], ['googleAio', 'googleAio'], ['perplexity', 'perplexity']].map(([k, engine], i) => ({ _key: `r-${i}`, engine, before: e[k].A.vis / 100, after: e[k].B.vis / 100 })),
    },
    publishedResult: {
      rows: [
        { _key: 'r-0', value: '5.2% → 16.5%', unit: 'AI visibility, same 73 prompts, Aug → 24–30 Oct' },
        { _key: 'r-1', value: '6th → 5th of 10', unit: 'tracked EDI providers by AI visibility' },
        { _key: 'r-2', value: '7.7% → 24.2%', unit: 'ChatGPT answers naming Transalis' },
        { _key: 'r-3', value: '38 → 48', unit: 'Ahrefs Domain Rating, Jun → Oct 2026' },
      ],
      caption: 'Sources: Peec AI (73 prompts on ChatGPT, Google AI Overviews and Perplexity), Ahrefs.',
    },
  },
  faq,
});

console.log('figures check out:', Object.keys(checks).length, '| summary lead', lead.length, 'chars |', p.daily.length, 'daily points');
if (!WRITE) { console.log('dry run; pass --write to create the draft'); process.exit(0); }
const logo = await client.assets.upload('image', createReadStream(arg('--logo')), { filename: 'transalis-logo.svg' });
await client.create(doc(logo._id));
const back = await client.getDocument(`drafts.${CASE_ID}`);
console.log('draft written:', back._id, back.result1Number, '|', back.result2Number, '|', back.result3Number, '|', back.instruments.topicClimb.points.length, 'points');
