import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { proposalSchemaTypes } from './src/sanity/schemas/proposal';

/**
 * Proposals Studio — a SECOND, separate Sanity workspace at /studio/proposals.
 *
 * Why it is separate from sanity.config.ts:
 *
 * 1. Different dataset. `production` is a PUBLIC dataset — anyone who knows the
 *    project ID can read every document in it. Proposal pricing must never sit
 *    there, so proposals live in the private `proposals` dataset instead.
 * 2. Different schema list. `proposal` is registered ONLY here. If it were in
 *    src/sanity/schemas/index.ts it would also appear in the production Studio,
 *    where one wrong click would write a client's pricing into the public
 *    dataset.
 *
 * Two single-workspace configs rather than one multi-workspace array: Sanity
 * matches a workspace by the FIRST basePath that matches the URL, so nesting
 * '/studio/proposals' under an existing '/studio' workspace would never
 * resolve. Next.js route specificity does the routing instead — the static
 * `proposals` segment wins over the sibling [[...tool]] catch-all.
 */
export default defineConfig({
  name: 'proposals',
  title: 'LoudFace Proposals',
  projectId: 'xjjjqhgt',
  dataset: 'proposals',
  basePath: '/studio/proposals',
  plugins: [structureTool()],
  schema: {
    types: proposalSchemaTypes,
  },
});
