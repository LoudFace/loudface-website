/**
 * Homepage — v11 (approved 2026-09-24 as /dev-preview/home-v11; switched 2026-09-26).
 *
 * Composed from src/app/home-v11/* inside the (site) group, so it keeps the shared header, consent and Cal chrome.
 * The copy is home-v11.json (getHomeV11Content), the charts come from getHomeV11Data. SEO metadata and the speakable
 * JSON-LD are unchanged from the v3 homepage. The v3 homepage ran the PostHog hero experiment
 * (homepage-hero-argument); the v11 homepage has one hero, so it no longer evaluates that flag.
 */
import type { Metadata } from 'next';
import '../home-v11/home-v11.css';
import { getHomeV11Content } from '@/lib/content-utils';
import { getHomeV11Data } from '../home-v11/data';
import { HeroV11 } from '../home-v11/HeroV11';
import { LogoGrid } from '../home-v11/LogoGrid';
import { Bento } from '../home-v11/Bento';
import { Results } from '../home-v11/Results';
import { Route } from '../home-v11/Route';
import { GrowthPlan } from '../home-v11/GrowthPlan';
import { Testimonials } from '../home-v11/Testimonials';
import { Team } from '../home-v11/Team';
import { Closing } from '../home-v11/Closing';
import { FooterV11 } from '../home-v11/FooterV11';
import { Reveal } from '../home-v11/Reveal';

export const metadata: Metadata = {
  title: 'AI-Native B2B SaaS Organic Growth Agency',
  description:
    'LoudFace gets B2B SaaS companies discovered across Google and AI search, then turns visibility into customers with GEO, SEO, AEO, content, and conversion.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI-Native B2B SaaS Organic Growth Agency | LoudFace',
    description:
      'LoudFace gets B2B SaaS companies discovered across Google and AI search, then turns visibility into customers with GEO, SEO, AEO, content, and conversion.',
    type: 'website',
    url: '/',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace - AI-Native B2B SaaS Organic Growth' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'AI-Native B2B SaaS Organic Growth Agency | LoudFace',
    description:
      'LoudFace gets B2B SaaS companies discovered across Google and AI search, then turns visibility into customers with GEO, SEO, AEO, content, and conversion.',
    images: ['/opengraph-image'],
  },
};

const speakableSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'LoudFace - AI-Native B2B SaaS Organic Growth Agency',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '[data-speakable]'],
  },
  url: 'https://www.loudface.co',
};

export default async function HomePage() {
  const [c, data] = await Promise.all([getHomeV11Content(), getHomeV11Data()]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      <div className="v11">
        <HeroV11 c={c.hero} data={data} />
        <LogoGrid c={c.logos} />
        <Bento c={c.bento} />
        <Results c={c.results} data={data} />
        <Route c={c.route} spark={data?.results.delshad ?? null} />
        <GrowthPlan c={c.plan} />
        <Testimonials c={c.testimonials} />
        <Team c={c.team} />
        <Closing c={c.closing} />
        <FooterV11 c={c.footer} ratings={c.testimonials.ratings} />
        <Reveal />
      </div>
    </>
  );
}
