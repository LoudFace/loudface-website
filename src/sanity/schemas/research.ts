import { defineType, defineField } from 'sanity';

/**
 * Research study — the /research hub's document type.
 *
 * WHY THIS IS NOT A blogPost
 *   A study earns citations because of the things a blog post does not carry:
 *   a stated sample, a method someone could argue with, published limitations,
 *   and the raw numbers. Those are FIELDS here rather than headings inside the
 *   body on purpose — a heading is optional, a field is a question the Studio
 *   asks every time. The four AI Visibility Index pieces shipped in August as
 *   ordinary posts with none of this, and earn zero citations between them.
 *
 * WHAT IT SHARES WITH blogPost
 *   HTML body in a `text` field (this repo uses no Portable Text anywhere),
 *   `blogVisual` for charts and images, the FAQ shape, and `datasetMeta` so the
 *   page can emit Dataset structured data.
 */
export const research = defineType({
  name: 'research',
  title: 'Research Study',
  type: 'document',
  groups: [
    { name: 'core', title: 'Study', default: true },
    { name: 'evidence', title: 'Evidence' },
    { name: 'meta', title: 'SEO & schema' },
    { name: 'lifecycle', title: 'Versioning' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Title',
      type: 'string',
      group: 'core',
      description:
        'Lead with the finding, not the topic. "AI now writes as many articles as humans" travels; "A study of AI authorship" does not.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'core',
      options: { source: 'name' },
      description: 'Lives at /research/<slug>. Changing it after publication costs a permanent redirect.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headlineFinding',
      title: 'The finding, in one sentence',
      type: 'text',
      rows: 2,
      group: 'core',
      description:
        'The single quotable claim. A journalist should be able to lift this verbatim. This is the citation surface — it renders above the body and is marked Speakable.',
      validation: (rule) => rule.required().min(40).max(320),
    }),
    defineField({
      name: 'keyTakeaways',
      title: 'Key takeaways',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'core',
      description: 'Three to five. Each one self-contained — assume it is read alone, out of context, by a machine.',
      validation: (rule) => rule.min(2).max(6),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'core',
      description: 'Shown on the /research index card. ~140-160 characters.',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Index image',
      type: 'image',
      group: 'core',
      options: { hotspot: true },
      description:
        'Prefer the study\'s primary chart. Graphite\'s chart travelled further than its prose — Axios redrew it and credited the data.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'authors',
      title: 'Researchers',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'teamMember' }] }],
      group: 'core',
      description: 'Named people with credentials. An unattributed study is a blog post with charts.',
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'content',
      title: 'Body',
      type: 'text',
      group: 'core',
      description: 'Rich text stored as HTML, same as blog posts. Results and analysis only — method and limits have their own fields.',
    }),

    // ── Evidence: the part that separates research from opinion ──────────────
    defineField({
      name: 'sampleSummary',
      title: 'Sample, in one line',
      type: 'string',
      group: 'evidence',
      description:
        'Exactly what was measured and how much of it, e.g. "7 B2B SaaS sites, 90 tracked buyer questions, 3 AI engines, daily readings Apr-Aug 2026". Never round up and never imply an industry census.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'methodology',
      title: 'Methodology',
      type: 'text',
      group: 'evidence',
      description:
        'HTML. How the data was gathered, the tools, the date range, the classification rules. Written so someone hostile could try to reproduce it.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'limitations',
      title: 'Limitations',
      type: 'text',
      group: 'evidence',
      description:
        'HTML. Required, deliberately. Stating what the study cannot show is what makes journalists trust the part it can. Never leave this empty to look stronger.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'appendix',
      title: 'Appendix',
      type: 'text',
      group: 'evidence',
      description: 'HTML. Optional. Supporting tables, per-segment breakdowns, detector comparisons.',
    }),
    defineField({
      name: 'dataFiles',
      title: 'Public data',
      type: 'array',
      group: 'evidence',
      description:
        'Links to the underlying numbers. Publishing the data is the cheapest credibility available, and it is what turns a claim into something others can cite and build on.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'url', title: 'URL', type: 'url', validation: (rule) => rule.required() }),
            defineField({
              name: 'note',
              title: 'Note',
              type: 'string',
              description: 'Any redaction and why, e.g. "client domains removed".',
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        },
      ],
    }),
    defineField({
      name: 'visuals',
      title: 'Charts & images',
      type: 'array',
      of: [{ type: 'blogVisual' }],
      group: 'evidence',
      description: 'Same visual system as blog posts — bar, horizontal bar, stat and table charts, plus images.',
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      group: 'evidence',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 3, validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: 'question' } },
        },
      ],
      description: 'Do not repeat these as an FAQ heading inside the body — they render separately.',
    }),

    // ── Versioning: the mechanism behind a second press cycle ────────────────
    defineField({
      name: 'publishedDate',
      title: 'Published',
      type: 'datetime',
      group: 'lifecycle',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last updated',
      type: 'datetime',
      group: 'lifecycle',
    }),
    defineField({
      name: 'supersedes',
      title: 'Supersedes',
      type: 'reference',
      to: [{ type: 'research' }],
      group: 'lifecycle',
      description:
        'The earlier edition this replaces. Re-running a study on fresh data and revising your own number is a distribution event in its own right — Graphite\'s update earned a second press cycle seven months after the first.',
    }),
    defineField({
      name: 'superseded',
      title: 'Superseded by a newer edition',
      type: 'reference',
      to: [{ type: 'research' }],
      group: 'lifecycle',
      description:
        'Set on the OLD study when a newer one replaces it. The page then shows a notice pointing forward, so an old number stops circulating as current.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on the index',
      type: 'boolean',
      group: 'lifecycle',
      initialValue: false,
    }),

    // ── SEO ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      group: 'meta',
      description: 'Budget is 49 characters — " | LoudFace" is appended at runtime.',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      group: 'meta',
      description: 'At least 120 characters; cut at 160.',
    }),
    defineField({
      name: 'timeToRead',
      title: 'Time to read',
      type: 'string',
      group: 'meta',
    }),
    defineField({
      name: 'datasetMeta',
      title: 'Dataset (structured data)',
      type: 'object',
      group: 'meta',
      description:
        'Emits Dataset structured data so Google Dataset Search and AI engines label this as original research. Same shape as the blog field. Fill name + description at minimum.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'name', title: 'Dataset name', type: 'string' }),
        defineField({ name: 'description', title: 'Dataset description', type: 'text', rows: 3 }),
        defineField({
          name: 'temporalCoverage',
          title: 'Temporal coverage',
          type: 'string',
          description: 'ISO-8601 interval, e.g. "2026-04-01/2026-08-31".',
        }),
        defineField({ name: 'variableMeasured', title: 'Variables measured', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'measurementTechnique', title: 'Measurement technique', type: 'string' }),
        defineField({ name: 'keywords', title: 'Keywords', type: 'array', of: [{ type: 'string' }] }),
        defineField({ name: 'license', title: 'License', type: 'url' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'sampleSummary', media: 'thumbnail' },
  },
});
