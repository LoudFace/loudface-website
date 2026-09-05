import { notFound } from 'next/navigation';
import type { PortableTextBlock } from '@portabletext/types';
import { ProposalDocument } from '@/components/proposal/ProposalDocument';
import type { Proposal } from '@/sanity/lib/proposalsClient';

/**
 * TEMPORARY design fixture for the social-proof blocks. Dev only — it 404s in
 * any built deployment, and it is not meant to survive the design review.
 *
 * /preview-proof              sticky rail, light blocks
 * /preview-proof?tone=dark    sticky rail, dark blocks
 * /preview-proof?rail=off     no rail — blocks stacked in the scroll
 */

export const dynamic = 'force-dynamic';

function block(text: string, key: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
  } as unknown as PortableTextBlock;
}

function fixture(_tone: 'light' | 'dark', withRail: boolean): Proposal {
  return {
    title: 'Getting Jaris named when buyers ask AI',
    clientName: 'Jaris',
    preparedFor: ['Jenna Cheng', 'Matt Thomas'],
    token: 'preview',
    validUntil: '2026-10-04',
    status: 'sent',
    contactEmail: 'arnel@loudface.co',
    priceLine: '$5,000/mo flat. 3-month minimum, then month to month.',
    clipStrip: {
      heading: 'In their own words',
      clips: [
        { _key: 'rc1', videoUrl: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/b06b514be51d437bb81031a9f96cc6e5796767e6.mp4', posterUrl: 'https://cdn.sanity.io/images/xjjjqhgt/proposals/0ee26615f36fdce6a882a7399531da39d112e082-1280x720.jpg', name: 'Maksim', label: 'on the $1M landing page', duration: '1:35', orientation: 'landscape' },
        { _key: 'rc2', videoUrl: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/cbba2c1526479ce38d8dab811802738ae3a1659b.mp4', posterUrl: 'https://cdn.sanity.io/images/xjjjqhgt/proposals/37b5fefb3cc5f173eeda1ecf2c46f4c1ac897dec-1280x720.jpg', name: 'Dimer Health', label: 'on the 288% lift', duration: '0:29', orientation: 'landscape' },
        { _key: 'rc3', videoUrl: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/57697fa16e0d045b8ba0bc804bf9223cc6cb8788.mp4', posterUrl: 'https://cdn.sanity.io/images/xjjjqhgt/proposals/77afe46408ad550baae0f60eeba5a26f0bd7ea9b-1280x720.jpg', name: 'Daan · Brandfirm', label: 'on why they chose us', duration: '1:02', orientation: 'landscape' },
        { _key: 'rc4', videoUrl: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/f32240d1f970aead07a1da44be99062efeebd83c.mp4', posterUrl: 'https://cdn.sanity.io/images/xjjjqhgt/proposals/0ec5d86bc48b2dbef3ecb64e634868c38ef0dc8e-720x1280.jpg', name: 'Kasimir · Onne', label: 'on working together', duration: '0:27', orientation: 'portrait' },
        { _key: 'rc5', videoUrl: 'https://cdn.sanity.io/files/xjjjqhgt/proposals/77f7444f1da7ed7a221c1637d897a0f4ec3e87aa.mp4', posterUrl: 'https://cdn.sanity.io/images/xjjjqhgt/proposals/de273c76a554c38b859f28b548117f29b28d6022-1280x720.jpg', name: 'Elizabete · Reiterate', label: 'on the work', duration: '1:53', orientation: 'landscape' },
      ],
    },
    proofRail: withRail
      ? {
          heading: 'Reviewed on',
          platforms: [
            { _key: 'rp1', platform: 'clutch', rating: 5, reviewCount: 1, note: 'verified', url: 'https://clutch.co/profile/loudface' },
            { _key: 'rp2', platform: 'google', rating: 5, reviewCount: 4, url: 'https://share.google/YNQOFTomnSaSIlSgb' },
            { _key: 'rp3', platform: 'trustpilot', rating: 4.3, reviewCount: 9, note: 'every one 5 stars', url: 'https://www.trustpilot.com/review/loudface.co' },
          ],
          quotesHeading: 'What they said',
          quotes: [
            { _key: 'q1', text: 'One of the landing pages they designed has generated over $1M in sales so far.', author: 'Maksim Polupanov', platform: 'trustpilot' },
            { _key: 'q2', text: 'We really felt that they cared for our project as if it were their own.', author: 'Christian Mailind', platform: 'trustpilot' },
            { _key: 'q3', text: 'We began receiving leads immediately after the launch of our campaign.', author: 'Daan Smit', platform: 'trustpilot' },
            { _key: 'q4', text: 'From start to finish, the team exceeded expectations.', author: 'Sarig Reichert', company: 'Dimer Health', platform: 'trustpilot' },
            { _key: 'q5', text: 'Working with LoudFace has been refreshing; we were surprised by their passion.', author: 'E-learning platform, verified client', platform: 'clutch' },
            { _key: 'q6', text: 'I have not had a feature request that they were not able to deliver on.', author: 'Shin Kim', platform: 'trustpilot' },
            { _key: 'q7', text: 'LoudFace is nothing short of phenomenal.', author: 'Kristian Krogh Bang', platform: 'trustpilot' },
            { _key: 'q8', text: 'Professional, very helpful, communicated well, and met deadlines on time.', author: 'Christian', platform: 'trustpilot' },
          ],
        }
      : undefined,
    heroSummary: [
      block(
        'Your buyers ask ChatGPT which embedded lending platform to use, and Jaris is not in the answer. This is what we would do about it, what it costs, and what you get every month.',
        'hero'
      ),
    ],
    heroQuote:
      'If they are looking for embedded finance themselves, they are gonna start doing that research. And if we are not even popping up as an option, then obviously we are missing opportunities there.',
    heroQuoteBy: 'Matt Thomas, on our call, 2 September 2026',
    sections: [
      {
        _key: 'ask',
        _type: 'askAiSection',
        heading: 'What your buyers ask, and who gets named',
        intro: 'Each question asked 30 times across ChatGPT, Google AI Overview and Gemini.',
        questions: [
          { _key: 'aq1', question: 'Best embedded lending platforms for payment processors', short: 'Payment processors', vendors: [
            { _key: 'v1', name: 'Parafin', share: 90 }, { _key: 'v2', name: 'Kanmon', share: 67 }, { _key: 'v3', name: 'YouLend', share: 43 }, { _key: 'v4', name: 'Liberis', share: 37 }, { _key: 'v5', name: 'Lendflow', share: 23 }, { _key: 'v6', name: 'Jaris', share: 0 } ] },
          { _key: 'aq2', question: 'Top embedded working capital providers for US payment facilitators', short: 'Payment facilitators', vendors: [
            { _key: 'v1', name: 'Parafin', share: 100 }, { _key: 'v2', name: 'Kanmon', share: 73 }, { _key: 'v3', name: 'Liberis', share: 70 }, { _key: 'v4', name: 'YouLend', share: 60 }, { _key: 'v5', name: 'Jaris', share: 0 } ] },
          { _key: 'aq3', question: 'Best embedded capital providers for vertical SaaS platforms', short: 'Vertical SaaS', vendors: [
            { _key: 'v1', name: 'Parafin', share: 100 }, { _key: 'v2', name: 'Kanmon', share: 77 }, { _key: 'v3', name: 'Liberis', share: 57 }, { _key: 'v4', name: 'YouLend', share: 57 }, { _key: 'v5', name: 'Jaris', share: 0 } ] },
          { _key: 'aq4', question: 'Leading embedded finance companies for small business platforms', short: 'SMB platforms', vendors: [
            { _key: 'v1', name: 'Parafin', share: 62 }, { _key: 'v2', name: 'Kanmon', share: 38 }, { _key: 'v3', name: 'Liberis', share: 21 }, { _key: 'v4', name: 'YouLend', share: 14 }, { _key: 'v5', name: 'Jaris', share: 0 } ] },
          { _key: 'aq5', question: 'Which companies help ISOs offer working capital to merchants?', short: 'ISOs', vendors: [
            { _key: 'v1', name: 'Liberis', share: 17 }, { _key: 'v2', name: 'Fundbox', share: 7 }, { _key: 'v3', name: 'Lendio', share: 7 }, { _key: 'v4', name: 'YouLend', share: 7 }, { _key: 'v5', name: 'Parafin', share: 3 }, { _key: 'v6', name: 'Jaris', share: 0 } ] },
        ],
        source: 'Peec AI · 2,250 answers · 26 Aug to 2 Sep 2026 · US.',
      },
      {
        _key: 'standing',
        _type: 'standingSection',
        heading: 'Where Jaris stands, and why',
        stats: [
          { _key: 's1', value: '2.0%', label: 'of AI answers name Jaris. Parafin: 26.7%', lead: true },
          { _key: 's2', value: '64 / 75', label: 'buyer questions with no Jaris' },
          { _key: 's3', value: '2.9', label: 'average position when Jaris is named', lead: true },
        ],
        closing: 'The product is not the problem: when an assistant names Jaris it names it before Kanmon, Liberis and YouLend. Product pages are the most cited page type in this category, 1,060 times, and Jaris has one overview page covering five products.',
        source: 'Peec AI citation counts · 2 Sep 2026.',
      },
      {
        _key: 'forecast',
        _type: 'forecastSection',
        heading: 'What each month returns',
        todayLine: 'Today it is zero.',
        shareOfVoice: { min: 2, max: 20, value: 12, note: 'now 2.5%' },
        impressions: { min: 0, max: 30000, step: 1000, value: 15000, note: 'now ~500' },
        conversion: { min: 0.5, max: 5, step: 0.1, value: 2 },
        assumptions: { aiQuestionsPerMonth: 2000, aiClickRate: 10, googleCtr: 2.5, ramp: [0.1, 0.35, 0.7, 1, 1, 1] },
      },
      {
        _key: 'tracks',
        _type: 'tracksSection',
        heading: 'What you get',
        intro: 'Three tracks in parallel from week one. Content, design, development and reporting included.',
        tracks: [
          { _key: 't1', label: 'On your site', items: [
            { _key: 'i1', count: '5', text: 'Product pages, one for each product' },
            { _key: 'i2', count: '3', text: 'Solution pages: ISOs, payment service providers, vertical SaaS' },
            { _key: 'i3', count: '1–2 a day', text: 'Articles from your own material: underwriting, settlement mechanics, the bank programme' },
            { _key: 'i4', count: 'Month 3', text: 'Comparison and alternatives pages' } ] },
          { _key: 't2', label: 'Off your site', items: [
            { _key: 'i1', count: '2–3 a week', text: 'Placements on the pages these answers are built from' },
            { _key: 'i2', text: 'Category listicles first, then directories and comparison pages' } ] },
          { _key: 't3', label: 'Your website', items: [
            { _key: 'i1', count: 'Month 1', text: 'Rebuilt on a modern stack with the pages above, keys handed to you' },
            { _key: 'i2', count: 'Week 1', text: 'Canonical tags, the duplicate domain, sitemap, H1s and schema' } ] },
        ],
        targetsLabel: 'We start with the six most-cited pages in the category',
        targets: ['openbankingtracker', 'Lendflow', 'Built In', 'Stripe', 'fintechspecs', 'Backbase'],
        // the six most-cited pages in the category, from the report
      },
      {
        _key: 'engagement',
        _type: 'timelineSection',
        variant: 'engagementLoop',
        heading: 'How we work',
        gateLabel: 'Compliance gate',
        gate: {
          body: 'Anything touching rates, loan terms, the bank relationship, FDIC or NMLS language comes to Jaris before it publishes. Permanently.',
          items: [
            'The first five articles are written and reviewed with you, to lock voice and claims.',
            'Everything else publishes independently, so volume does not sit on your calendar.',
          ],
        },
        showWeek: true,
        items: [],
      },
      {
        _key: 'months',
        _type: 'monthsSection',
        heading: 'The first 90 days',
        intro: 'Contractual minimums. We ship above them.',
        months: [
          { _key: 'm1', label: 'Month 1', title: '', items: ['Technical fixes', 'New website live', '5 product pages', '5 calibration articles'], proves: 'One domain, pages cited' },
          { _key: 'm2', label: 'Month 2', title: '', items: ['20+ articles', '3 solution pages', '8–12 placements'], proves: 'AI share of voice moves' },
          { _key: 'm3', label: 'Month 3', title: '', items: ['20+ articles', 'Comparison pages', '8–12 placements'], proves: 'First leads attributed' },
        ],
        measuresLabel: 'On your dashboard every morning',
        measures: [
          { _key: 'me1', label: 'leads booked' },
          { _key: 'me2', label: 'AI share of voice' },
          { _key: 'me3', label: 'sentiment' },
          { _key: 'me4', label: 'Google impressions and clicks' },
        ],
      },
      {
        _key: 'cases',
        _type: 'caseProofSection',
        heading: 'The same work, at four other companies',
        slugs: ['delshad-legal-content-engine', 'genie-teacher-organic-growth', 'toku-ai-cited-pipeline', 'trademomentum-niche-aeo-organic-growth'],
        chartsPerCase: 1,
      },
      {
        _key: 'price',
        _type: 'pricingTiersSection',
        band: 'dark',
        heading: 'Investment',
        anchor: '\u201cEmbedded lending platform\u201d costs $56.28 a click on Google. $5,000 buys 89 clicks. The same money here buys the pages, the placements and the site.',
        tiers: [
          { _key: 't1', name: 'Accelerate', price: '$15,000', cadence: 'per month', description: 'Triple velocity and dedicated outreach.' },
          { _key: 't2', name: 'Scale', price: '$10,000', cadence: 'per month', description: 'Double the content and outreach velocity.' },
          { _key: 't3', name: 'Growth', price: '$5,000', cadence: 'per month', description: '1–2 articles a day, 2–3 placements a week, website build included, full reporting.', recommended: true },
        ],
        note: 'For $5,000 you get the whole team. Anything beyond this at your stage is redundant. 3-month minimum, then month to month. No setup fee.',
      },
      {
        _key: 'terms',
        _type: 'bulletListSection',
        band: 'dark',
        heading: 'Terms and next step',
        items: [
          { _key: 'tm1', lead: 'You own everything.', text: 'Website, content, CMS, tracking. If we stop after three months you keep all of it and we train your team on it.' },
          { _key: 'tm2', lead: 'MSA plus a short order form', text: 'covering scope and the agreed monthly lead target.' },
          { _key: 'tm3', lead: 'Kickoff within 48 hours', text: 'of signature. Technical fixes and the first content start in week one.' },
          { _key: 'tm4', lead: 'Next step:', text: 'agree the lead target, sign, and we start that week.' },
        ],
      },
    ],
  };
}

export default async function PreviewProofPage({
  searchParams,
}: {
  searchParams: Promise<{ tone?: string; rail?: string; clips?: string }>;
}) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const { tone, rail, clips } = await searchParams;
  return (
    <ProposalDocument
      proposal={fixture(tone === 'dark' ? 'dark' : 'light', rail !== 'off')}
      clipsVariant={clips === 'grid' ? 'grid' : 'strip'}
    />
  );
}
