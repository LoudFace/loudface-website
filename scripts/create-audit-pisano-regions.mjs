#!/usr/bin/env node
/**
 * Seed the Pisano regional assessment into the PRIVATE `proposals` Sanity dataset.
 *
 * Built for the 8 October 2026 call, after Şirin Komban asked (2 Oct) for an
 * independent view of Pisano's market, its visibility against competitors on
 * high buyer intent questions in the US, Europe and Asia Pacific, the gaps,
 * the initiatives that matter most, and how we would sequence them.
 *
 * Every number was measured on 8 October 2026: a Peec pitch project (8 buyer
 * questions x 6 countries, ChatGPT + Gemini + Google AI Overviews, 1,361
 * answers), DataForSEO live ChatGPT answers for Turkey, the UAE and Saudi
 * Arabia, Ahrefs Site Explorer, Google Ads volumes, and a live re-check of
 * pisano.com. Research files: content-engine/.claude/research/pisano/2026-10-08/.
 *
 * Usage:
 *   node scripts/create-audit-pisano-regions.mjs --dry-run
 *   node scripts/create-audit-pisano-regions.mjs --json-out=/path/doc.json
 *   node scripts/create-audit-pisano-regions.mjs --status=sent
 *
 * Env:
 *   SANITY_PROPOSALS_WRITE_TOKEN   write token for the proposals dataset
 *                                  (falls back to SANITY_API_TOKEN)
 *   SANITY_PROPOSALS_DATASET       defaults to `proposals`
 *   NEXT_PUBLIC_SANITY_PROJECT_ID  defaults to the LoudFace project
 */

import { randomBytes, randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';

/* ── args ─────────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = (name) => args.includes(`--${name}`);

const DRY_RUN = has('dry-run');
const JSON_OUT = flag('json-out', null);
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xjjjqhgt';
const DATASET = flag('dataset', process.env.SANITY_PROPOSALS_DATASET || 'proposals');
const TOKEN = process.env.SANITY_PROPOSALS_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
const STATUS = flag('status', 'draft');
const VALID_UNTIL = flag('valid-until', '2026-12-31');

/* ── token + code ─────────────────────────────────────────────────────── */
/* Kept in step with src/lib/proposal-token.ts — same alphabets, same lengths. */

const TOKEN_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const pick = (alphabet, length) =>
  Array.from(randomBytes(length), (byte) => alphabet[byte & 31]).join('');

const accessToken = flag('token', pick(TOKEN_ALPHABET, 26));
const accessCode = flag('code', `${pick(CODE_ALPHABET, 4)}-${pick(CODE_ALPHABET, 4)}`);

/* ── helpers ──────────────────────────────────────────────────────────── */

const key = () => randomUUID().slice(0, 12);
const para = (content, style = 'normal') => ({
  _type: 'block',
  _key: key(),
  style,
  markDefs: [],
  children: (typeof content === 'string' ? [{ text: content }] : content).map((run) => ({
    _type: 'span',
    _key: key(),
    text: run.text,
    marks: run.bold ? ['strong'] : [],
  })),
});
const section = (type, fields) => ({ _type: type, _key: key(), ...fields });
const trow = (cells, highlight = false) => ({ _type: 'auditTableRow', _key: key(), cells, highlight });
const tile = (value, label, tone = 'bad') => ({ _type: 'scoreTile', _key: key(), value, label, tone });
const bar = (label, value, fraction, self = false) => ({ _type: 'auditBar', _key: key(), label, value, fraction, self });
const move = (title, body, meta) => ({ _type: 'auditMove', _key: key(), title, body, meta });
const mrow = (measurement, source, pulled) => ({ _type: 'auditMethodRow', _key: key(), measurement, source, pulled });
const finding = (tag, body, tone = 'alert') =>
  section('auditFindingSection', { tag, tone, body: body.map((p) => para(p)) });

/* ── measured numbers, 8 Oct 2026 ─────────────────────────────────────── */

// Peec, share of answers naming each brand, by country (US, GB, DE, SG, AU, IN).
const BY_COUNTRY = [
  ['Qualtrics', '94.2', '90.8', '90.4', '92.9', '92.5', '88.8'],
  ['Medallia', '89.6', '89.6', '86.6', '84.2', '87.5', '84.2'],
  ['Sprinklr', '50.4', '45.4', '55.2', '46.7', '46.4', '52.1'],
  ['InMoment', '50.8', '45.8', '44.8', '41.2', '46.4', '42.1'],
  ['Verint', '32.9', '41.2', '38.9', '36.7', '39.8', '35.4'],
  ['Chattermill', '38.8', '37.5', '34.7', '33.8', '33.9', '30.4'],
  ['Press Ganey Forsta', '29.2', '30.0', '35.6', '27.9', '27.2', '28.7'],
  ['Alchemer', '9.6', '13.8', '15.9', '15.0', '20.1', '13.8'],
  ['SMG', '6.2', '7.1', '7.1', '7.5', '8.0', '8.3'],
  ['Pisano', '2.9', '4.2', '4.2', '3.3', '5.4', '4.2'],
];
const PISANO_RANKS = ['15th', '16th', '14th', '17th', '15th', '16th'];

const pct = (v) => `${v}%`;

/* ── the document ─────────────────────────────────────────────────────── */

const doc = {
  _type: 'audit',
  _id: `audit.pisano-regions.${accessToken.slice(0, 10)}`,
  title: 'Pisano — Competitive position in AI search, by region',
  clientName: 'Pisano',
  preparedFor: ['Emilia Sirin Komban', 'Oğuz Özdil'],
  token: accessToken,
  accessCode,
  validUntil: VALID_UNTIL,
  status: STATUS,
  contactEmail: 'arnel@loudface.co',
  eyebrow: 'Competitive Assessment · AI search by region',
  subject: 'Pisano against the 2026 Voice of the Customer field',
  measuredOn: '8 October 2026',
  headline: 'Gartner put Pisano on the shortlist. The answer engines leave it off, in every region.',
  standfirst: [
    para([
      { text: 'We put eight enterprise buying questions to ChatGPT, Gemini and Google’s AI Overviews from six countries: 1,438 answers. Qualtrics was named in ' },
      { text: '92%', bold: true },
      { text: ' of them, Medallia in 87%. Pisano was named in ' },
      { text: '4%', bold: true },
      { text: '.' },
    ]),
    para(
      'The gap is the same in the United States, Europe and Asia Pacific, and the answers in every region draw on the same small set of sources. That is the good news: one programme moves every region at once.'
    ),
    para(
      'The better news: when a question carries a Pisano fact, such as its Gartner placement or its Peer Insights rating, the engines name Pisano, sometimes first. The work is to publish those facts where the engines look.'
    ),
  ],
  sections: [
    section('auditVerdictSection', {
      leftValue: '1 of 2',
      leftLabel:
        'Challengers among the 12 vendors in Gartner’s 2026 Magic Quadrant for Voice of the Customer Platforms. 337 Peer Insights ratings at 5.0.',
      leftSource: 'Gartner, 9 March 2026, as reported by CX Today and CXM World · Peer Insights, read 8 October 2026',
      rightValue: '4%',
      rightLabel:
        'Of 1,438 AI answers to enterprise buying questions, in six countries, that name Pisano. Alchemer, the other Challenger: 15%.',
      rightSource: 'Peec · ChatGPT, Gemini, Google AI Overviews · 8 October 2026',
      connector: 'versus',
    }),
    section('auditScorecardSection', {
      tiles: [
        tile('14th–17th', 'Pisano’s rank among 21 vendors in each of the six countries'),
        tile('0%', 'Of Gemini answers that name Pisano, in all six countries'),
        tile('0%', 'On the banking, agentic-AI and “best CX platform for large enterprises” questions, in all six countries'),
        tile('0.3%', 'Of answers that draw on pisano.com. Chattermill’s site: one in four'),
        tile('4 of 30', 'Most-used sources that mention Pisano at all'),
        tile('337', 'Gartner Peer Insights ratings at 5.0, 97% of them five stars. The proof exists; the answers do not use it', 'good'),
      ],
    }),

    /* 01 · Market, positioning and landscape ───────────────────────── */
    section('auditTableSection', {
      heading: 'The market, and where Pisano sits in it',
      intro:
        'Who the AI engines name in each region, the regional players and why they win, and what Pisano shows there today.',
      columns: ['Region', 'Named most by the engines', 'Regional players and why they win', 'Pisano today'],
      rows: [
        trow([
          'United States',
          'Qualtrics, Medallia, InMoment, Sprinklr',
          'Scale and analyst weight. Qualtrics holds FedRAMP High federal authorisation and now owns Press Ganey Forsta, with its healthcare base',
          'No US case study or office on the site',
        ]),
        trow([
          'UK and Europe',
          'Qualtrics, Medallia, Sprinklr, InMoment',
          'Chattermill in the UK, Tivian in DACH, CustomerGauge in Benelux: local offices, EU hosting, local references',
          'London office. A testimonial from Raiffeisen Bank International’s group CX lead; Škoda, BMW, Volvo and Allianz on the logo wall. No German-language pages; nine of the ten case studies are Turkish companies',
        ]),
        trow([
          'Asia Pacific',
          'Qualtrics, Medallia, Sprinklr, InMoment',
          'XEBO.ai and SurveySparrow from India. Qualtrics, Medallia and Sprinklr host data in Australia; Medallia also in Singapore',
          'No office or case study found',
        ]),
        trow([
          'Gulf',
          'Qualtrics, Medallia, InMoment, Forsta',
          'Data residency: Medallia announced Saudi-hosted servers in 2021 and a fully local UAE hosting model with New Metrics in March 2026. XEBO.ai has a Dubai office',
          'Arabic site, eight Vision 2030 pages, Yas Marina and Landmark brands on the logo wall. No Gulf case study or stated hosting region',
        ]),
        trow(
          [
            'Turkey',
            'Medallia, Qualtrics, Forsta',
            'Pisano and Cloud4Feed are the local players',
            'Strongest position: nine of the ten case studies, and 554 of pisano.com’s 1,239 monthly organic visits (Ahrefs estimate)',
          ],
          true
        ),
      ],
      note:
        'Named most: Peec (US, UK, Germany, Singapore, Australia, India) and ChatGPT (Turkey, UAE, Saudi Arabia), 8 October 2026. Regional players: vendor sites and press. Pisano today: pisano.com, read 8 October 2026.',
    }),
    section('auditTableSection', {
      heading: 'Who owns the shortlist now',
      intro:
        'The vendors AI answers name most, and who owns them today. Two ownership changes closed this year.',
      columns: ['Vendor', '2026 Magic Quadrant', 'Owner today'],
      rows: [
        trow(['Qualtrics', 'Leader', 'Silver Lake and CPP Investments, since June 2023']),
        trow(['Press Ganey Forsta', 'Leader', 'Qualtrics, since May 2026']),
        trow(['InMoment', 'Not listed', 'Press Ganey Forsta since 2025, so Qualtrics since May 2026']),
        trow(['Medallia', 'Leader', 'Its lenders, led by Blackstone, since August 2026']),
        trow(['Verint', 'Niche Player', 'Thoma Bravo, combined with Calabrio, since November 2025']),
        trow(['Sprinklr', 'Leader', 'Listed company']),
        trow(['Pisano', 'Challenger', 'Independent'], true),
      ],
      note: 'Qualtrics, Research Live, InMoment, Forrester, Medallia, Thoma Bravo, and the Magic Quadrant as reported by CX Today, June 2023 to August 2026.',
    }),
    finding('The opening', [
      'Two of the four Leaders changed hands this year. Qualtrics bought Press Ganey Forsta, which already owned InMoment, and Medallia passed to its lenders. Ask the AI engines for “Medallia alternatives” and they answer Qualtrics, InMoment and Verint. Two of those three are now one company.',
      'Forrester expects Forsta customers “to feel pressure to migrate to Qualtrics” and told InMoment customers to start an RFP “sooner rather than later” (20 May 2026). Gartner has heard of renewal challenges from Medallia clients (CMSWire, 4 May 2026). Pisano is the independent Challenger, rated 5.0 by its users, and it appears in 0–3.5% of the “Medallia alternatives” answers.',
      'Other vendors are already writing for these buyers. The engines read Syncly’s “11 Best InMoment Alternatives After the Qualtrics $6.75B Deal” and “6 Best Medallia Alternatives After the Thoma Bravo Exit”, and InMoment-alternatives lists from Perspective AI, Sprig and Hello Customer. None of them names Pisano.',
    ], 'ok'),

    finding('Who your buyers compare you with', [
      'On Gartner Peer Insights, Pisano’s own reviewers most often also considered Alterna CX (55%), Qualtrics (31%) and QuestionPro (27%). Pisano runs comparison pages against Qualtrics, Medallia, QuestionPro, NICE, SMG and Cloud4Feed, but not against Alterna CX, the vendor its buyers weigh most often. Alterna CX was outside this measurement and goes into the tracker next.',
    ], 'ok'),

    /* 02 · Visibility against competitors ─────────────────────────── */
    section('auditTableSection', {
      heading: 'Visibility against the field, by country',
      intro:
        'Share of answers naming each vendor. The same eight buying questions in every country: shortlist, alternatives, comparison, banking, agentic AI and the best platform in the region. None names Pisano; three name Qualtrics or Medallia, which lifts those two.',
      columns: ['Vendor', 'US', 'UK', 'Germany', 'Singapore', 'Australia', 'India'],
      numericColumns: [1, 2, 3, 4, 5, 6],
      rows: [
        ...BY_COUNTRY.map(([name, ...vals]) => trow([name, ...vals.map(pct)], name === 'Pisano')),
        trow(['Pisano’s rank of 21', ...PISANO_RANKS], true),
      ],
      note:
        'Peec, about 240 answers per country across ChatGPT, Gemini and Google AI Overviews, 8 October 2026.',
    }),
    finding('Not a regional problem', [
      'Pisano sits between 14th and 17th in each of the six countries. The leaders do not change either. The answers in Sydney, Frankfurt and New York draw on the same sources, so a fix in those sources reaches every region at once.',
    ]),
    section('auditTableSection', {
      heading: 'Turkey and the Gulf',
      intro:
        'The same buying questions asked from Pisano’s home region, on ChatGPT, with the US, UK and Germany for comparison. The last column is the answer to “best CX management platform for enterprises in” that country or region.',
      columns: ['Asked from', 'Pisano named', 'Qualtrics', 'Medallia', 'Named for “best in my region”'],
      numericColumns: [1, 2, 3],
      rows: [
        trow(['Turkey', '3 of 14', '93%', '100%', 'Qualtrics, Medallia, Forsta, Genesys, Verint'], true),
        trow(['United Arab Emirates', '1 of 14', '93%', '93%', 'Sprinklr, Medallia, Qualtrics, Forsta, Zendesk, and an unnamed row for “regional Arabic-native platforms”'], true),
        trow(['Saudi Arabia', '2 of 14', '100%', '93%', 'Sprinklr, Medallia, Qualtrics, Forsta, Zendesk'], true),
        trow(['United States', '2 of 14', '100%', '93%', 'Medallia, Qualtrics, NICE, Sprinklr, InMoment']),
        trow(['United Kingdom', '2 of 14', '93%', '93%', 'Qualtrics, Medallia, Forsta, NICE, Sprinklr, Verint']),
        trow(['Germany', '5 of 14', '100%', '93%', 'Qualtrics, Medallia, NICE, Sprinklr, then Pisano fifth as “a strong European alternative”, then InMoment']),
      ],
      note:
        'ChatGPT with web search via DataForSEO, one answer per question per country, 14 questions, 8 October 2026. In every country, the Gartner Magic Quadrant question named Pisano.',
    }),
    finding('Not even at home', [
      'Asked from Turkey for the best CX management platform for enterprises in Turkey, ChatGPT built a table with a “Turkey suitability” column and gave four or five stars to Qualtrics, Medallia, Forsta, Genesys and Verint. Pisano was not in it. The answer drew on Qualtrics’, Medallia’s and Forsta’s own pages, one Turkish CX site and Enterpret’s guide.',
      'Asked from the UAE, ChatGPT added a row for “regional Arabic-native platforms”, rated five stars for Middle East fit and for Arabic, and named none. Pisano supports Arabic and runs an Arabic site, and was not named.',
    ]),
    section('auditTableSection', {
      heading: 'Which engines name Pisano',
      intro: 'The same answers, split by engine.',
      columns: ['Engine', 'Pisano', 'Qualtrics', 'Medallia', 'Chattermill'],
      numericColumns: [1, 2, 3, 4],
      rows: [
        trow(['ChatGPT', '9–14%', '98–100%', '94–99%', '43–56%'], true),
        trow(['Gemini', '0%', '85–94%', '79–90%', '30–40%'], true),
        trow(['Google AI Overviews', '0–2.5%', '81–91%', '70–85%', '11–29%'], true),
      ],
      note: 'Range across the six countries. Peec, 8 October 2026.',
    }),
    finding('Google’s engines do not see Pisano', [
      'ChatGPT reads Gartner and names Pisano in about one answer in ten. Gemini and AI Overviews ground their answers in Google Search, where Pisano is missing for the buying terms: 0 of 12 commercial searches in the US top 100 on 17 September, and in today’s check of up to 69 results per search it appeared for 1 of 84 term-and-country pairs (Turkey, “voice of the customer platform”, 7th). All 84 of those searches showed an AI Overview.',
    ]),
    section('auditTableSection', {
      heading: 'Which questions name Pisano',
      columns: ['Buying question', 'Pisano, by country', 'Named most'],
      rows: [
        trow(['Which VoC platforms should an enterprise shortlist in 2026?', '10–20%', 'Qualtrics, Medallia, Chattermill']),
        trow(['Qualtrics vs Medallia vs other enterprise VoC platforms', '7–13%', 'Qualtrics, Medallia, InMoment']),
        trow(['Best Qualtrics alternatives for an enterprise CX programme', '7–10%', 'Medallia, InMoment, Forsta']),
        trow(['Best Medallia alternatives for enterprise', '0–3.5%', 'Qualtrics, InMoment, Verint']),
        trow(['Best CX management platforms for large enterprises', '0%', 'Qualtrics, Medallia, Sprinklr'], true),
        trow(['Best customer experience platform for banks', '0%', 'Qualtrics, NICE, Medallia'], true),
        trow(['CX platforms that use AI agents to close the loop', '0%', 'Qualtrics, Medallia, Chattermill'], true),
        trow(['Best CX platform for enterprises in the US, Europe or Asia Pacific', '0%', 'Qualtrics, Medallia, Sprinklr'], true),
        trow(['Top experience management (XM) platforms for enterprise, compared', '2 of 9', 'Qualtrics, Medallia, Forsta']),
        trow(['Platform combining customer and employee feedback', '2 of 9', 'Qualtrics, Medallia, InMoment']),
        trow(['Best feedback platform for retail chains with stores', '0 of 9', 'Medallia, Qualtrics, InMoment'], true),
        trow(['Best CX platform for telecom operators', '0 of 9', 'Medallia, Qualtrics, Verint'], true),
        trow(['Omnichannel feedback with kiosks, QR codes, SMS and in-app', '0 of 9', 'Medallia, Qualtrics, Zonka Feedback'], true),
      ],
      note: 'Percentages: range across six countries, Peec, three engines. “of 9”: ChatGPT, one answer in each of nine countries, DataForSEO. 8 October 2026.',
    }),
    section('auditQuoteSection', {
      attribution: 'ChatGPT, asked from the UK which VoC platforms an enterprise should shortlist in 2026. Its list: Qualtrics, Medallia, InMoment, Sprinklr, Verint, Press Ganey Forsta, Chattermill — 8 Oct 2026',
      quote:
        'The first six are all in Gartner’s 2026 VoC Magic Quadrant population; Chattermill is better viewed as a specialist alternative to the traditional enterprise suite.',
      note:
        'Pisano is in that Magic Quadrant, as a Challenger, and is left out. Chattermill is not in it, and is named. InMoment, counted among the six, no longer appears in it as its own entry.',
    }),
    finding('Absent where Pisano is strongest', [
      'Banking is where Pisano has the most named customers, and closing the loop is its product story: its Academy article ranked second on Google for “closing the loop” on 17 September. Yet on the banking question and the agentic-AI question Pisano is named in no answer in any country. One ChatGPT answer from the US credits Qualtrics’ Experience Agents, Medallia’s Smart Closed Loop and three smaller feedback tools instead.',
    ]),

    /* 03 · Gaps and opportunities ─────────────────────────────────── */
    section('auditTableSection', {
      heading: 'Where the answers come from',
      intro:
        'The pages the engines read before they answer. The list is almost identical in all six countries. 13 of the 30 most read are list publishers and trade titles, mostly vendor blogs that publish “best VoC tools” lists.',
      columns: ['Source', 'What it is', 'Read in', 'Mentions Pisano'],
      numericColumns: [2],
      pillColumns: [3],
      rows: [
        trow(['enterpret.com', 'Adjacent vendor, comparison lists', '24.8%', 'no']),
        trow(['qualtrics.com', 'Competitor', '23.9%', 'no']),
        trow(['chattermill.com', 'Competitor’s own blog', '23.8%', 'no']),
        trow(['gartner.com', 'Analyst', '22.1%', 'yes']),
        trow(['getperspective.ai', 'Adjacent vendor, comparison lists', '17.0%', 'yes']),
        trow(['medallia.com', 'Competitor', '17.0%', 'no']),
        trow(['cleverx.com', 'Research marketplace, tool lists', '15.4%', 'no']),
        trow(['koji.so', 'Adjacent vendor, comparison lists', '14.7%', 'no']),
        trow(['deeto.com', 'Adjacent vendor, comparison lists', '12.9%', 'no']),
        trow(['sprig.com · syncly.app · unitq.com', 'Adjacent vendors, comparison lists', '10.7–10.8% each', 'no']),
        trow(['hellocustomer.com', 'CX vendor, comparison lists', '9.9%', 'no']),
        trow(['cxtoday.com', 'Trade press', '6.9%', 'yes']),
        trow(['forrester.com', 'Analyst', '6.0%', 'no']),
        trow(['g2.com', 'Review marketplace', '5.9%', 'yes']),
        trow(['reddit.com', 'Community', '5.3%', 'no']),
        trow(['pisano.com', 'Pisano', '0.3%', 'yes'], true),
      ],
      note:
        'Share of the 1,438 answers in which the engine read the domain. Peec, six countries, 8 October 2026.',
    }),
    finding('The lists leave Pisano out', [
      'Of the 122 comparison, “best of” and “alternatives” pages the engines read for these questions, two mention Pisano, and both are Gartner’s own. The most read are Deeto’s “9 Best Customer Experience Platforms in 2026” (read 166 times), Chattermill’s “12 Picks” (144), unitQ’s “6 Best Enterprise Customer Feedback Platforms” (120) and Sprig’s “Best Medallia Alternatives: 2026 Edition” (109).',
    ]),
    finding('The Chattermill lesson', [
      'Chattermill is not in the Magic Quadrant. It is named in 30–39% of answers in every country, ahead of Press Ganey Forsta, a Leader, in five of the six, and far ahead of Pisano. Its own comparison pages are read in one answer in four. One of them, a list of “12 picks” last updated on 16 September, was the source ChatGPT cited for implementation speed on 8 October. Pisano is not on it. A vendor without the analyst placement earns the shortlist with content. Pisano has the placement, and its comparison pages are not being read.',
    ]),
    section('auditTableSection', {
      heading: 'Gaps and openings',
      columns: ['Gap', 'Evidence', 'Opening'],
      rows: [
        trow([
          'The 2026 Challenger placement is not on the site',
          'No 2026 Challenger page in the sitemap; the menu, the customers page and the Qualtrics comparison still cite 2025',
          'On both questions that name Gartner, Pisano was named in 93% of answers (17 Sep). Put the proof where every question can find it',
        ]),
        trow([
          'Missing from the lists the answers are built from',
          '4 of the 30 most-read sources mention Pisano. The most-read lists, Deeto’s “9 Best”, Chattermill’s “12 Picks” and unitQ’s “6 Best”, leave it out',
          '13 of the 30 are list publishers and trade titles, such as Enterpret, Perspective AI, CleverX, Koji, Deeto and CX Today. Placement there reaches every engine and region',
        ]),
        trow([
          'The pages that answer buying questions are not read',
          'Pisano has “Pisano vs” pages and a 2026 buyer guide, yet pisano.com is read in 0.3% of answers. 0 of 12 commercial searches in the US top 100 (17 Sep); 1 of 84 term-and-country checks today',
          'Alternatives, banking and agentic-AI pages written to be quoted, and the existing comparison pages rebuilt around the facts the engines look for',
        ]),
        trow([
          'Incumbents in ownership change',
          'Qualtrics + Forsta, Medallia to lenders, Verint private',
          'Migration and alternatives content while renewals are being reviewed',
        ]),
        trow([
          'Review proof is all on Gartner',
          '337 Peer Insights ratings at 5.0; few G2 reviews; g2.com is read in 5.9% of answers',
          'Bring G2 to a level answer engines cite. Cheap and fast',
        ]),
        trow([
          'Regional proof is thin outside Turkey',
          'Nine of the ten case studies are Turkish companies. Outside Turkey the proof is one testimonial (RBI’s group CX lead) and a logo wall (Škoda, BMW, Yas Marina): no written case study an engine can cite. No stated hosting regions',
          'Turn the logos into named, written references per region, with hosting facts. Medallia already announces Gulf hosting',
        ]),
        trow([
          'Technical base unchanged since 17 Sep',
          'No Product or FAQ schema; 491 knowledge-base articles live under two or more URL trees; 32 knowledge URLs in a redirect loop',
          'Two to three weeks inside HubSpot, so search engines read what Pisano sells and which page is canonical',
        ]),
      ],
      note: 'pisano.com re-checked live on 8 October 2026.',
    }),

    /* 04 · Direction ───────────────────────────────────────────────── */
    section('auditTableSection', {
      heading: 'The direction we recommend: win the questions where Pisano’s facts are better',
      intro:
        'Pisano will not out-shout Qualtrics on “best CX platform”, where the incumbents hold 90% of answers. So we asked the questions where Pisano has the stronger facts, and the questions buyers ask when an incumbent changes owner.',
      columns: ['Buyer question', 'Asked from', 'Pisano', 'Named instead', 'The answer was built from'],
      pillColumns: [2],
      rows: [
        trow(['Highest Gartner Peer Insights ratings', 'US', 'named first', 'NICE, InMoment, Chattermill', 'gartner.com'], true),
        trow(['Shortest implementation time, according to Gartner', 'US', 'named second', 'Alchemer first', 'gartner.com, cmswire.com, alchemer.com'], true),
        trow(['Fastest VoC platform to implement for an enterprise', 'US, UK', 'absent', 'Chattermill, Enterpret, Thematic', 'chattermill.com list last updated 16 Sep 2026, enterpret.com']),
        trow(['Closes the loop fastest, with automated case management', 'US', 'absent', 'InMoment, Qualtrics, Medallia, CustomerGauge', 'The vendors’ own product pages']),
        trow(['Arabic and Turkish surveys for enterprises in the Gulf', 'UAE', 'absent', 'Qualtrics, Medallia, QuestionPro, InMoment', 'The vendors’ own sites and help documentation']),
        trow(['Data hosting in Saudi Arabia', 'Saudi Arabia', 'absent', 'Sprinklr, Medallia, Qualtrics', 'sprinklr.com, trust.medallia.com']),
        trow(['Best VoC platform for a bank in the Middle East', 'UAE', 'absent', 'Medallia, Qualtrics, InMoment, Verint', 'gartner.com, medallia.com']),
        trow(['Better value than Qualtrics and Medallia', 'UK', 'absent', 'Chattermill, Enterpret, Thematic', 'chattermill.com, enterpret.com']),
        trow(['Is Medallia still safe after its 2026 restructuring?', 'US', 'absent', 'Medallia, Qualtrics, Sprinklr', 'reuters.com, medallia.com']),
        trow(['What Qualtrics buying Forsta means for Forsta customers', 'US', 'absent', 'Medallia, Alchemer, QuestionPro', 'forrester.com, qualtrics.com']),
      ],
      note:
        'ChatGPT with web search, one answer per question, 8 October 2026. Single answers, so read them as examples rather than rates.',
    }),
    section('auditQuoteSection', {
      attribution: 'ChatGPT, asked which VoC platforms have the shortest implementation time according to Gartner — 8 Oct 2026',
      quote:
        '[[Pisano]] · Gartner Peer Insights currently ranks it highly for Integration & Deployment · Likely among the faster options, although I couldn’t find Gartner explicitly stating an average implementation duration.',
      note:
        'The model believes it. It cannot find the proof, so the plain “fastest to implement” question goes to Chattermill, citing Chattermill’s own list from 16 September.',
    }),
    finding('The direction, in one line', [
      'The answer engines already believe Pisano when they are shown the proof: first on Peer Insights ratings, second on Gartner-rated speed, and in 93% of answers to the questions that name Gartner. Most answers Pisano loses were built from pages the winning vendors published about themselves. Pisano has the facts, but not on pages the engines read.',
      'So the strategy is not more content in general. It is proof, published where the engines look, for the six questions Pisano should win, and for the buyers re-shopping Medallia and Forsta right now.',
    ], 'ok'),

    /* 05 · Plays ───────────────────────────────────────────────────── */
    section('auditTableSection', {
      heading: 'Six plays, ranked',
      intro: 'Ranked by how many engines and regions each play moves, against the effort it takes.',
      columns: ['Play', 'Type', 'Questions it wins', 'Needs from Pisano', 'When'],
      rows: [
        trow([
          'Proof pages for six facts: speed to go live, closed-loop resolution time, Arabic and Turkish, hosting regions, Peer Insights 5.0, Gartner Challenger. Each with schema and an FAQ',
          'Content and technical',
          'The attribute questions above, in every region',
          'The real numbers and hosting regions',
          'Weeks 1–4',
        ]),
        trow([
          'Pisano’s own comparison of the 12 Magic Quadrant vendors: honest, sourced, updated quarterly',
          'Content',
          'Shortlist and comparison questions. This is how Chattermill gets read in one answer in four',
          'Review of claims about rivals',
          'Weeks 2–4',
        ]),
        trow([
          'A shortlist-rebuild desk: Medallia and Forsta migration guides, contract-timing checklists, a migration offer',
          'Content and PR',
          'Change-of-ownership questions, where Pisano is missing from the recommendations today',
          'The existing Qualtrics migration guide, one migration story',
          'Weeks 2–8',
        ]),
        trow([
          'Pisano’s facts placed in the lists other people write: the 13 list publishers and trade titles among the 30 most-read sources, then G2',
          'Citation and authority',
          'Every engine, every region',
          'Approval of the pitch and a G2 review ask',
          'Weeks 2–12',
        ]),
        trow([
          'A closed-loop benchmark from anonymised platform data: how fast enterprises resolve unhappy customers, by industry',
          'Original research',
          'Close-the-loop and agentic-AI questions. Earns trade press',
          'Data approval',
          'Weeks 4–12',
        ]),
        trow([
          'Regional proof: Gulf, Europe and Asia Pacific pages with a named reference and the hosting facts for each',
          'Content and authority',
          'The regional questions: 0% in six countries on Peec; named once in nine on ChatGPT (Germany)',
          'Named references outside Turkey',
          'Weeks 6–12',
        ]),
      ],
      note: 'Foundations run underneath from week one: the 2026 Challenger page, schema and knowledge-base consolidation.',
    }),

    /* 06 · Sequencing ──────────────────────────────────────────────── */
    section('auditPlanSection', {
      heading: 'How we would sequence the first stages',
      intro:
        'Everything runs inside HubSpot, and only consideration-stage questions count toward the target. Each stage is chosen so the next one compounds.',
      moves: [
        move(
          'Agree one measurement',
          'Merge your prompt set and ICPs with ours into one tracker, split by region and engine, with the attribute and ownership-change questions added. The target: Pisano named on the six proof questions and in the Medallia and Forsta answers first, then a rising share of the core shortlist. Your team approves claims, references and data; we write, build and place.',
          'Week 1'
        ),
        move(
          'Foundations Google’s engines can read',
          'Publish the 2026 Challenger page and repoint the menu. Add SoftwareApplication and FAQPage schema to the Organization markup already there. Consolidate the knowledge base and fix the redirect loop. Add an x-default language version for visitors outside your four languages.',
          'Weeks 1–3'
        ),
        move(
          'The six proof pages and the Magic Quadrant comparison',
          'The facts the engines already half-believe, published where they look. These move ChatGPT within weeks and give every later placement something to cite.',
          'Weeks 1–4'
        ),
        move(
          'The shortlist-rebuild desk',
          'Medallia and Forsta migration guides while renewals are under review, pitched to the trade press that already covers both deals.',
          'Weeks 2–8'
        ),
        move(
          'Placements and G2',
          'The vendor lists and trade press read most often in all six countries, each carrying a fact from the proof pages. Then G2, so the review evidence is not only on Gartner.',
          'Weeks 2–12'
        ),
        move(
          'Benchmark and regional layer',
          'The closed-loop benchmark, then Gulf, Europe and Asia Pacific proof with named references. Order set by your pipeline, not by search volume.',
          'Weeks 4–12'
        ),
      ],
    }),

    /* Proof ────────────────────────────────────────────────────────── */
    section('auditTableSection', {
      heading: 'The same approach, measured elsewhere',
      intro: 'Results from our own tracking, each with its dates. All are AI-answer measures, not pipeline.',
      columns: ['Company', 'Up against', 'What we did', 'Result'],
      rows: [
        trow([
          'Toku, B2B payroll software (2024–2026)',
          'Deel and Remote',
          'Picked a narrow set of questions it could own (stablecoin and crypto payroll), then built answer pages, a rates directory and an answers hub',
          'Named in 90–100% of answers on its two core shortlist questions, late July to mid-August 2026. Third of the field across all 95 tracked questions, behind Deel and Remote',
        ]),
        trow([
          'A B2B payments company (name under NDA)',
          'Stripe, with 43% of mentions',
          'Content written to be quoted, measured weekly against a fixed buyer-question panel',
          'From 0.5% of AI answers on 15 June to a 10.5% peak on 3 August 2026. Average rank from 6.0 to 1.6 by 24 August',
        ]),
        trow([
          'LoudFace, our own site',
          '52 other agencies',
          'Comparison and pricing pages, direct answers, schema, duplicates merged, “best agency” lists',
          'On the same 23 shortlist questions: from 0.06% of AI answers in April 2026 to 16.9% in September',
        ]),
        trow([
          'Delshad Legal, employment law',
          '11 other employment-law firms',
          'Site rebuild and a verified content engine',
          'First of 12 firms on AI share of voice, 32%, in the 30 days to 27 September 2026',
        ]),
      ],
      note: 'Peec, read 8 October 2026. Published case studies at loudface.co/case-studies.',
    }),
    finding('Why Toku matters here', [
      'Toku could not out-shout Deel on “best global payroll”. It won the questions it could own first: stablecoin and crypto payroll. That is the order we propose for Pisano: the proof questions and the ownership-change questions first, the broad shortlist after.',
    ], 'ok'),

    /* 06 · Comparing with Pisano's own data ────────────────────────── */
    section('auditTableSection', {
      heading: 'Reading this against your data',
      intro: 'What we measured, so it can be laid next to your prompt sets, competitor views and cited-domain lists.',
      columns: ['Item', 'This report'],
      rows: [
        trow(['Questions', '8 buying questions in 6 countries on three engines (Peec); 14 in 9 countries on ChatGPT; 12 attribute and ownership-change questions; 40 US questions on 17 September']),
        trow(['Engines', 'ChatGPT with web search, Gemini, Google AI Overviews']),
        trow(['Countries', 'United States, United Kingdom, Germany, Singapore, Australia, India on three engines. All nine, including Turkey, the UAE and Saudi Arabia, on ChatGPT with 14 questions each']),
        trow(['Vendors', '21, including all 12 Magic Quadrant vendors']),
        trow(['Visibility', 'Share of answers that name the vendor at least once']),
        trow(['Sources', 'Share of answers in which the engine read the domain']),
        trow(['Language', 'English everywhere. German, Turkish and Arabic questions are the next step']),
        trow(['Excluded', 'Branded and awareness questions. Not yet measured: Alterna CX, and Latin America, where Pisano runs a Spanish site for Mexico']),
      ],
      note: 'If you send your prompt set, we load it into the same tracker so both views read on one scale.',
    }),

    section('auditMethodSection', {
      heading: 'Method and provenance',
      rows: [
        mrow('Visibility, position and sources, 6 countries', 'Peec, 48 prompts, ChatGPT + Gemini + Google AI Overviews, 1,438 answers', '8 Oct 2026'),
        mrow('US baseline, 40 questions', 'Peec, ChatGPT + Gemini + Google AI Overviews, 1,153 answers', '17 Sep 2026'),
        mrow('Organic reach, keywords and AI citations by country', 'Ahrefs Site Explorer, subdomains mode', '8 Oct 2026'),
        mrow('Search demand by country', 'Google Ads volumes via DataForSEO, 9 countries', '8 Oct 2026'),
        mrow('Answers in 9 countries, 14 questions each', 'ChatGPT with web search via DataForSEO, 126 answers', '8 Oct 2026'),
        mrow('Attribute and ownership-change questions', 'ChatGPT with web search via DataForSEO, US, UK, UAE, Saudi Arabia', '8 Oct 2026'),
        mrow('Analyst, review and market position', 'Gartner, Forrester, Peer Insights, vendor and trade press', 'Read 8 Oct 2026'),
        mrow('Site re-check', 'Live fetch of pisano.com, sitemap, schema, hreflang, Lighthouse', '8 Oct 2026'),
        mrow('Pages the engines read', 'Peec URL report, 400 most-read pages, 122 of them comparison or alternatives pages', '8 Oct 2026'),
      ],
      note:
        'Every figure is a live reading taken on the date shown. Answer engines vary from run to run: Peec asks each question about 30 times per country across the three engines, and ranges are reported. The Turkey and Gulf table and the attribute table are single ChatGPT answers, and say so. Raw answers are retained.',
    }),
  ],
};

/* ── write ────────────────────────────────────────────────────────────── */

if (JSON_OUT) {
  writeFileSync(JSON_OUT, JSON.stringify(doc, null, 2));
  console.log(`Wrote ${JSON_OUT}`);
  console.log(`  Link:   https://www.loudface.co/a/${accessToken}`);
  console.log(`  Code:   ${accessCode}`);
  process.exit(0);
}

if (DRY_RUN) {
  console.log(JSON.stringify(doc, null, 2));
  console.log(`\n[dry run] would write to dataset "${DATASET}" on project ${PROJECT_ID}`);
  process.exit(0);
}

if (!TOKEN) {
  console.error('Missing SANITY_PROPOSALS_WRITE_TOKEN (or SANITY_API_TOKEN). See docs/PROPOSALS.md.');
  process.exit(1);
}

const { createClient } = await import('@sanity/client');
const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: TOKEN,
});

const created = await client.createOrReplace(doc);
const base = process.env.PROPOSAL_BASE_URL || 'https://www.loudface.co';
console.log(`Wrote ${created._id} to dataset "${DATASET}".`);
console.log('');
console.log(`  Link:   ${base}/a/${accessToken}`);
console.log(`  Code:   ${accessCode}`);
console.log(`  Status: ${STATUS}${STATUS === 'draft' ? '  (the link 404s until you set it to Sent)' : ''}`);
