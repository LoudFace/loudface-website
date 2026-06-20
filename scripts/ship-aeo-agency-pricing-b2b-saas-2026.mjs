#!/usr/bin/env node
import { createClient } from '@sanity/client';
import fs from 'fs';

const client = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const slug = 'aeo-agency-pricing-b2b-saas-2026';
const content = fs.readFileSync('/tmp/ship-aeo-agency-pricing-b2b-saas-2026.html', 'utf8');

const faq = [
  {
    _key: 'faq1',
    question: 'Is AEO more expensive than traditional SEO?',
    answer: 'About the same range, different deliverables. A traditional SEO retainer at $5-15K/mo buys you keyword research, content briefs, link earning, and rank tracking. AEO at the same range adds entity optimization, schema work, citation tracking across 4-6 AI engines, and Share of Answer measurement on tracked buyer prompts. The hourly cost is similar; the outputs are different surfaces. For B2B SaaS in 2026, the AEO surface is where buyers actually are.',
  },
  {
    _key: 'faq2',
    question: 'Is an $8-18K/mo AEO retainer worth it for a Series A SaaS?',
    answer: "If your category has buyers using ChatGPT, Perplexity, or Google AIO during research — yes. If you're a Series A with $1M-$5M ARR and ~$3K-$5K paid CAC, an $8K/mo Dual Autopilot retainer pays for itself in 16-32 attributed meetings over 12 months. The risk isn't the retainer cost. The risk is your competitors signing first and compounding citations you'll spend 12 months chasing.",
  },
  {
    _key: 'faq3',
    question: 'Does pricing include digital PR or link building?',
    answer: "No, and that's intentional. AEO citations are driven by entity authority and structured content. Link volume isn't the lever. Most of our clients don't need PR work in year 1. If you want active digital PR added (mention seeding, founder PR, podcast bookings), that's $3-8K/mo on top of the retainer. We have partner agencies we recommend; we don't run PR ourselves.",
  },
  {
    _key: 'faq4',
    question: "What's the typical payback period?",
    answer: '3-5 months for Dual Autopilot clients (Series A-B SaaS, $5-15K ACV). Solo Autopilot ($5K/mo) payback in 4-6 months. Scale Autopilot payback varies by scope; multi-vertical builds typically pay back in 6-9 months because the content velocity required for full coverage takes longer to compound.',
  },
  {
    _key: 'faq5',
    question: 'Are there setup fees?',
    answer: "No. We've never charged a setup fee. Month 1 of any retainer includes audit, baseline measurement, and foundation work, all inside the monthly rate. If you see agencies charging $5-12K to start, that's a category-wide markup that's losing relevance as more agencies (us, Discovered Labs, a handful of others) publish flat retainer pricing.",
  },
  {
    _key: 'faq6',
    question: 'How fast do AI citations appear after engagement starts?',
    answer: 'First citations typically appear 60-90 days after work begins, on prompts where you had partial topical coverage already. Meaningful citation share (20-40% on core prompts) lands by month 3-4. Sustained citation dominance (50-80%) is a 6-12 month outcome.',
  },
  {
    _key: 'faq7',
    question: 'Can I get real AEO done for under $5K/mo?',
    answer: 'Honestly, no. Not in a way that pays back. Anything below $5K/mo is either a single-channel tactical play (one writer, no measurement) or freelance work without the infrastructure to track Share of Answer at scale. Freelance AEO specialists charge $150-$300/hour and run 10-20 hours/month; that gets you single-prompt coverage. Category presence is out of reach. If you have a $1-3K/mo budget, do DIY with a couple of well-briefed articles a month. Past that, agency math works better.',
  },
  {
    _key: 'faq8',
    question: "What's the difference between AEO agency pricing and SEO agency pricing?",
    answer: 'Same retainer ranges. Different reporting, different surfaces. SEO agencies report rank and traffic. AEO agencies report citation rate, Share of Answer, and engine-by-engine visibility across ChatGPT, Perplexity, Claude, and Google AI Overviews. If you ask an SEO agency "what\'s our citation rate in Perplexity?" and they don\'t have an answer, you\'re paying SEO money for SEO outputs in an AI-first buying market.',
  },
];

const doc = {
  _id: `blogPost-${slug}`,
  _type: 'blogPost',
  name: 'AEO Agency Pricing for B2B SaaS in 2026: What $8K-$18K/mo Actually Buys You',
  slug: { _type: 'slug', current: slug },
  metaTitle: 'AEO Agency Pricing for B2B SaaS in 2026: $8K-$18K/mo Tier Breakdown',
  metaDescription:
    'Real AEO agency pricing for B2B SaaS in 2026: $8K-$18K/mo tier breakdown, ROI math, 4-month payback timeline, and what actually drives cost.',
  excerpt:
    "LoudFace's AEO retainers for B2B SaaS run $5K-$18K/month, no setup fees. Here's what each tier includes, what drives cost up or down, and the 4-month payback math.",
  content,
  faq,
  category: { _type: 'reference', _ref: 'imported-category-67bced3103339308260cf6a1' },
  author: { _type: 'reference', _ref: 'imported-teamMember-68d81a1688d5ed0743d0b8b6' },
  publishedDate: '2026-05-20',
  lastUpdated: '2026-05-20',
  featured: false,
  timeToRead: '15 min read',
};

const result = await client.createOrReplace(doc);
console.log('Shipped:', result._id, result._rev);
