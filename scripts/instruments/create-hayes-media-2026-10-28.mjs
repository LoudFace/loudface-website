/**
 * Create the Hayes Media case study and Jordan Hayes's testimonial as UNPUBLISHED Sanity drafts (28 Oct 2026).
 *
 * Search Console holds data for sc-domain:hayesmedia.co from 2 Sep 2026 only, the program's first week (first
 * article 4 Sep), so the baseline is 2–8 Sep and the latest complete week is 20–26 Oct (27 Oct was incomplete
 * when pulled). Non-branded means a query without "hayes", counted over the query+page rows Search Console names.
 * The $6,000 deal and the $50M-a-year brand's call are Hayes Media's own figures (Jordan Hayes, Oct 2026).
 *
 * Inputs:
 *   --gsc <JSON { daily: [[date, clicks, impressions], …], nonBranded: { before, after: { queries, queriesTop10,
 *     impressions } } }> pulled through Executor on 28 Oct. Raw counts never leave this script.
 *   --logo <png> --photo <png> from hayesmedia.co (openbrand: logo type "logo"; /team/jordan.png).
 *
 * Every published multiple must reproduce from the inputs, or nothing is written. Writes drafts only: publish from
 * Studio after Jordan signs off the testimonial.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/create-hayes-media-2026-10-28.mjs --gsc <f> --logo <f> --photo <f> [--write]
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
const g = JSON.parse(readFileSync(arg('--gsc'), 'utf8'));
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const CASE_ID = 'caseStudy-hayes-media-organic-leads';
const TESTIMONIAL_ID = 'testimonial-hayes-media-jordan';
const START = '2026-09-04';
const END = '2026-10-26';
const r1 = (v) => Math.round(v * 10) / 10;

/* ── Search Console ─────────────────────────────────────────────────── */
const daily = g.daily.filter(([d]) => d <= END);
if (daily[0][0] !== '2026-09-02' || daily.at(-1)[0] !== END) throw new Error(`pull is ${daily[0][0]} – ${daily.at(-1)[0]}`);
const range = (a, b) => daily.filter(([d]) => d >= a && d <= b);
const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const first = range('2026-09-02', '2026-09-08');
const last = range('2026-10-20', END);
if (first.length !== 7 || last.length !== 7) throw new Error('both weeks must be complete');
const baseImp = sum(first, 2) / 7;
const baseClk = sum(first, 1) / 7;
const { before: nb0, after: nb1 } = g.nonBranded;

const f = {
  queries: r1(nb1.queries / nb0.queries),
  top10: r1(nb1.queriesTop10 / nb0.queriesTop10),
  nbImp: r1(nb1.impressions / nb0.impressions),
  allImp: r1(sum(last, 2) / sum(first, 2)),
  lastDay: r1(daily.at(-1)[2] / baseImp),
};
const expect = { queries: 5.4, top10: 7.5, nbImp: 5.1, allImp: 2.3, lastDay: 3.9 };
for (const [k, e] of Object.entries(expect)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);

const points = daily.map(([date, c, i], n) => ({
  _key: `d-${n}`, date, month: new Date(`${date}T00:00:00Z`).toLocaleString('en', { month: 'short', timeZone: 'UTC' }),
  impressions: Math.round((i / baseImp) * 100), clicks: Math.round((c / baseClk) * 100),
}));

/* ── Copy ───────────────────────────────────────────────────────────── */
const WINDOW = 'program’s first week (2–8 Sep) → week of 20 Oct 2026';

const mainBody = `<p><strong>Short answer:</strong> Hayes Media closed a $6,000 consulting engagement from an inbound search lead in the first month of its SEO and AI-search content program, and a brand doing $50M a year booked a sales call through the same channel. In Google Search Console, the non-branded searches that show Hayes Media grew 5.4× and the non-branded searches where it ranks on Google’s first page grew 7.5×, from the program’s first week (2–8 September 2026) to the week of 20 October. Fifty articles went live in under eight weeks.</p>
<p>An agency that buys attention for its clients had almost none of its own in search. Google found Hayes Media by its name and rarely for the problems it solves. Eight weeks after we started publishing for them, search is a sales channel, and the founder says its leads arrive warmer than the ones paid ads bring.</p>

<h2>The client</h2>
<p>Hayes Media is an eCommerce growth agency founded by Jordan Hayes. It runs direct-response ad creative, Meta media buying, and email and SMS for brands scaling to $10M a year and beyond, and has worked with more than 57 eCommerce brands, including Remi, Mammoth Headwear and Austlen.</p>

<h2>The problem</h2>
<p>Brands choosing an agency compare them on Google, and more of them now ask ChatGPT or Gemini for a shortlist. Hayes Media had no pages answering those buyer questions and nothing an AI assistant could cite. In the first week Search Console recorded, almost every search that showed the site contained the word "Hayes", and the searches that did not almost never put it on page one.</p>

<h2>The strategy</h2>
<p>Three moves, the same <a href="/services/seo-aeo">SEO and AEO program</a> we run for our other clients.</p>
<p><strong>Map the questions buyers ask before they hire.</strong> We built the question map around Hayes Media’s three services: the agency-selection searches ("best email marketing agencies for eCommerce", "Meta ads agency", "agency vs in-house"), and the operator questions a retention or paid-social lead searches every week, such as Klaviyo flows, abandoned-cart emails, click-to-open rate and a falling Meta ROAS.</p>
<p><strong>Publish on a schedule, with sources.</strong> Fifty articles went live between 4 September and 27 October 2026. The ranked comparison pages name every competing agency with facts from that agency’s own site or Clutch profile, give each entry one honest limit, Hayes Media’s included, and list their sources.</p>
<p><strong>Make the site readable for AI assistants.</strong> A canonical facts page tells assistants what Hayes Media is, who runs it and what it sells, an llms.txt file points them to it, and every article opens with a direct answer an engine can quote. It is the same <a href="/services/geo-agency">generative engine optimization</a> work that put <a href="/case-studies/delshad-legal-content-engine">Delshad Legal first of 12 tracked firms in AI answers</a>.</p>

<h2>The results</h2>

<h3>$6,000 closed in the first month</h3>
<p>In the program’s first month, a consulting lead from search closed at $6,000: four strategy calls and media-buying consulting over two months. A few weeks later, a brand doing $50M a year booked a sales call the same way. It wanted Google Ads, which Hayes Media does not sell, so that one did not close. Jordan’s read on the channel: search leads come to the call warmer than paid-ad leads. These figures are Hayes Media’s own.</p>

<h3>Google: 5.4× the searches, 7.5× on page one</h3>
<table>
<thead><tr><th>Measure (Google Search Console)</th><th>Program’s first week (2–8 Sep) → week of 20 Oct 2026</th></tr></thead>
<tbody>
<tr><td><strong>Non-branded searches that show Hayes Media</strong></td><td><strong>5.4×</strong></td></tr>
<tr><td><strong>Non-branded searches where it ranks on page one</strong></td><td><strong>7.5×</strong></td></tr>
<tr><td>Non-branded impressions</td><td>5.1×</td></tr>
<tr><td>All impressions, branded included</td><td>2.3×</td></tr>
</tbody>
</table>
<p>The climb is steepest at the end of the window: impressions on 26 October ran 3.9× the first week’s daily average. Most of the fifty articles are under four weeks old. Site-wide clicks have not moved yet, because most new pages still rank below the top ten, where few people click. The ranked list of eCommerce email agencies is the page furthest ahead: it already reaches page one for buyer questions such as "who are the best ecommerce email marketing agencies?".</p>

<h3>AI search: buyers’ questions now land on Hayes Media</h3>
<p>We did not run AI-visibility tracking for Hayes Media, so this study has no AI share-of-voice figure. Search Console shows the early sign. Over the program’s first eight weeks it logged long, conversational searches that read like questions typed to an assistant, such as "best klaviyo email marketing agency for small ecommerce stores" and "best ecommerce marketing agencies for fragrance brands", with Hayes Media at position 1 for both. AI assistants that search the web send queries like these to Google when a buyer asks them for a shortlist.</p>

<h2>What made this different</h2>
<p>The articles are written for the buyer who is about to hire, not for traffic. A ranked list where the author is number one only works if it is fair, so every entry carries a limit and every fact has a source. That is what lets a buyer, or an assistant reading for one, trust the page. The second difference is pace: we shipped fifty sourced articles in under eight weeks, and Hayes Media’s team never had to leave its client work to make it happen.</p>
<p>Search Console recorded this site from 2 September 2026, the program’s first week, so that week is the baseline. Non-branded counts use the searches Search Console names; it withholds rare ones in both weeks. Lead and revenue figures are Hayes Media’s own. Published 29 October 2026, with Search Console data to 26 October.</p>
<p>Engagement: SEO and AI-search content program, from September 2026.</p>`;

const paragraphSummary = 'Hayes Media, an eCommerce growth agency, closed $6,000 from one inbound search lead in the first month of the SEO and AI-search program we run for it. A brand doing $50M a year then booked a sales call through the same channel. In Google Search Console, the non-branded searches that show Hayes Media grew 5.4× from the program’s first week (2–8 September 2026) to the week of 20 October, and the non-branded searches where it ranks on page one grew 7.5×. Fifty articles went live in under eight weeks.';

const faq = [
  ['What does Hayes Media do?', 'Hayes Media is an eCommerce growth agency founded by Jordan Hayes. It runs direct-response ad creative, Meta media buying, and email and SMS for brands scaling to $10M a year and beyond.'],
  ['What did LoudFace do for Hayes Media?', 'We ran its SEO and AI-search content program: a map of the questions buyers ask before they hire an agency, fifty sourced articles in under eight weeks, ranked comparison pages, and a canonical facts page for AI assistants.'],
  ['How fast did the content produce leads?', 'In the first month a consulting lead from search closed at $6,000, and a few weeks later a brand doing $50M a year booked a sales call the same way. Both figures come from Hayes Media.'],
  ['Why are Google clicks not a headline figure?', 'They have not moved yet. Most of the articles are under four weeks old and still rank below the top ten, where few people click. The headline figures are the searches that show Hayes Media and the searches where it reaches page one.'],
  ['How was AI search measured?', 'It was not tracked with a visibility tool for this client, so the study gives no AI share of voice. Search Console shows conversational, assistant-style searches for agency shortlists reaching Hayes Media at position 1.'],
].map(([question, answer], i) => ({ _key: `faq-${i}`, _type: 'object', question, answer }));

// Approved by Jordan Hayes, 28 Oct 2026; keep it word for word
const testimonialBody = '<p>We brought LoudFace in to run our SEO and AI search, and the first lead from search closed inside a month: $6,000. What surprised me is the quality. People who find us through search come to the call warmer than anyone we get from paid ads, and a few weeks later a brand doing $50M a year booked a call the same way. LoudFace owns the strategy and the content end to end, so my team stays focused on our clients. LoudFace is hands down the best team for SEO and GEO if you care about generating revenue and not just vanity metrics.</p>';

/* ── Documents ──────────────────────────────────────────────────────── */
const exists = await client.fetch('*[_id in $ids]._id', { ids: [CASE_ID, `drafts.${CASE_ID}`, TESTIMONIAL_ID, `drafts.${TESTIMONIAL_ID}`] });
const slugTaken = await client.fetch('count(*[_type=="caseStudy" && slug.current==$s])', { s: 'hayes-media-organic-leads' });
if (exists.length || slugTaken) throw new Error(`already exists: ${exists.join(', ') || 'slug'}`);

const ecommerce = 'imported-industry-67bd0aa78c6b1235e30480df';
const marketing = 'imported-industry-67bdd3bbe5404a4375d952a7';
const weakRef = (id, type) => ({ _type: 'reference', _ref: id, _weak: true, _strengthenOnPublish: { type } });

const caseDoc = (logo) => ({
  _id: `drafts.${CASE_ID}`,
  _type: 'caseStudy',
  name: 'Hayes Media: $6,000 Closed From Search in Month One',
  slug: { _type: 'slug', current: 'hayes-media-organic-leads' },
  projectTitle: 'How Hayes Media made search a sales channel',
  paragraphSummary,
  mainBody,
  clientLogo: logo && { _type: 'image', alt: 'Hayes Media logo', asset: { _type: 'reference', _ref: logo } },
  clientColor: '#001f3f',
  secondaryClientColor: '#e8edf3',
  country: 'United States',
  websiteLink: 'https://hayesmedia.co/',
  visitTheWebsite: 'https://hayesmedia.co/',
  result1Number: '$6,000',
  result1Title: 'Closed from one inbound search lead in the program’s first month (Hayes Media’s figure)',
  result2Number: '5.4×',
  result2Title: `Non-branded Google searches that show Hayes Media, ${WINDOW} (Search Console)`,
  result3Number: '7.5×',
  result3Title: 'Non-branded searches where Hayes Media ranks on Google’s first page, same weeks',
  featured: false,
  disciplines: ['AI Search & Organic Growth'],
  industry: { _type: 'reference', _ref: ecommerce },
  industries: [{ _type: 'reference', _ref: ecommerce, _key: 'ind-0' }, { _type: 'reference', _ref: marketing, _key: 'ind-1' }],
  testimonial: weakRef(TESTIMONIAL_ID, 'testimonial'),
  instruments: {
    gscSource: 'Google Search Console · daily, 2 Sep – 26 Oct 2026 · indexed to 2–8 Sep = 100',
    engagementStart: START,
    indexedTrend: {
      title: 'Google impressions · indexed, first week = 100',
      baselineLabel: '2–8 Sep',
      startMonthIso: '2026-09',
      caption: 'Impressions per day, indexed to the program’s first week (2–8 September 2026) = 100. The seven days to 26 October averaged 2.3× that week, and 26 October alone 3.9×.',
      points,
    },
    publishedResult: {
      rows: [
        { _key: 'r-0', value: '5.4×', unit: 'non-branded searches that show Hayes Media, 2–8 Sep → week of 20 Oct' },
        { _key: 'r-1', value: '7.5×', unit: 'non-branded searches ranking on Google’s first page, same weeks' },
        { _key: 'r-2', value: '$6,000', unit: 'closed from one search lead in the first month' },
      ],
      caption: 'Sources: Google Search Console; lead and revenue figures from Hayes Media.',
    },
  },
  faq,
});

const testimonialDoc = (photo) => ({
  _id: `drafts.${TESTIMONIAL_ID}`,
  _type: 'testimonial',
  name: 'Jordan Hayes',
  slug: { _type: 'slug', current: 'jordan-hayes' },
  role: 'Founder | Hayes Media',
  testimonialBody,
  profileImage: photo && { _type: 'image', alt: 'Jordan Hayes, founder of Hayes Media', asset: { _type: 'reference', _ref: photo } },
  caseStudy: weakRef(CASE_ID, 'caseStudy'),
});

console.log('figures reproduce:', f, `${points.length} daily points`);
if (!WRITE) {
  console.log('dry run; pass --write to create the drafts');
  process.exit(0);
}
const logo = await client.assets.upload('image', createReadStream(arg('--logo')), { filename: 'hayes-media-logo.png' });
const photo = await client.assets.upload('image', createReadStream(arg('--photo')), { filename: 'jordan-hayes.png' });
await client.transaction().create(testimonialDoc(photo._id)).create(caseDoc(logo._id)).commit();
const back = await client.getDocument(`drafts.${CASE_ID}`);
console.log('draft written:', back._id, back.result1Number, back.result2Number, back.result3Number, back.instruments.indexedTrend.points.length, 'points');
