import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = (path) => readFileSync(resolve(root, path), 'utf8');
const errors = [];

const masters = [
  'src/app/layout.tsx',
  'src/app/(site)/page.tsx',
  'src/app/opengraph-image.tsx',
  'src/app/home-v3/HeroV3.tsx',
  'src/app/home-v3/WhatWeDo.tsx',
  'src/app/home-v3/ProcessSteps.tsx',
  'src/app/home-v3/FaqSection.tsx',
  'src/app/(site)/about/page.tsx',
  'src/app/about-v3/HeroAbout.tsx',
  'src/app/about-v3/Story.tsx',
  'src/app/about-v3/Faq.tsx',
  'src/app/(site)/services/page.tsx',
  'src/app/services-v3/data.ts',
  'src/app/service-v3/ServicePageV3.tsx',
  'src/app/seo-for-v3/SeoForPageV3.tsx',
  'src/app/service-v3/data.tsx',
  'src/app/pricing-v3/Tracks.tsx',
  'src/app/pricing-v3/data.ts',
  'src/app/(site)/blog/page.tsx',
  'src/data/content/nav.json',
  'src/app/(site)/ai-instructions/page.tsx',
  'src/app/(site)/careers/page.tsx',
  'src/app/(site)/team/[slug]/page.tsx',
];

const content = new Map(masters.map((path) => [path, source(path)]));
const navigation = JSON.parse(content.get('src/data/content/nav.json'));
const requireText = (path, text) => {
  if (!content.get(path)?.includes(text)) errors.push(`${path}: missing ${JSON.stringify(text)}`);
};
const requireOrder = (path, first, second) => {
  const text = content.get(path) ?? '';
  if (text.indexOf(first) === -1 || text.indexOf(second) === -1 || text.indexOf(first) > text.indexOf(second)) {
    errors.push(`${path}: ${JSON.stringify(first)} must appear before ${JSON.stringify(second)}`);
  }
};
const requireOrderInBlock = (path, start, end, first, second) => {
  const text = content.get(path) ?? '';
  const block = text.slice(text.indexOf(start), text.indexOf(end, text.indexOf(start)));
  if (block.indexOf(first) === -1 || block.indexOf(second) === -1 || block.indexOf(first) > block.indexOf(second)) {
    errors.push(`${path}: ${JSON.stringify(first)} must appear before ${JSON.stringify(second)} in ${start}`);
  }
};
const requireUnique = (label, values) => {
  const duplicates = [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
  for (const duplicate of duplicates) errors.push(`${label}: duplicate ${JSON.stringify(duplicate)}`);
};

requireText('src/app/layout.tsx', 'AI-Native B2B SaaS Organic Growth Agency');
requireText('src/app/layout.tsx', 'GEO, SEO, AEO, content, and conversion');
requireText('src/app/(site)/page.tsx', 'AI-Native B2B SaaS Organic Growth Agency');
requireText('src/app/home-v3/HeroV3.tsx', 'LoudFace is an AI-native B2B SaaS organic growth agency.');
requireText('src/app/(site)/ai-instructions/page.tsx', 'LoudFace is an AI-native B2B SaaS organic growth agency.');
requireText('src/app/(site)/services/page.tsx', 'GEO, SEO, AEO, content, and conversion');

for (const [path, text] of content) {
  for (const forbidden of [
    'B2B SaaS web design, SEO, AEO, and growth agency',
    'Webflow Enterprise Partners with 200+ projects delivered',
    'Everything you need to design, build, and grow in Webflow',
    'our primary platform',
    'Most of our clients start with a build',
    'Most of our clients do.',
    'B2B SaaS Websites That Convert',
  ]) {
    if (text.includes(forbidden)) errors.push(`${path}: stale identity phrase ${JSON.stringify(forbidden)}`);
  }
}

const siteLayout = source('src/app/(site)/layout.tsx');
if (siteLayout.includes('Enterprise-Blue-Badge.webp') || siteLayout.includes('fixed bottom-6 right-6')) {
  errors.push('src/app/(site)/layout.tsx: global floating Webflow badge still exists');
}

for (const topic of [
  '"Generative Engine Optimization"',
  '"SEO"',
  '"Answer Engine Optimization"',
  '"Content Strategy"',
  '"Conversion Rate Optimization"',
]) {
  requireOrderInBlock('src/app/layout.tsx', 'knowsAbout: [', 'founder:', topic, '"Webflow Development"');
}
for (const service of [
  'name: "Generative Engine Optimization"',
  'name: "SEO & AEO"',
  'name: "Organic Growth Program"',
  'name: "Conversion Rate Optimization"',
  'name: "Copywriting"',
]) {
  requireOrderInBlock('src/app/layout.tsx', 'itemListElement: [', '],\n  },\n};', service, 'name: "Webflow Development"');
}
requireOrderInBlock('src/app/(site)/ai-instructions/page.tsx', 'knowsAbout: [', 'areaServed:', "'Generative Engine Optimization'", "'Webflow Development'");
for (const slug of ["slug: 'geo-agency'", "slug: 'seo-aeo'", "slug: 'organic-growth'", "slug: 'cro'", "slug: 'copywriting'"]) {
  requireOrder('src/app/services-v3/data.ts', slug, "slug: 'webflow'");
}
requireOrder('src/data/content/nav.json', '"title": "SEO/AEO"', '"title": "Webflow Development"');

const serviceData = source('src/app/services-v3/data.ts');
const serviceRoutes = [...serviceData.matchAll(/slug: '([^']+)'/g)].map((match) => match[1]);
requireUnique('src/app/services-v3/data.ts service routes', serviceRoutes);

const rootLayout = source('src/app/layout.tsx');
const offerCatalog = rootLayout.slice(rootLayout.indexOf('hasOfferCatalog:'), rootLayout.indexOf('\n  },\n};', rootLayout.indexOf('hasOfferCatalog:')));
const offerNames = [...offerCatalog.matchAll(/itemOffered: \{ "@type": "Service", name: "([^"]+)" \}/g)].map((match) => match[1]);
requireUnique('src/app/layout.tsx Organization OfferCatalog names', offerNames);

const aiInstructions = source('src/app/(site)/ai-instructions/page.tsx');
const aiKnowsAbout = aiInstructions.slice(aiInstructions.indexOf('knowsAbout: ['), aiInstructions.indexOf('areaServed:', aiInstructions.indexOf('knowsAbout: [')));
const aiKnowsAboutValues = [...aiKnowsAbout.matchAll(/'([^']+)'/g)].map((match) => match[1]);
requireUnique('src/app/(site)/ai-instructions/page.tsx knowsAbout values', aiKnowsAboutValues);

const navTitles = navigation.dropdowns.services.items.map((item) => item.title);
for (const title of [
  'Generative Engine Optimization',
  'SEO/AEO',
  'Organic Growth Program',
  'CRO',
  'Copywriting',
  'Growth Autopilot',
  'UX/UI Design',
  'Webflow Development',
]) {
  if (!navTitles.includes(title)) errors.push(`src/data/content/nav.json: missing ${title} service`);
}

for (const title of ['Generative Engine Optimization', 'SEO/AEO', 'Organic Growth Program', 'CRO', 'Copywriting', 'Growth Autopilot']) {
  if (navTitles.indexOf(title) > navTitles.indexOf('Webflow Development')) {
    errors.push(`src/data/content/nav.json: ${title} must appear before Webflow Development`);
  }
}

if (errors.length > 0) {
  console.error('Positioning contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Positioning contract passed.');
