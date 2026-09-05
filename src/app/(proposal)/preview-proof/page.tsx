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

function fixture(tone: 'light' | 'dark', withRail: boolean): Proposal {
  return {
    title: 'Getting Jaris named when buyers ask AI',
    clientName: 'Jaris',
    preparedFor: ['Jenna Cheng', 'Matt Thomas'],
    token: 'preview',
    validUntil: '2026-10-04',
    status: 'sent',
    contactEmail: 'arnel@loudface.co',
    priceLine: '$10,000/mo. 3-month minimum, then month to month.',
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
            { _key: 'q5', text: 'Working with LoudFace has been refreshing; we were surprised by their passion.', author: 'Verified review', platform: 'clutch' },
            { _key: 'q6', text: 'I have not had a feature request that they were not able to deliver on.', author: 'Shin Kim', platform: 'trustpilot' },
            { _key: 'q7', text: 'LoudFace is nothing short of phenomenal.', author: 'Kristian Krogh Bang', platform: 'trustpilot' },
            { _key: 'q8', text: 'Professional, very helpful, communicated well, and met deadlines on time.', author: 'Christian', platform: 'trustpilot' },
          ],
        }
      : undefined,
    heroSummary: [
      block(
        'Your buyers ask ChatGPT which embedded lending platform to use, and Jaris is not in the answer. This is what we would do about it, what it costs, and what you get in the first 90 days.',
        'hero'
      ),
    ],
    sections: [
      {
        _key: 'where',
        _type: 'richTextSection',
        heading: 'Where you are',
        body: [
          block(
            'Across 75 buying questions your competitors get named in, Jaris appears in almost none. Parafin and Kanmon are answering the questions your customers are actually asking.',
            'w1'
          ),
          block(
            'The pages exist. They are not written in a way an answer engine can quote, and nothing links them together.',
            'w2'
          ),
        ],
      },
      {
        _key: 'engagement',
        _type: 'timelineSection',
        variant: 'engagementLoop',
        heading: 'How the engagement moves',
        intro: 'We read the data, set the priority and take the work through to launch. What we learn sets the next priority. Jaris reviews the calibration articles in the first two weeks; after that, reviews are optional.',
        items: [
          { _key: 'e1', label: 'Data reveals the opportunity', body: 'We examine buyer questions, site performance and conversion data.' },
          { _key: 'e2', label: 'LoudFace sets the priority', body: 'We decide the next move and show the evidence behind it.' },
          { _key: 'e3', label: 'Jaris reviews the calibration articles', body: 'A review gate in the first two weeks. Ongoing review after that only if you insist; we do not recommend it.' },
          { _key: 'e4', label: 'LoudFace executes in parallel', body: 'Content, design and development move together around the same priority.', kind: 'execution' },
          { _key: 'e5', label: 'Results set the next priority', body: 'We own the results, so we own the workflow that produces them.' },
        ],
        illustrativeExample: {
          label: 'Illustrative example',
          goal: 'Help buyers understand the product',
          workstreams: [
            { _key: 'ws1', label: 'Content', body: 'Clarify the product story' },
            { _key: 'ws2', label: 'Design', body: 'Show the product clearly' },
            { _key: 'ws3', label: 'Development', body: 'Build the improved page' },
          ],
          outcome: 'Launch and measure',
          returnLabel: 'The response informs the next priority.',
        },
      },
      {
        _key: 'working',
        _type: 'bulletListSection',
        variant: 'workingTogether',
        heading: 'What working together looks like',
        intro: 'LoudFace owns the strategy, work, measurement and updates. Jaris keeps control of major decisions and owns the output.',
        items: [
          { _key: 'wt1', lead: 'Calibration', text: 'We use the first articles to align on voice and claims. Fintech context, research and review guide the work.' },
          { _key: 'wt2', lead: 'Progress', text: 'You receive short updates daily or every other day, so you always know what is moving.' },
          { _key: 'wt3', lead: 'Friday review', text: 'We share the week’s activity and results, with the next decisions made clear.' },
          { _key: 'wt4', lead: 'Live reporting', text: 'The dashboard refreshes each morning, so you can see the current picture without waiting for a meeting.' },
          { _key: 'wt5', lead: 'Check-ins', text: 'We can meet weekly, every two weeks or monthly, based on what helps the work move.' },
        ],
      },
      {
        _key: 'metrics',
        _type: 'metricsSection',
        heading: 'What this work has produced',
        tone,
        intro: 'Three clients, three different problems. Every number below has a source next to it.',
        metrics: [
          {
            _key: 'm1',
            value: '288%',
            label: 'increase in conversion after we rebuilt the booking flow',
            source: 'Dimer Health, client-reported on camera',
          },
          {
            _key: 'm2',
            value: '$1M+',
            label: 'in sales from a single landing page we designed',
            source: 'Trustpilot review, Maksim Polupanov, Nov 2024',
          },
          {
            _key: 'm3',
            value: '3.2x',
            label: 'organic clicks in the first three months on a new site',
            source: 'Google Search Console, 29 Aug 2026',
          },
        ],
      },
      {
        _key: 'cases',
        _type: 'caseProofSection',
        heading: 'The same work, at three other companies',
        intro: 'Live numbers from the public case studies. Click through for the full write-up.',
        slugs: [
          'toku-ai-cited-pipeline',
          'trademomentum-niche-aeo-organic-growth',
          'genie-teacher-organic-growth',
        ],
        chartsPerCase: 1,
      },
      {
        _key: 'price',
        _type: 'pricingTiersSection',
        heading: 'Investment',
        tiers: [
          { _key: 't1', name: 'Growth', price: '$5,000', cadence: 'per month', description: 'A focused pace around the highest-priority work.' },
          { _key: 't2', name: 'Scale', price: '$10,000', cadence: 'per month', description: 'More room to move connected priorities in parallel. What we recommend for Jaris.', recommended: true },
          { _key: 't3', name: 'Accelerate', price: '$15,000', cadence: 'per month', description: 'For a wider range of work at a faster pace.' },
        ],
        note: '3-month minimum, then month to month.',
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
