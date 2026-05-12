import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool, defineLocations } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemas';

/**
 * Sanity Studio config — runs at /studio.
 *
 * Plugins:
 * - structureTool: the default document editor
 * - presentationTool: live, side-by-side preview pane with Visual Editing
 *   (click on text in the preview → jumps to that field in Studio)
 * - visionTool: GROQ playground
 *
 * Presentation requires:
 * - /api/draft-mode/enable (Next.js draft mode toggle) — defined in src/app/api/...
 * - SANITY_API_TOKEN env var (server-side, used to read drafts)
 * - <VisualEditing /> mounted in the (site)/layout.tsx
 */

// Where the live preview iframes from. Defaults to the canonical production
// domain so the preview self-references — Studio at www.loudface.co/studio
// iframes www.loudface.co content, same origin, no CORS edge cases.
//
// To preview against a Vercel preview deploy or localhost instead, set
// NEXT_PUBLIC_SITE_URL on that environment.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loudface.co';

export default defineConfig({
  name: 'loudface',
  title: 'LoudFace CMS',
  projectId: 'xjjjqhgt',
  dataset: 'production',
  basePath: '/studio',
  plugins: [
    structureTool(),
    presentationTool({
      previewUrl: {
        initial: SITE_URL,
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      // Maps each schema type to the URL(s) where its content appears on the
      // public site. Drives the "Open Locations" menu and lets editors jump
      // between documents in Presentation.
      resolve: {
        locations: {
          caseStudy: defineLocations({
            select: { name: 'name', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                {
                  title: (doc?.name as string) || 'Untitled case study',
                  href: `/case-studies/${doc?.slug}`,
                },
                { title: 'All case studies', href: `/case-studies` },
              ],
            }),
          }),
          blogPost: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                {
                  title: (doc?.title as string) || 'Untitled post',
                  href: `/blog/${doc?.slug}`,
                },
                { title: 'Blog index', href: `/blog` },
              ],
            }),
          }),
          teamMember: defineLocations({
            select: { name: 'name', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                {
                  title: (doc?.name as string) || 'Untitled team member',
                  href: `/team/${doc?.slug}`,
                },
              ],
            }),
          }),
        },
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
