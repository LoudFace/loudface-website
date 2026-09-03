/**
 * Structured data for /methodology: Article + FAQPage, plus BreadcrumbList and
 * Speakable, emitted the way the rest of the site already does it.
 *
 * The FAQPage is built from METHODOLOGY_FAQ through the shared
 * `buildFAQSchema()` helper in src/lib/schema-utils.ts, so the accordion and the
 * schema read from ONE array and can never drift. Nothing here re-implements a
 * schema shape the library already owns.
 */
import {
  buildArticleAuthorSchema,
  buildFAQSchema,
  buildOrganizationPublisher,
  buildSpeakableSchema,
} from '@/lib/schema-utils';
import { METHODOLOGY_FAQ, PAGE, SHORT_ANSWER } from './data';

const SITE = 'https://www.loudface.co';
const URL = `${SITE}/methodology`;

/** Date the copy was approved. Bump only when the approved body actually changes. */
const PUBLISHED = '2026-09-02';

export function buildMethodologyJsonLd(): object[] {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: PAGE.h1,
    description: SHORT_ANSWER.body,
    url: URL,
    mainEntityOfPage: { '@type': 'WebPage', '@id': URL },
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    inLanguage: 'en',
    author: buildArticleAuthorSchema(null),
    publisher: buildOrganizationPublisher(),
    about: {
      '@type': 'Thing',
      name: 'Generative engine optimization',
    },
    audience: { '@type': 'Audience', audienceType: 'B2B SaaS companies' },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Methodology' },
    ],
  };

  const faq = buildFAQSchema(
    METHODOLOGY_FAQ.map((f) => ({ question: f.q, answer: f.a })),
  );

  const speakable = buildSpeakableSchema(PAGE.h1, URL);

  return faq ? [article, breadcrumb, faq, speakable] : [article, breadcrumb, speakable];
}
