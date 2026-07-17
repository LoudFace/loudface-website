import type { StructureResolver } from 'sanity/structure';

/**
 * Custom desk structure — groups the 12 document types into three
 * sensible buckets instead of the flat default list.
 *
 * Keep in sync with src/sanity/schemas/index.ts. If a new schema type is
 * added there and not placed in a group below, add it to GROUPED_TYPES
 * and to whichever group it belongs in (or to the "Other" catch-all) so
 * nothing goes orphaned.
 */

const CONTENT_TYPES = ['blogPost', 'blogFaq', 'blogVisual', 'category', 'seoPage'];

const PROOF_TYPES = ['caseStudy', 'client', 'testimonial'];

const SITE_DATA_TYPES = ['teamMember', 'industry', 'serviceCategory', 'technology'];

const GROUPED_TYPES = [...CONTENT_TYPES, ...PROOF_TYPES, ...SITE_DATA_TYPES];

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Content')
        .child(
          S.list()
            .title('Content')
            .items(CONTENT_TYPES.map((type) => S.documentTypeListItem(type)))
        ),
      S.listItem()
        .title('Case studies & proof')
        .child(
          S.list()
            .title('Case studies & proof')
            .items(PROOF_TYPES.map((type) => S.documentTypeListItem(type)))
        ),
      S.listItem()
        .title('Site data')
        .child(
          S.list()
            .title('Site data')
            .items(SITE_DATA_TYPES.map((type) => S.documentTypeListItem(type)))
        ),
      S.divider(),
      // Catch-all: any schema type not explicitly grouped above still
      // shows up here, so nothing is ever orphaned.
      ...S.documentTypeListItems().filter(
        (item) => !GROUPED_TYPES.includes(item.getId() as string)
      ),
    ]);
