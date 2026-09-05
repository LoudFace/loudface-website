import { defineType, defineField, defineArrayMember } from 'sanity';
import {
  generateAccessCode,
  generateProposalToken,
  PROPOSAL_TOKEN_PATTERN,
} from '@/lib/proposal-token';

/**
 * `proposal` — a client-facing proposal served at loudface.co/p/<token>.
 *
 * THIS TYPE LIVES ONLY IN THE PRIVATE `proposals` DATASET. It is registered in
 * sanity.proposals.config.ts and deliberately NOT in src/sanity/schemas/index.ts,
 * because the `production` dataset is public: anything stored there is readable
 * by anyone who knows the project ID. Pricing must never land there.
 *
 * Editing surface: /studio/proposals
 */

/* ── Rich text ────────────────────────────────────────────────────────── */

const proposalRichText = defineType({
  name: 'proposalRichText',
  title: 'Rich text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Sub-heading', value: 'h3' },
      ],
      lists: [{ title: 'Bullet', value: 'bullet' }],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (rule) =>
                  rule.required().uri({ scheme: ['http', 'https', 'mailto'] }),
              }),
            ],
          }),
        ],
      },
    }),
  ],
});

/* ── Section blocks ───────────────────────────────────────────────────── */

const sectionHeading = defineField({
  name: 'heading',
  title: 'Heading',
  type: 'string',
  description: 'Shown above the block. Leave empty to run the block into the one above it.',
});

const sectionBand = defineField({
  name: 'band',
  title: 'Background band',
  type: 'string',
  description:
    'Consecutive sections sharing a band are drawn on one tinted panel. Use it to separate the movements of the argument — their problem, our offer, the price — not to decorate a single section.',
  options: {
    list: [
      { title: 'None — the page ground', value: 'plain' },
      { title: 'White — a clean sheet', value: 'white' },
      { title: 'Indigo tint', value: 'tint' },
      { title: 'Dark — for the close', value: 'dark' },
    ],
    layout: 'radio',
  },
  initialValue: 'plain',
});

const richTextSection = defineType({
  name: 'richTextSection',
  title: 'Text',
  type: 'object',
  fields: [
    sectionHeading,
    defineField({
      name: 'body',
      title: 'Body',
      type: 'proposalRichText',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Text', subtitle: 'Text' }),
  },
});

const tableSection = defineType({
  name: 'tableSection',
  title: 'Table',
  type: 'object',
  fields: [
    sectionHeading,
    defineField({
      name: 'columns',
      title: 'Column headers',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Leave empty for a two-column table with no header row.',
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tableRow',
          fields: [
            defineField({
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [defineArrayMember({ type: 'text', rows: 2 })],
              validation: (rule) => rule.required().min(1),
            }),
          ],
          preview: {
            select: { cells: 'cells' },
            prepare: ({ cells }) => ({
              title: Array.isArray(cells) ? cells.join(' · ') : 'Row',
            }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'note',
      title: 'Note under the table',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Table', subtitle: 'Table' }),
  },
});

const pricingTiersSection = defineType({
  name: 'pricingTiersSection',
  title: 'Pricing tiers',
  type: 'object',
  fields: [
    sectionHeading,
    sectionBand,
    defineField({
      name: 'tiers',
      title: 'Tiers',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pricingTier',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Price',
              type: 'string',
              description: 'Written exactly as the client should read it, e.g. "$5,000".',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'cadence', title: 'Cadence', type: 'string', description: 'e.g. "per month".' }),
            defineField({ name: 'description', title: 'What changes', type: 'text', rows: 3 }),
            defineField({
              name: 'recommended',
              title: 'Recommended',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'price' },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'note',
      title: 'Note under the tiers',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Pricing tiers', subtitle: 'Pricing' }),
  },
});

const timelineSection = defineType({
  name: 'timelineSection',
  title: 'Timeline',
  type: 'object',
  fields: [
    sectionHeading,
    sectionBand,
    defineField({
      name: 'variant',
      title: 'Presentation',
      type: 'string',
      options: {
        layout: 'radio',
        list: [{ title: 'Engagement loop', value: 'engagementLoop' }],
      },
      description: 'Leave empty for the standard timeline.',
    }),
    defineField({
      name: 'intro',
      title: 'Intro line',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'timelineItem',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'e.g. "Month 1".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'What happens',
              type: 'text',
              rows: 4,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'kind',
              title: 'Role in the engagement loop',
              type: 'string',
              options: { list: [{ title: 'Parallel execution', value: 'execution' }] },
              description: 'Leave empty for a standard step.',
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'body' } },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'illustrativeExample',
      title: 'Illustrative parallel-work example',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string', initialValue: 'Illustrative example' }),
        defineField({ name: 'goal', title: 'Shared goal', type: 'string', validation: (rule) => rule.required() }),
        defineField({
          name: 'workstreams',
          title: 'Parallel workstreams',
          type: 'array',
          of: [defineArrayMember({
            type: 'object',
            name: 'engagementWorkstream',
            fields: [
              defineField({ name: 'label', title: 'Discipline', type: 'string', validation: (rule) => rule.required() }),
              defineField({ name: 'body', title: 'Example action', type: 'string', validation: (rule) => rule.required() }),
            ],
            preview: { select: { title: 'label', subtitle: 'body' } },
          })],
          validation: (rule) => rule.required().min(2),
        }),
        defineField({ name: 'outcome', title: 'Join point', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'returnLabel', title: 'Return cue', type: 'string' }),
      ],
      hidden: ({ parent }) => parent?.variant !== 'engagementLoop',
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Timeline', subtitle: 'Timeline' }),
  },
});

const bulletListSection = defineType({
  name: 'bulletListSection',
  title: 'Bullet list',
  type: 'object',
  fields: [
    sectionHeading,
    sectionBand,
    defineField({
      name: 'variant',
      title: 'Presentation',
      type: 'string',
      options: {
        layout: 'radio',
        list: [{ title: 'Working together', value: 'workingTogether' }],
      },
      description: 'Leave empty for the standard bullet list.',
    }),
    defineField({
      name: 'intro',
      title: 'Intro line',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Bullets',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'bulletItem',
          fields: [
            defineField({
              name: 'lead',
              title: 'Lead-in (bold)',
              type: 'string',
              description: 'Optional. Rendered bold at the start of the bullet.',
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'lead', subtitle: 'text' },
            prepare: ({ title, subtitle }) => ({ title: title || subtitle, subtitle: title ? subtitle : undefined }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Bullet list', subtitle: 'Bullets' }),
  },
});

/* ── Social proof ─────────────────────────────────────────────────────── */

/** Light sits on the document ground. Dark breaks the page into a stage. */
const proofTone = defineField({
  name: 'tone',
  title: 'Background',
  type: 'string',
  options: {
    list: [
      { title: 'Light — sits in the document', value: 'light' },
      { title: 'Dark — full-width band, breaks the page', value: 'dark' },
    ],
    layout: 'radio',
  },
  initialValue: 'light',
});

const metricsSection = defineType({
  name: 'metricsSection',
  title: 'Results',
  type: 'object',
  fields: [
    sectionHeading,
    proofTone,
    defineField({
      name: 'intro',
      title: 'Intro line',
      type: 'string',
    }),
    defineField({
      name: 'metrics',
      title: 'Numbers',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'metricItem',
          fields: [
            defineField({
              name: 'value',
              title: 'Number',
              type: 'string',
              description: 'e.g. "288%", "$1M+", "3.2x". Short — it is set large.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'What it is',
              type: 'string',
              description: 'e.g. "increase in conversion for Dimer Health".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'source',
              title: 'Source',
              type: 'string',
              description: 'Where the number comes from. Every claim carries one.',
            }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        }),
      ],
      validation: (rule) => rule.required().min(2).max(4),
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Results', subtitle: 'Numbers' }),
  },
});

/** Shared by the reviews section and the sticky rail. */
const reviewPlatform = defineType({
  name: 'reviewPlatform',
  title: 'Review platform',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'Clutch', value: 'clutch' },
          { title: 'Google', value: 'google' },
          { title: 'Trustpilot', value: 'trustpilot' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (rule) => rule.required().min(0).max(5),
    }),
    defineField({
      name: 'reviewCount',
      title: 'Number of reviews',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'string',
      description: 'Optional, e.g. "every one 5 stars".',
    }),
    defineField({
      name: 'url',
      title: 'Public profile URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'platform', subtitle: 'rating' },
    prepare: ({ title, subtitle }) => ({
      title: title,
      subtitle: subtitle ? `${subtitle} / 5` : undefined,
    }),
  },
});

/**
 * The sticky rail. Proof that stays beside the reader instead of waiting in a
 * section they may never scroll to — including while they read the price.
 */
const railQuote = defineType({
  name: 'railQuote',
  title: 'Review',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Quote',
      type: 'text',
      rows: 3,
      description:
        'Trim it. The rail is 296px wide, so about 120 characters reads well and anything longer starts to look like a page.',
      validation: (rule) => rule.required().max(220),
    }),
    defineField({ name: 'author', title: 'Who said it', type: 'string' }),
    defineField({ name: 'company', title: 'Company', type: 'string' }),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'Clutch', value: 'clutch' },
          { title: 'Google', value: 'google' },
          { title: 'Trustpilot', value: 'trustpilot' },
        ],
      },
    }),
  ],
  preview: {
    select: { title: 'author', subtitle: 'text' },
    prepare: ({ title, subtitle }) => ({ title: title || subtitle, subtitle: title ? subtitle : undefined }),
  },
});

const railClip = defineType({
  name: 'railClip',
  title: 'Clip',
  type: 'object',
  fields: [
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'An .mp4 we host. Not a Drive or Loom page — those will not play inline.',
    }),
    defineField({
      name: 'posterUrl',
      title: 'Poster image URL',
      type: 'url',
      description:
        'The still before play, and the only thing that survives printing. Always set one. Pick a frame with no caption burnt into it.',
    }),
    defineField({
      name: 'label',
      title: 'Caption',
      type: 'string',
      description: 'One short line, e.g. "Dimer Health on the 288% lift, 0:29".',
    }),
    defineField({
      name: 'orientation',
      title: 'Shape',
      type: 'string',
      description: 'The clip plays at its own shape. The tile in the rail is the same for every clip.',
      options: {
        list: [
          { title: 'Landscape (16:9)', value: 'landscape' },
          { title: 'Portrait (9:16)', value: 'portrait' },
        ],
        layout: 'radio',
      },
      initialValue: 'landscape',
    }),
    defineField({ name: 'name', title: 'Who', type: 'string', description: 'e.g. "Kasimir · Onne".' }),
    defineField({ name: 'duration', title: 'Length', type: 'string', description: 'e.g. "0:27".' }),
  ],
  preview: {
    select: { title: 'label' },
    prepare: ({ title }) => ({ title: title || 'Clip' }),
  },
});

/**
 * The rail. All social proof lives here rather than in the document: as body
 * sections it ate a screen and a half and pushed the argument apart, and it is
 * worth more beside the price than below it.
 */
const proofRail = defineType({
  name: 'proofRail',
  title: 'Proof rail',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Ratings label',
      type: 'string',
      initialValue: 'Reviewed on',
    }),
    defineField({
      name: 'platforms',
      title: 'Ratings',
      type: 'array',
      of: [defineArrayMember({ type: 'reviewPlatform' })],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'metrics',
      title: 'Numbers',
      type: 'array',
      description: 'Our proof numbers, e.g. "288%" / "conversion lift, Dimer Health". They sit under the ratings.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'railMetric',
          fields: [
            defineField({ name: 'value', title: 'Number', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'label', title: 'One line', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'source', title: 'Source', type: 'string' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
    }),
    defineField({
      name: 'quotesHeading',
      title: 'Reviews label',
      type: 'string',
      initialValue: 'What they said',
    }),
    defineField({
      name: 'quotes',
      title: 'Reviews',
      type: 'array',
      description:
        'Add as many as you like — they scroll on their own and pause when the reader hovers. Four or more is what makes the scroll look deliberate.',
      of: [defineArrayMember({ type: 'railQuote' })],
    }),
  ],
});

/**
 * Real case studies, pulled live from the public dataset by slug. The proposal
 * stores no numbers of its own, so a chart here can never drift from the chart
 * on the public case-study page.
 */
const caseProofSection = defineType({
  name: 'caseProofSection',
  title: 'Case studies',
  type: 'object',
  fields: [
    sectionHeading,
    defineField({
      name: 'intro',
      title: 'Intro line',
      type: 'string',
    }),
    defineField({
      name: 'slugs',
      title: 'Case study slugs',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description:
        'The slug from the public URL, e.g. "toku-ai-cited-pipeline" for loudface.co/case-studies/toku-ai-cited-pipeline. Two or three read well; more turns the proposal into a portfolio.',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'chartsPerCase',
      title: 'Charts per case study',
      type: 'number',
      description: 'How many of that case study\'s charts to show. One keeps it quiet.',
      initialValue: 1,
      validation: (rule) => rule.min(0).max(3),
    }),
  ],
  preview: {
    select: { title: 'heading', slugs: 'slugs' },
    prepare: ({ title, slugs }) => ({
      title: title || 'Case studies',
      subtitle: Array.isArray(slugs) ? slugs.join(', ') : undefined,
    }),
  },
});


/* ── Client-first blocks (2026-09-05) ──────────────────────────────────── */

const sourceLine = defineField({
  name: 'source',
  title: 'Source line',
  type: 'string',
  description: 'Where the numbers come from, e.g. "Peec AI, 2,250 answers, 26 Aug to 2 Sep 2026".',
});

/** Block 2 — the reader picks a buyer question and sees who the assistants name. */
const askAiSection = defineType({
  name: 'askAiSection',
  title: 'Ask the AI',
  type: 'object',
  fields: [
    sectionHeading,
    sectionBand,
    defineField({ name: 'intro', title: 'Intro line', type: 'text', rows: 2 }),
    defineField({
      name: 'questions',
      title: 'Buyer questions',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'askAiQuestion',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required() }),
            defineField({
              name: 'short',
              title: 'Tab label',
              type: 'string',
              description: 'Two or three words for the tab, e.g. "Vertical SaaS". The full question shows below.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'vendors',
              title: 'Who the AI names',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'askAiVendor',
                  fields: [
                    defineField({ name: 'name', title: 'Vendor', type: 'string', validation: (rule) => rule.required() }),
                    defineField({ name: 'share', title: 'Share of answers (%)', type: 'number', validation: (rule) => rule.required().min(0).max(100) }),
                  ],
                  preview: { select: { title: 'name', subtitle: 'share' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    sourceLine,
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Ask the AI' }) },
});

/** Block 3 — where the client stands, and why: four numbers and the page-type gap. */
const standingSection = defineType({
  name: 'standingSection',
  title: 'Where you stand',
  type: 'object',
  fields: [
    sectionHeading,
    sectionBand,
    defineField({
      name: 'stats',
      title: 'Numbers',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'standingStat',
          fields: [
            defineField({ name: 'value', title: 'Number', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'label', title: 'One line', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'lead', title: 'Lead (indigo)', type: 'boolean', initialValue: false }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
    }),
    defineField({ name: 'gapHeading', title: 'Gap chart label', type: 'string', initialValue: 'What the AI cites, and what you have' }),
    defineField({
      name: 'gap',
      title: 'Citations by page type',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'standingGapRow',
          fields: [
            defineField({ name: 'pageType', title: 'Page type', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'citations', title: 'Citations', type: 'number', validation: (rule) => rule.required().min(0) }),
            defineField({ name: 'coverage', title: 'Client coverage', type: 'string', description: 'e.g. "None", "News only", "Strongest asset".' }),
            defineField({
              name: 'tone',
              title: 'Tone',
              type: 'string',
              options: { list: [{ title: 'Gap', value: 'gap' }, { title: 'Asset', value: 'asset' }], layout: 'radio' },
              initialValue: 'gap',
            }),
          ],
          preview: { select: { title: 'pageType', subtitle: 'coverage' } },
        }),
      ],
    }),
    defineField({ name: 'closing', title: 'Closing line', type: 'text', rows: 2 }),
    sourceLine,
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Where you stand' }) },
});

const sliderField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({ name: 'min', title: 'Min', type: 'number', validation: (rule) => rule.required() }),
      defineField({ name: 'max', title: 'Max', type: 'number', validation: (rule) => rule.required() }),
      defineField({ name: 'step', title: 'Step', type: 'number' }),
      defineField({ name: 'value', title: 'Default', type: 'number', validation: (rule) => rule.required() }),
      defineField({ name: 'note', title: 'Note under the slider', type: 'string', description: 'e.g. "today 2.5% · Parafin 34%".' }),
    ],
  });

/** Block 4 — leads per month from three sliders. A model, never a promise. */
const forecastSection = defineType({
  name: 'forecastSection',
  title: 'Pipeline forecast',
  type: 'object',
  fields: [
    sectionHeading,
    sectionBand,
    defineField({ name: 'intro', title: 'Intro line', type: 'text', rows: 2 }),
    sliderField('shareOfVoice', 'AI share of voice (%)'),
    sliderField('impressions', 'Google impressions a month'),
    sliderField('conversion', 'Visitor to lead (%)'),
    defineField({
      name: 'assumptions',
      title: 'Fixed assumptions',
      type: 'object',
      fields: [
        defineField({ name: 'aiQuestionsPerMonth', title: 'Buyer questions asked to AI per month', type: 'number', validation: (rule) => rule.required() }),
        defineField({ name: 'aiClickRate', title: 'Click-through when named (%)', type: 'number', validation: (rule) => rule.required() }),
        defineField({ name: 'googleCtr', title: 'Google click-through (%)', type: 'number', validation: (rule) => rule.required() }),
        defineField({
          name: 'ramp',
          title: 'Ramp per month (share of steady state)',
          type: 'array',
          of: [defineArrayMember({ type: 'number' })],
          description: 'e.g. 0.1, 0.35, 0.7, 1, 1, 1. One entry per month shown.',
        }),
      ],
    }),
    defineField({ name: 'todayLine', title: 'Today line', type: 'string', initialValue: '0 leads a month from search or AI today.' }),
    defineField({ name: 'note', title: 'Note under the block', type: 'text', rows: 3 }),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Pipeline forecast' }) },
});

/** Block 5 — what you get: three tracks, counts in boxes. */
const tracksSection = defineType({
  name: 'tracksSection',
  title: 'What you get',
  type: 'object',
  fields: [
    sectionHeading,
    sectionBand,
    defineField({ name: 'intro', title: 'Intro line', type: 'text', rows: 2 }),
    defineField({
      name: 'tracks',
      title: 'Tracks',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'track',
          fields: [
            defineField({ name: 'label', title: 'Track', type: 'string', validation: (rule) => rule.required() }),
            defineField({
              name: 'items',
              title: 'Items',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'trackItem',
                  fields: [
                    defineField({ name: 'count', title: 'Count', type: 'string', description: 'e.g. "5", "2–3 / week". Leave empty for no box.' }),
                    defineField({ name: 'text', title: 'Text', type: 'string', validation: (rule) => rule.required() }),
                  ],
                  preview: { select: { title: 'text', subtitle: 'count' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'label' } },
        }),
      ],
    }),
    defineField({
      name: 'targets',
      title: 'Named targets',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'The pages or lists we go after first, e.g. "lendflow.com roundup · 425 citations".',
    }),
    defineField({ name: 'targetsLabel', title: 'Targets label', type: 'string', initialValue: 'The pages the answers are built from' }),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'What you get' }) },
});

/** Block 6 — the compliance gate, boxed, before the loop. */
const gateSection = defineType({
  name: 'gateSection',
  title: 'Review gate',
  type: 'object',
  fields: [
    sectionHeading,
    defineField({ name: 'body', title: 'The rule', type: 'text', rows: 3, validation: (rule) => rule.required() }),
    defineField({
      name: 'items',
      title: 'Lines',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Review gate' }) },
});

/** Block 7 — the first months as a strip, each with the number it proves. */
const monthsSection = defineType({
  name: 'monthsSection',
  title: 'The first months',
  type: 'object',
  fields: [
    sectionHeading,
    sectionBand,
    defineField({ name: 'intro', title: 'Intro line', type: 'text', rows: 2 }),
    defineField({
      name: 'months',
      title: 'Months',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'monthPlan',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. "Month 1".', validation: (rule) => rule.required() }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'items', title: 'Minimums', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
            defineField({ name: 'proves', title: 'Proves', type: 'string', description: 'The number that shows the month moved.' }),
          ],
          preview: { select: { title: 'label', subtitle: 'title' } },
        }),
      ],
    }),
    defineField({ name: 'measuresLabel', title: 'Measures label', type: 'string', initialValue: 'Your dashboard, refreshed every morning' }),
    defineField({
      name: 'measures',
      title: 'What we measure',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'measure',
          fields: [
            defineField({ name: 'label', title: 'Metric', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'note', title: 'Note', type: 'string' }),
          ],
          preview: { select: { title: 'label', subtitle: 'note' } },
        }),
      ],
    }),
    defineField({ name: 'note', title: 'Note under the block', type: 'string' }),
  ],
  preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'The first months' }) },
});

/* ── The document ─────────────────────────────────────────────────────── */

const proposal = defineType({
  name: 'proposal',
  title: 'Proposal',
  type: 'document',
  groups: [
    { name: 'access', title: 'Access', default: true },
    { name: 'content', title: 'Content' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'access',
      description: 'Internal name. Never rendered on the page and never in the link preview.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'clientName',
      title: 'Client name',
      type: 'string',
      group: 'access',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'preparedFor',
      title: 'Prepared for',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'access',
      description: 'The people who will read it, e.g. "Matt Thomas", "Jenna Cheng".',
    }),
    defineField({
      name: 'token',
      title: 'Link token',
      type: 'string',
      group: 'access',
      readOnly: true,
      description:
        'The secret part of the URL: loudface.co/p/<token>. Generated for you. Do not edit or retype it — changing it breaks every link already sent.',
      initialValue: () => generateProposalToken(),
      validation: (rule) =>
        rule
          .required()
          .custom(async (value, context) => {
            if (typeof value !== 'string' || !PROPOSAL_TOKEN_PATTERN.test(value)) {
              return 'Token must be 20-64 lowercase letters and digits.';
            }
            // Two proposals sharing a token would serve the wrong document.
            const client = context.getClient({ apiVersion: '2025-03-29' });
            const id = context.document?._id?.replace(/^drafts\./, '') ?? '';
            const params: Record<string, unknown> = { token: value, id };
            const taken = (await client.fetch(
              `count(*[_type == "proposal" && token == $token && !(_id in [$id, "drafts." + $id])]) > 0`,
              params
            )) as boolean;
            return taken ? 'That token is already used by another proposal.' : true;
          }),
    }),
    defineField({
      name: 'accessCode',
      title: 'Access code',
      type: 'string',
      group: 'access',
      description:
        'What the client types to open the proposal. Send it separately from the link. Change it to revoke access for everyone who already opened it.',
      initialValue: () => generateAccessCode(),
      validation: (rule) => rule.required().min(4),
    }),
    defineField({
      name: 'validUntil',
      title: 'Valid until',
      type: 'date',
      group: 'access',
      description: 'After this date the link returns "not found". Nothing is rendered.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'access',
      options: {
        list: [
          { title: 'Draft — link returns not found', value: 'draft' },
          { title: 'Sent — link is live', value: 'sent' },
          { title: 'Accepted — link is live', value: 'accepted' },
          { title: 'Expired — link returns not found', value: 'expired' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      group: 'access',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'heroSummary',
      title: 'Hero summary',
      type: 'proposalRichText',
      group: 'content',
      description: 'The short callout at the top. Two or three sentences.',
    }),
    defineField({
      name: 'heroQuote',
      title: 'Hero quote',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'The client\'s own words, from the call. Rendered under the title.',
    }),
    defineField({
      name: 'heroQuoteBy',
      title: 'Hero quote attribution',
      type: 'string',
      group: 'content',
      description: 'e.g. "Matt Thomas, 2 September call".',
    }),
    defineField({
      name: 'priceLine',
      title: 'Price line',
      type: 'string',
      group: 'content',
      description: 'e.g. "$5,000/mo flat. 3-month minimum, then month to month."',
    }),
    defineField({
      name: 'clipStrip',
      title: 'Clip strip',
      type: 'object',
      group: 'content',
      description:
        'Client videos as one band near the top of the page. They scroll on their own and open full size when clicked. Leave it empty and no strip renders.',
      fields: [
        defineField({
          name: 'heading',
          title: 'Label',
          type: 'string',
          initialValue: 'In their own words',
        }),
        defineField({
          name: 'clips',
          title: 'Clips',
          type: 'array',
          of: [defineArrayMember({ type: 'railClip' })],
        }),
      ],
    }),
    defineField({
      name: 'proofRail',
      title: 'Proof rail',
      type: 'proofRail',
      group: 'content',
      description:
        'Optional. Fill it in and the proposal becomes two columns on a wide screen: the document on the left, proof beside it the whole way down. Leave it empty and the proposal stays one column.',
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({ type: 'richTextSection' }),
        defineArrayMember({ type: 'tableSection' }),
        defineArrayMember({ type: 'pricingTiersSection' }),
        defineArrayMember({ type: 'timelineSection' }),
        defineArrayMember({ type: 'bulletListSection' }),
        defineArrayMember({ type: 'metricsSection' }),
        defineArrayMember({ type: 'caseProofSection' }),
        defineArrayMember({ type: 'askAiSection' }),
        defineArrayMember({ type: 'standingSection' }),
        defineArrayMember({ type: 'forecastSection' }),
        defineArrayMember({ type: 'tracksSection' }),
        defineArrayMember({ type: 'gateSection' }),
        defineArrayMember({ type: 'monthsSection' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', clientName: 'clientName', status: 'status' },
    prepare: ({ title, clientName, status }) => ({
      title: title || clientName,
      subtitle: `${clientName ?? ''}${status ? ` · ${status}` : ''}`,
    }),
  },
});

export const proposalSchemaTypes = [
  proposalRichText,
  richTextSection,
  tableSection,
  pricingTiersSection,
  timelineSection,
  bulletListSection,
  reviewPlatform,
  railQuote,
  railClip,
  proofRail,
  metricsSection,
  caseProofSection,
  askAiSection,
  standingSection,
  forecastSection,
  tracksSection,
  gateSection,
  monthsSection,
  proposal,
];
