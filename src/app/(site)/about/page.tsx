/**
 * About — v11 (the approved board; switched 2026-09-26).
 *
 * Composed from src/app/about-v11 inside the (site) group. Copy in about-v11.json; the charts come from
 * getHomeV11Data. The team list for the AboutPage JSON-LD still comes live from Sanity (getAboutTeam), and the
 * FAQPage JSON-LD is built from the FAQ this page shows (about-v11.json, read unmarked through rawContent).
 * SEO metadata and the other JSON-LD blocks are unchanged from the v3 page.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/cro-sections.css';
import '../../service-v11/svc.css';
import '../../about-v11/about.css';
import { getAboutV11Content, getHomeV11Content, rawContent, type AboutV11Content } from '@/lib/content-utils';
import { getAboutTeam } from '../../about-v3/data';
import { getHomeV11Data } from '../../home-v11/data';
import { AboutV11 } from '../../about-v11/AboutV11';
import { teamTitle } from '@/lib/team-titles';

// Plain text for JSON-LD: the answers are plain today; this keeps the schema clean if one gains markup.
const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const metadata: Metadata = {
  // No pipe + brand suffix here: the (site) layout's title template ("%s | LoudFace")
  // already appends " | LoudFace" — adding it again would double up the brand name.
  title: 'About LoudFace — AI-Native B2B SaaS Organic Growth',
  description:
    'Meet the AI-native B2B SaaS organic growth agency that gets companies discovered across Google and AI search, then turns visibility into customers.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About LoudFace | AI-Native B2B SaaS Organic Growth',
    description:
      'Meet the AI-native B2B SaaS organic growth agency that runs GEO, SEO, AEO, content, and conversion across client stacks.',
    type: 'website',
    url: '/about',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'About LoudFace' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'About LoudFace | AI-Native B2B SaaS Organic Growth',
    description:
      'Meet the AI-native B2B SaaS organic growth agency that runs GEO, SEO, AEO, content, and conversion across client stacks.',
    images: ['/opengraph-image'],
  },
};

export default async function AboutPage() {
  const [team, c, home, data] = await Promise.all([getAboutTeam(), getAboutV11Content(), getHomeV11Content(), getHomeV11Data()]);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'About' },
    ],
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'About LoudFace',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: 'https://www.loudface.co/about',
  };

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About LoudFace',
    description:
      'Meet LoudFace, an AI-native B2B SaaS organic growth agency that gets companies discovered across Google and AI search, then turns visibility into customers.',
    url: 'https://www.loudface.co/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
      description:
        'AI-native B2B SaaS organic growth agency. GEO, SEO, AEO, content, and conversion lead the work. Webflow and other stacks support the program.',
      foundingDate: '2019',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dubai',
        addressCountry: 'AE',
      },
      ...(team.length > 0 && {
        employee: team.map((member) => ({
          '@type': 'Person',
          name: member.name,
          jobTitle: teamTitle(member.slug, member.role) || undefined,
        })),
      }),
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rawContent<AboutV11Content>('about-v11').faq.items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.answer) },
    })),
  };

  return (
    <>
      {[breadcrumbSchema, aboutSchema, speakableSchema, faqSchema].map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <AboutV11 c={c} home={home} data={data} />
    </>
  );
}
