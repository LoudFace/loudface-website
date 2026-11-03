/**
 * GROQ filter for every blog read that lists or renders posts: leaves out a post whose slug a published research
 * paper names in `movedFromBlog` (the 12 studies moved to /research on 3 Nov 2026). The blogPost documents stay in
 * Sanity; next.config.ts redirects /blog/<slug> to /research/<slug>, and with this filter the blog index, the
 * homepage strip, related posts, the footer, the sitemap, llms.txt and the Markdown copies stop listing them, and
 * /blog/<slug> answers 404 if the redirect is ever bypassed.
 *
 * Its own file, with no imports, because src/lib/llms-utils.ts (loaded by src/proxy.ts) needs it as well as
 * src/lib/cms-data.ts, and the proxy must not pull in the CMS read layer.
 *
 * The drafts guard matters only to a `raw` client (scripts): the site's clients read `published`, where an
 * unpublished paper is not visible and so does not hide its post yet. Blog reads that use it also carry the
 * research cache tag, so publishing a paper purges the blog lists.
 */
export const BLOG_NOT_MOVED_TO_RESEARCH =
  '!(slug.current in *[_type == "research" && defined(movedFromBlog) && !(_id in path("drafts.**"))].movedFromBlog)';
