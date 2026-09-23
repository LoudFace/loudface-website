/**
 * Which page paths a Sanity document type touches.
 *
 * Shared by the Sanity webhook (`src/app/api/revalidate/route.ts`, on every
 * content change) and the inline editor's Sanity publish path
 * (`src/lib/inline-edit/sanity-store.ts`, right after a patch), so both agree
 * on what a `blogPost`, `caseStudy`, etc. actually renders onto.
 */
/**
 * The document types this site renders, and therefore the only ones the inline
 * editor may patch.
 *
 * Exactly the `case` labels of `pathsFor` below: a type that is not one of them
 * falls through to the homepage purge, which means nobody knows where it is
 * shown, so an editor clicking on the page is not what changed it. The test
 * `inline-edit-sanity.test.ts` fails if the two lists drift apart.
 */
export const EDITABLE_TYPES = new Set([
  'blogPost',
  'research',
  'caseStudy',
  'teamMember',
  'testimonial',
  'client',
  'blogFaq',
  'seoPage',
  'industry',
  'serviceCategory',
  'category',
  'technology',
]);

export function pathsFor(type: string | undefined, slug: string | undefined): string[] {
  // Always invalidate the LLM indexes — they aggregate all content.
  // /sitemap.xml is a no-store route handler; purging it is a no-op kept so the path list stays complete.
  const always = ['/llms.txt', '/llms-full.txt', '/sitemap.xml'];

  switch (type) {
    case 'blogPost':
      return [...always, '/', '/blog', slug ? `/blog/${slug}` : null].filter(Boolean) as string[];
    case 'research':
      return [...always, '/', '/research', slug ? `/research/${slug}` : null].filter(Boolean) as string[];
    case 'caseStudy':
      return [...always, '/', '/case-studies', slug ? `/case-studies/${slug}` : null].filter(Boolean) as string[];
    case 'teamMember':
      return [...always, '/about', slug ? `/team/${slug}` : null].filter(Boolean) as string[];
    case 'testimonial':
    case 'client':
    case 'blogFaq':
      return [...always, '/', '/about'];
    case 'seoPage':
    case 'industry':
      return [...always, '/', '/seo-for', slug ? `/seo-for/${slug}` : null].filter(Boolean) as string[];
    case 'serviceCategory':
      return [...always, '/', slug ? `/services/${slug}` : null].filter(Boolean) as string[];
    case 'category':
    case 'technology':
      return [...always, '/', '/blog', '/case-studies'];
    default:
      // Unknown type: fall back to a homepage purge — cheap, safe.
      return [...always, '/'];
  }
}
