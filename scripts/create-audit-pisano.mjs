#!/usr/bin/env node
/**
 * Seed the Pisano audit into the PRIVATE `proposals` Sanity dataset.
 *
 * Every number in this file was measured live on 2026-09-17 against
 * www.pisano.com, the DataForSEO SERP + LLM-mentions APIs, the Ahrefs v3 API,
 * and 25 ChatGPT answers with web search enabled. Nothing here is estimated.
 * If you re-run this script later, re-measure first — a stale audit shown on a
 * call is worse than no audit.
 *
 * Usage:
 *   node scripts/create-audit-pisano.mjs --dry-run
 *   node scripts/create-audit-pisano.mjs
 *   node scripts/create-audit-pisano.mjs --status=sent --valid-until=2026-12-17
 *
 * Env:
 *   SANITY_PROPOSALS_WRITE_TOKEN   write token for the proposals dataset
 *                                  (falls back to SANITY_API_TOKEN)
 *   SANITY_PROPOSALS_DATASET       defaults to `proposals`
 *   NEXT_PUBLIC_SANITY_PROJECT_ID  defaults to the LoudFace project
 *
 * It prints the link and the access code at the end. Nothing else prints them
 * again, so keep that output.
 */

import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@sanity/client';

/* ── args ─────────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = (name) => args.includes(`--${name}`);

const DRY_RUN = has('dry-run');
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xjjjqhgt';
const DATASET = flag('dataset', process.env.SANITY_PROPOSALS_DATASET || 'proposals');
const TOKEN = process.env.SANITY_PROPOSALS_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
const STATUS = flag('status', 'draft');
const VALID_UNTIL = flag('valid-until', '2026-12-17');

/* ── token + code ─────────────────────────────────────────────────────── */
/* Kept in step with src/lib/proposal-token.ts — same alphabets, same lengths.
   Duplicated rather than imported because this script runs on plain node. */

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

/* ── the document ─────────────────────────────────────────────────────── */

const doc = {
  _type: 'audit',
  _id: `audit.pisano.${accessToken.slice(0, 10)}`,
  title: 'Pisano — AI search and SEO diagnostic',
  clientName: 'Pisano',
  preparedFor: ['Emilia Sirin Komban'],
  token: accessToken,
  accessCode,
  validUntil: VALID_UNTIL,
  status: STATUS,
  contactEmail: 'arnel@loudface.co',
  eyebrow: 'AI Search & SEO Diagnostic',
  subject: 'pisano.com',
  measuredOn: '17 September 2026',
  headline: 'The analysts found you. The answer engines did not.',
  standfirst: [
    para([
      { text: 'Gartner places Pisano among the ' },
      { text: 'twelve Voice of the Customer platforms in the world', bold: true },
      { text: ' worth evaluating. When we put twenty-three real enterprise buying questions to ChatGPT with live web search, Pisano was named in ' },
      { text: 'two of them', bold: true },
      { text: '.' },
    ]),
    para('Everything below is measured, dated and reproducible. Where a check came back clean, it says so.'),
  ],

  sections: [
    section('auditVerdictSection', {
      leftValue: '1 of 12',
      leftLabel:
        'Vendors in the 2026 Gartner Magic Quadrant for Voice of the Customer Platforms. Pisano is one of only two Challengers.',
      leftSource: 'Gartner, published 9 March 2026',
      rightValue: '2 of 23',
      rightLabel:
        'Non-branded buyer questions where ChatGPT names Pisano at all. Qualtrics appears in 21 of 25.',
      rightSource: 'Measured 17 September 2026',
      connector: 'versus',
    }),

    section('auditScorecardSection', {
      tiles: [
        tile('0.06%', "Pisano's share of AI answer visibility across the 11 tracked VoC vendors"),
        tile('0 / 12', 'Core commercial search terms where Pisano ranks in the top 100'),
        tile('147', 'Organic keywords, against 1,870 published URLs'),
        tile('12 / 12', 'Of those commercial searches now return an AI Overview above the results'),
        tile('53.6%', 'Of the sitemap is the same knowledge base published up to four times'),
        tile('0', 'Pages published about the 2026 Gartner Magic Quadrant, six months on'),
      ],
    }),

    /* 01 ───────────────────────────────────────────────────────────── */
    section('auditTableSection', {
      heading: 'What buyers are actually told',
      intro:
        'We ran 25 questions a real enterprise CX buyer would type, through ChatGPT with live web search switched on, from a United States vantage point. Two were branded questions naming Pisano. The other 23 are the discovery, shortlist and comparison questions that decide who gets on the list.',
      columns: ['Question type', 'Prompts', 'Pisano named', 'Result'],
      numericColumns: [1, 2],
      pillColumns: [3],
      rows: [
        trow(['Category discovery — "best CX platforms for large enterprises"', '5', '1', '1 of 5']),
        trow(['Alternatives & switching — "Qualtrics alternatives", "Medallia alternatives"', '4', '0', 'absent']),
        trow(['Industry fit — banking, retail, insurance, travel, telecom', '5', '0', 'absent']),
        trow(['Region & language — Turkey, Middle East, EMEA', '3', '0', 'absent']),
        trow(['Capability — agentic AI, text analytics, integrations', '4', '0', 'absent']),
        trow(['Buying criteria & analyst proof', '2', '1', '1 of 2']),
        trow(['Branded — the buyer already typed "Pisano"', '2', '2', 'yes'], true),
      ],
      note: 'ChatGPT with web search, 25 prompts, measured 17 September 2026. Full prompt set and raw answers retained.',
    }),

    finding('The pattern', [
      'Pisano answers well once it is named. It is almost never named first. Every question that builds a shortlist — alternatives, industry, region, capability — returned zero. Those are the questions that happen before a vendor is ever typed into a box.',
    ]),

    section('auditBarsSection', {
      heading: 'Who fills the answer instead',
      bars: [
        bar('Qualtrics', '21/25', 100),
        bar('Medallia', '19/25', 90.5),
        bar('InMoment', '10/25', 47.6),
        bar('Chattermill', '10/25', 47.6),
        bar('Salesforce', '10/25', 47.6),
        bar('NICE', '6/25', 28.6),
        bar('Alchemer', '5/25', 23.8),
        bar('Press Ganey Forsta', '5/25', 23.8),
        bar('Sprinklr', '4/25', 19),
        bar('Pisano', '4/25', 19, true),
      ],
      note:
        'Two of Pisano’s four appearances are the branded questions. Chattermill — a smaller, privately held UK vendor that is not in the Magic Quadrant at all — appears in ten. Answer share is not bought with company size.',
    }),

    section('auditQuoteSection', {
      attribution: 'ChatGPT, asked which vendors Gartner recognises for VoC — 17 Sep 2026',
      quote:
        'Magic Quadrant for Voice of the Customer Platforms (Published March 9, 2026) includes the following vendors: Alchemer · Concentrix · Medallia · [[Pisano]] · Press Ganey Forsta · Qualtrics · QuestionPro · Revuze · SMG · Sprinklr · Verint · XEBO.ai',
      note: 'The model knows. It simply does not volunteer Pisano unless the question is about Gartner.',
    }),

    /* 02 ───────────────────────────────────────────────────────────── */
    section('auditTableSection', {
      heading: 'Share of the machine answer',
      intro:
        'A second, independent measurement. This one counts how often each vendor’s domain is actually surfaced inside ChatGPT answers across the whole category, weighted by how often those answers are asked for.',
      columns: ['Vendor', 'Mentions', 'AI search volume', 'Share of field'],
      numericColumns: [1, 2, 3],
      rows: [
        trow(['SurveyMonkey', '1,150', '38,486', '48.15%']),
        trow(['Qualtrics', '972', '16,154', '20.21%']),
        trow(['NICE', '400', '8,922', '11.16%']),
        trow(['QuestionPro', '449', '7,142', '8.94%']),
        trow(['Sprinklr', '447', '4,601', '5.76%']),
        trow(['Verint', '77', '2,743', '3.43%']),
        trow(['Medallia', '55', '817', '1.02%']),
        trow(['Alchemer', '55', '421', '0.53%']),
        trow(['SMG', '28', '383', '0.48%']),
        trow(['InMoment', '24', '208', '0.26%']),
        trow(['Pisano', '9', '50', '0.06%'], true),
      ],
      note:
        'DataForSEO LLM mentions, ChatGPT, English / United States, pulled live 17 September 2026. Share is of the 11 tracked vendors only.',
    }),

    finding('Read this carefully', [
      'Pisano sits last, at 0.06%. SMG and InMoment — direct peers, both smaller than Pisano on several measures — hold eight and four times the share. This is not a product gap. It is a retrieval gap.',
    ]),

    /* 03 ───────────────────────────────────────────────────────────── */
    section('auditTableSection', {
      heading: 'The name problem',
      intro:
        'Before an answer engine can recommend you, it has to know what you are. We asked the same system which sources it draws on when it encounters "Pisano". The answer explains a great deal.',
      columns: ['Brand', 'Sources the model draws on'],
      rows: [
        trow([
          'Pisano',
          'Wikipedia · collinsdictionary.com · centercode.com · welly.it.com · TechTarget · Salesforce · names.org · dictionary.com',
        ], true),
        trow(['Qualtrics', 'qualtrics.com · Wikipedia · Scribbr · Indeed · TechTarget · SurveyMonkey · Reddit · Salesforce']),
        trow(['SurveyMonkey', 'surveymonkey.com · Scribbr · Wikipedia · OpenStax · Jotform · help.surveymonkey.com · Qualtrics']),
      ],
      note: 'Top sources ChatGPT associates with each brand term. DataForSEO LLM mentions, 17 September 2026.',
    }),

    finding('Entity ambiguity', [
      'Three of Pisano’s eight strongest source associations are a dictionary, a second dictionary and a baby-name site. The machine reads "Pisano" as an Italian surname, not a software company. Qualtrics and SurveyMonkey both have their own domain as their first source. Pisano’s own domain does not appear in its own list.',
      'A separate query for the bare term "Pisano" returned entertainment sites — TVLine, TV Insider, NBC, People — with 199 mentions attached to a television character.',
    ]),

    section('auditTableSection', {
      heading: 'And the site is reinforcing it',
      columns: ['Search term', 'Position', 'Monthly volume', 'Page earning it'],
      numericColumns: [1, 2],
      rows: [
        trow(['closing the loop', '2', '1,600', '/en/academy/what-is-closing-the-loop…']),
        trow(['loop closing', '4', '2,400', '/en/academy/what-is-closing-the-loop…']),
        trow(['enps', '8', '2,900', '/en/products/employee-experience…/enps']),
        trow(['meaning of pisano', '3', '720', '/en/academy/pisano-but-what-does-pisano-mean…'], true),
        trow(['pisano in italian', '3', '210', '/en/academy/pisano-but-what-does-pisano-mean…'], true),
        trow(['pisano definition', '2', '30', '/en/academy/pisano-but-what-does-pisano-mean…'], true),
        trow(['negative positive chart', '3', '480', '/en/knowledge-base/…/bar-chart-with…']),
        trow(['csat calculator', '5', '590', '/en/academy/calculate-your-csat-now']),
        trow(['sean ellis test', '2', '140', '/en/academy/sean-ellis-test…']),
      ],
      note:
        'pisano.com organic rankings, United States. Ahrefs and DataForSEO Labs, 17 September 2026. 106 ranked keywords in total.',
    }),

    finding('Own goal', [
      'One of the strongest-performing pages on the site is an Academy article explaining what the surname "Pisano" means in Italian. It ranks 3rd for "meaning of pisano" and 2nd for "pisano definition". Every crawler that reads it is being taught that Pisano is a word, not a vendor — which is exactly the association already suppressing the brand in AI answers.',
      'Not one of the 106 US ranked keywords is a commercial term. The strongest are a generic idiom, a chart-formatting question, and the surname.',
    ]),

    /* 04 ───────────────────────────────────────────────────────────── */
    section('auditTableSection', {
      heading: 'Search position against the peer set',
      intro:
        'The authority base is the second constraint. Pisano publishes more than most of this group and is found by almost none of the buyers.',
      columns: ['Vendor', '2026 Gartner MQ', 'DR', 'Organic keywords', 'Organic visits / mo', 'Referring domains'],
      numericColumns: [2, 3, 4, 5],
      rows: [
        trow(['Qualtrics', 'Leader', '91', '28,834', '544,248', '105,861']),
        trow(['Medallia', 'Leader', '84', '6,517', '114,458', '16,379']),
        trow(['Sprinklr', 'Leader', '83', '14,452', '246,545', '21,814']),
        trow(['QuestionPro', 'Niche', '84', '93,538', '954,682', '24,096']),
        trow(['NICE', '—', '81', '9,535', '116,626', '14,286']),
        trow(['Verint', 'Niche', '81', '3,152', '36,589', '9,383']),
        trow(['InMoment', '—', '76', '3,811', '32,260', '3,691']),
        trow(['SMG', 'Niche', '72', '1,015', '51,963', '4,584']),
        trow(['Pisano', 'Challenger', '52', '147', '919', '943'], true),
      ],
      note:
        'Ahrefs, all metrics pulled 17 September 2026, subdomains mode. Gartner position from the 2026 Magic Quadrant for VoC Platforms.',
    }),

    finding('The gap in one line', [
      'SMG is the smallest keyword footprint of the peer group at 1,015 terms. Pisano has 147 — and draws 919 organic visits a month against SMG’s 51,963. That is a 56-fold difference against the nearest comparable vendor, from a site carrying 1,870 published URLs.',
    ]),

    section('auditTableSection', {
      heading: 'Where Pisano sits on the terms that matter',
      columns: ['Commercial search term', 'Pisano', 'AI Overview', 'Who holds the top positions'],
      pillColumns: [1, 2],
      rows: [
        trow(['customer experience management platform', 'absent', 'yes', 'Qualtrics, Microsoft, Qualaroo']),
        trow(['voice of the customer software', 'absent', 'yes', 'Verint, Gartner, Salesforce']),
        trow(['voice of the customer platform', 'absent', 'yes', 'Gartner, Verint, Salesforce']),
        trow(['enterprise customer experience platform', 'absent', 'yes', 'Adobe, The CX Lead, RingCentral']),
        trow(['qualtrics alternatives', 'absent', 'yes', 'Survicate, Reddit, Qualaroo']),
        trow(['medallia alternatives', 'absent', 'yes', 'Gartner, Reddit, Capacity']),
        trow(['nps software', 'absent', 'yes', 'CustomerGauge, Qualtrics, Pendo']),
        trow(['employee experience platform', 'absent', 'yes', 'Unily, SelectSoftware, Microsoft']),
        trow(['customer feedback platform enterprise', 'absent', 'yes', 'Alchemer, ProProfs, Canny']),
        trow(['customer experience software for banks', 'absent', 'yes', 'Genesys, Quiq, Zendesk']),
        trow(['experience management platform', 'absent', 'yes', 'CallMiner, Famewall, Reddit']),
        trow(['customer journey mapping software', 'absent', 'yes', 'UXPressia, FullStory, Smaply']),
      ],
      note:
        'Google organic, United States desktop, top 100 checked per term. DataForSEO live SERP, 17 September 2026. "Absent" means not in the top 100 — not merely off page one.',
    }),

    /* 05 ───────────────────────────────────────────────────────────── */
    section('auditTableSection', {
      heading: 'The asset you already own and are not using',
      intro:
        'Pisano moved into the Challenger quadrant in the 2026 Gartner Magic Quadrant, published 9 March 2026. Six months later the site has not said so.',
      columns: ['Asset', 'Status', 'Detail'],
      pillColumns: [1],
      rows: [
        trow(['2024 Magic Quadrant page', 'live', '/en/pisano-is-recognised-in-the-2024-gartner-magic-quadrant']),
        trow(['2025 Magic Quadrant page', 'live', '/en/pisano-is-recognised-in-the-2025-gartner-magic-quadrant']),
        trow(['2026 Magic Quadrant page', 'none', 'No page in the sitemap; the guessed URL returns 404'], true),
        trow(['Main navigation, "Gartner Magic Quadrant Recognition"', '2025', 'Every visitor and crawler is sent to last year’s report']),
        trow(['Artwork "Gartner MQ 2025 & 2026 Comparison.png"', 'uploaded', 'Sitting in the HubSpot file library, on no page']),
      ],
      note: 'Live HTTP status checks against www.pisano.com and the published sitemap, 17 September 2026.',
    }),

    finding('Who is capturing it instead', [
      'Alchemer — the other Challenger in the same quadrant — published a 2026 Magic Quadrant explainer. So did Qualtrics, Revuze and CX Today. Those pages are now what answer engines read when a buyer asks who Gartner recognises. Pisano is in the report and absent from the conversation about it.',
    ]),

    /* 06 ───────────────────────────────────────────────────────────── */
    section('auditTableSection', {
      heading: 'Where answer engines get their shortlists',
      intro:
        'Across the 25 answers we captured, the models cited these domains. This is the map of third-party real estate that decides category shortlists — and it is where inclusion work should be aimed.',
      columns: ['Citations', 'Domain', 'What it is', 'Pisano present?'],
      numericColumns: [0],
      pillColumns: [3],
      rows: [
        trow(['26', 'enterpret.com', "A competing vendor's own blog", 'no']),
        trow(['15', 'pisano.com', "Pisano's own site", 'yes'], true),
        trow(['14', 'g2.com', 'Review marketplace', 'profile exists']),
        trow(['12', 'hellocustomer.com', 'Vendor comparison content', 'no']),
        trow(['9', 'en.wikipedia.org', 'Encyclopaedia', 'no company entry']),
        trow(['8', 'blog.hubspot.com', 'Category media', 'no']),
        trow(['8', 'getperspective.ai', 'Vendor listicles', 'no']),
        trow(['7', 'commsadvisor.com', 'Advisory / buyer guides', 'no']),
        trow(['7', 'onclarity.com', 'Vendor comparison content', 'no']),
        trow(['7', 'zonkafeedback.com', "A competing vendor's own blog", 'no']),
        trow(['6', 'gartner.com', 'Analyst', 'yes']),
        trow(['3', 'cxtoday.com', 'Category trade press', 'no']),
        trow(['3', 'renascence.io', 'CX consultancy analysis', 'no']),
      ],
      note: 'Domains cited across 25 ChatGPT answers with web search, 17 September 2026.',
    }),

    finding(
      'The encouraging half',
      [
        'pisano.com is the second most-cited domain in the set, with 15 citations. The content is readable, credible and already being used by the models. It is being pulled into answers about Pisano, and almost never into answers about the category. That is a solvable distribution problem, not a credibility problem.',
      ],
      'ok'
    ),

    /* 07 ───────────────────────────────────────────────────────────── */
    section('auditTableSection', {
      heading: 'Technical and retrieval readiness',
      intro:
        'A separate crawl of the live site: 157 live requests across the sitemap, the four locales and the two biggest content clusters. The headline is not the one we expected.',
      columns: ['Check', 'Result', 'What it costs'],
      pillColumns: [1],
      rows: [
        trow([
          'The knowledge base is published up to four times',
          '1,002 URLs',
          '53.6% of the whole sitemap sits in four parallel trees that never canonicalise to each other',
        ], true),
        trow([
          '/en/knowledge-base/knowledge-base/ vs /en/knowledge-base/',
          '204 of 238',
          'Identical slugs, both indexable, competing against each other',
        ]),
        trow([
          '/tr/en/knowledge-base/ vs /bilgi-bankasi/',
          '222 of 254',
          'The same Turkish articles, twice, on two unrelated hreflang graphs',
        ]),
        trow(['hreflang x-default', 'none', 'No fallback for a visitor Google cannot place, e.g. UK or Gulf']),
        trow(['Product or SoftwareApplication schema', 'none', 'Nothing tells an answer engine what the product is — 0 of 15 pages']),
        trow(['FAQPage schema on 716 knowledge pages', 'none', 'The most quotable content on the site carries no structured data at all']),
        trow(['llms.txt, llms-full.txt, ai.txt', '404', 'No machine-readable map of what the site offers AI crawlers']),
        trow(['GPTBot and ClaudeBot access', 'clean', 'Both get identical 200s to a browser. Nothing is blocked — this one is fine']),
        trow(['Homepage mobile LCP', '5.7s', "Against Google's 2.5s threshold. /platform on the same template does 2.0s"]),
        trow(['Thin knowledge-base articles', '4 of 6', 'Under 400 words in the sample; 0 of 12 pages carry an FAQ block']),
      ],
      note:
        'Live crawl of www.pisano.com, 157 requests, 17 September 2026. Sitemap health, canonicals and raw-HTML rendering all came back clean and are not listed.',
    }),

    finding('Why the content does not rank', [
      'This is the most likely direct cause of 1,870 published URLs producing 147 keywords. Google and the answer engines see hundreds of competing, near-identical Pisano pages for the same question and have to guess which one to rank or cite. Usually none of them wins clearly, and any authority one copy earns never reaches its siblings.',
    ]),

    /* 08 ───────────────────────────────────────────────────────────── */
    section('auditPlanSection', {
      heading: 'What we would do first',
      intro:
        'Ranked by the size of the gap each one closes against the effort it takes. The first three are cheap relative to what they unlock.',
      moves: [
        move(
          'Fix the entity before anything else',
          'Teach every machine that Pisano is a company, not a surname: structured data across the site, a claimed and consistent presence on the sources the models already trust, and a decision about the Academy article that currently ranks for "meaning of pisano". Nothing else compounds until this is true.',
          'Weeks 1–3'
        ),
        move(
          'Publish the 2026 Magic Quadrant, properly',
          'The single highest-value page not currently on the site. Repoint the navigation, publish the comparison artwork already sitting in the file library, and make it the page that answers "which vendors does Gartner recognise for VoC".',
          'Days'
        ),
        move(
          'Collapse the four knowledge bases into one',
          'Decide a single canonical tree per language, redirect the rest, and rebuild the template so every article has exactly one English and one Turkish home. This is 53.6% of the sitemap currently competing with itself.',
          'Weeks 1–4'
        ),
        move(
          'Build the commercial layer the site does not have',
          '1,870 URLs and not one commercial ranking. The Academy and Knowledge Base answer definitional questions; nothing answers the buying questions. Comparison, alternative, industry and region pages, written to be quoted by an answer engine.',
          'Weeks 2–10'
        ),
        move(
          'Get into the shortlists that already exist',
          'Thirteen domains write this category’s shortlists today and Pisano is on two of them. Inclusion work aimed at the specific pages in section 06, starting with the trade press and buyer guides that cite most often.',
          'Ongoing'
        ),
        move(
          'Measure it weekly, per engine',
          'A tracker is already live for Pisano: 40 buyer questions across seven decision stages, 19 competitors including all eleven other Magic Quadrant vendors. Share of answer becomes a number that moves, per engine, per question.',
          'Live now'
        ),
      ],
    }),

    section('auditMethodSection', {
      heading: 'Method and provenance',
      rows: [
        mrow('Buyer-question answers, 25 prompts', 'ChatGPT (GPT-4.1) with live web search, US vantage', '17 Sep 2026'),
        mrow('AI answer share and source associations', 'DataForSEO LLM Mentions, ChatGPT, en / US', '17 Sep 2026'),
        mrow('Authority, keywords, traffic, referring domains', 'Ahrefs v3 Site Explorer, subdomains mode', '17 Sep 2026'),
        mrow('Organic rankings and commercial SERP positions', 'DataForSEO live Google SERP, US desktop, top 100', '17 Sep 2026'),
        mrow('Gartner Magic Quadrant placement', 'Gartner MQ for VoC Platforms, published 9 Mar 2026', 'Verified 17 Sep 2026'),
        mrow('Site, sitemap, schema, hreflang and speed', 'Live crawl of www.pisano.com, 157 requests', '17 Sep 2026'),
      ],
      note:
        'Every figure in this report is a live reading taken on 17 September 2026. Nothing is estimated, modelled or carried over from a cached report. Raw payloads are retained and can be re-run on request.',
    }),
  ],
};

/* ── write ────────────────────────────────────────────────────────────── */

if (DRY_RUN) {
  console.log(JSON.stringify(doc, null, 2));
  console.log(`\n[dry run] would write to dataset "${DATASET}" on project ${PROJECT_ID}`);
  process.exit(0);
}

if (!TOKEN) {
  console.error('Missing SANITY_PROPOSALS_WRITE_TOKEN (or SANITY_API_TOKEN). See docs/PROPOSALS.md.');
  process.exit(1);
}

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
console.log('');
console.log('Send the link and the code in separate messages.');
