import { defineType, defineField } from 'sanity';

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'projectTitle',
      title: 'Project Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'paragraphSummary',
      title: 'Paragraph Summary',
      type: 'text',
    }),
    defineField({
      name: 'mainBody',
      title: 'Main Body',
      type: 'text',
      description: 'Rich text content stored as HTML',
    }),
    defineField({
      name: 'mainProjectImageThumbnail',
      title: 'Main Project Image / Thumbnail',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'clientLogo',
      title: 'Client Logo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'clientLogoInversed',
      title: 'Client Logo (Inversed)',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'clientColor',
      title: 'Client Color',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'secondaryClientColor',
      title: 'Secondary Client Color',
      type: 'string',
    }),
    defineField({
      name: 'companySize',
      title: 'Company Size',
      type: 'string',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
    }),
    defineField({
      name: 'websiteLink',
      title: 'Website Link',
      type: 'url',
    }),
    defineField({
      name: 'visitTheWebsite',
      title: 'Visit the Website',
      type: 'url',
    }),
    defineField({
      name: 'result1Number',
      title: 'Result 1 Number',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'result1Title',
      title: 'Result 1 Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'result2Number',
      title: 'Result 2 Number',
      type: 'string',
    }),
    defineField({
      name: 'result2Title',
      title: 'Result 2 Title',
      type: 'string',
    }),
    defineField({
      name: 'result3Number',
      title: 'Result 3 Number',
      type: 'string',
    }),
    defineField({
      name: 'result3Title',
      title: 'Result 3 Title',
      type: 'string',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'disciplines',
      title: 'Disciplines',
      description:
        'Service categories this case study earned a real result in (tag only where the study proves an outcome). The FIRST one is the primary — it sets where the study groups in the "All" view. On the work page the study appears under every tab it is tagged with.',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'AI Search & Organic Growth', value: 'AI Search & Organic Growth' },
          { title: 'Conversion Optimization', value: 'Conversion Optimization' },
          { title: 'Web Design & Branding', value: 'Web Design & Branding' },
        ],
      },
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'reference',
      to: [{ type: 'industry' }],
    }),
    defineField({
      name: 'industries',
      title: 'Industries',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'industry' }] }],
    }),
    defineField({
      name: 'testimonial',
      title: 'Testimonial',
      type: 'reference',
      to: [{ type: 'testimonial' }],
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'technology' }] }],
    }),
    defineField({
      name: 'servicesProvided',
      title: 'Services Provided',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'serviceCategory' }] }],
    }),
    defineField({
      name: 'charts',
      title: 'Charts',
      type: 'array',
      description: 'Optional data charts displayed below the key results section',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'chartType',
              title: 'Chart Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Bar Comparison (two series)', value: 'barComparison' },
                  { title: 'Horizontal Bar (single series)', value: 'horizontalBar' },
                  { title: 'Growth Curve (area / line, no axis numbers)', value: 'growthCurve' },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'legendPrimary',
              title: 'Legend Primary',
              type: 'string',
              description: 'Label for first series (bar comparison). For a growth curve, used as the caption under the chart, e.g. "Organic impressions — directional".',
            }),
            defineField({
              name: 'legendSecondary',
              title: 'Legend Secondary',
              type: 'string',
              description: 'Label for second series (bar comparison only)',
            }),
            defineField({
              name: 'data',
              title: 'Data Points',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'value',
                      title: 'Value',
                      type: 'number',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'secondaryValue',
                      title: 'Secondary Value',
                      type: 'number',
                      description: 'Second series value (bar comparison only)',
                    }),
                    defineField({
                      name: 'displayValue',
                      title: 'Display Value',
                      type: 'string',
                      description: 'Formatted display string (e.g. "16.1K")',
                    }),
                    defineField({
                      name: 'secondaryDisplayValue',
                      title: 'Secondary Display Value',
                      type: 'string',
                    }),
                  ],
                  preview: {
                    select: { title: 'label', subtitle: 'displayValue' },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'chartType' },
          },
        },
      ],
    }),
    defineField({
      name: 'instruments',
      title: 'Instruments Board',
      type: 'object',
      description:
        'AI Search & Organic Growth chart board (Peec AI + Google Search Console). Every field is optional — InstrumentsBoard only renders the cells that have data, so a study can carry one metric or all of them.',
      fields: [
        defineField({
          name: 'aiSource',
          title: 'AI source line',
          type: 'string',
          description: 'e.g. "Peec AI · 6 Jul – 24 Aug 2026"',
        }),
        defineField({
          name: 'gscSource',
          title: 'Google source line',
          type: 'string',
          description: 'e.g. "Google Search Console · indexed to Dec 2025 = 100"',
        }),
        defineField({
          name: 'topicClimb',
          title: 'Topic climb (weekly share of AI answers)',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption', type: 'text', rows: 2 }),
            defineField({
              name: 'points',
              title: 'Weekly points',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'week', title: 'Week (ISO date)', type: 'string' }),
                    defineField({
                      name: 'value',
                      title: 'Share (0–1)',
                      type: 'number',
                      description: 'e.g. 0.333 for 33.3%',
                    }),
                  ],
                  preview: { select: { title: 'week', subtitle: 'value' } },
                },
              ],
            }),
          ],
        }),
        defineField({
          name: 'rankOverTime',
          title: 'Rank over time (mean cited position)',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'from', title: 'From', type: 'number' }),
            defineField({ name: 'to', title: 'To', type: 'number' }),
            defineField({ name: 'caption', title: 'Caption', type: 'text', rows: 2 }),
            defineField({
              name: 'points',
              title: 'Weekly points',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'week', title: 'Week (ISO date)', type: 'string' }),
                    defineField({
                      name: 'position',
                      title: 'Position',
                      type: 'number',
                      description: 'Lower is better',
                    }),
                  ],
                  preview: { select: { title: 'week', subtitle: 'position' } },
                },
              ],
            }),
          ],
        }),
        defineField({
          name: 'engineBeforeAfter',
          title: 'Engine before/after',
          type: 'object',
          fields: [
            defineField({ name: 'beforeLabel', title: 'Before label', type: 'string', description: 'e.g. "May 2026"' }),
            defineField({ name: 'afterLabel', title: 'After label', type: 'string', description: 'e.g. "Aug 2026"' }),
            defineField({ name: 'caption', title: 'Caption', type: 'text', rows: 2 }),
            defineField({
              name: 'rows',
              title: 'Rows, one per engine',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'engine',
                      title: 'Engine',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'ChatGPT', value: 'chatgpt' },
                          { title: 'Perplexity', value: 'perplexity' },
                          { title: 'Gemini', value: 'gemini' },
                          { title: 'Google AI Overviews', value: 'googleAio' },
                        ],
                      },
                      validation: (rule) => rule.required(),
                    }),
                    defineField({ name: 'before', title: 'Before (0–1)', type: 'number' }),
                    defineField({ name: 'after', title: 'After (0–1)', type: 'number' }),
                  ],
                  preview: { select: { title: 'engine', subtitle: 'after' } },
                },
              ],
            }),
          ],
        }),
        defineField({
          name: 'indexedTrend',
          title: 'Google impressions/clicks trend (indexed)',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({
              name: 'baselineLabel',
              title: 'Baseline label',
              type: 'string',
              description: 'e.g. "Dec" — the confidentiality formatter prints values as multiples of this month',
            }),
            defineField({ name: 'caption', title: 'Caption', type: 'text', rows: 2 }),
            defineField({
              name: 'startMonthIso',
              title: 'Start month (ISO, YYYY-MM)',
              type: 'string',
              description: 'The calendar month the first point in `points` represents, e.g. "2025-09"',
            }),
            defineField({
              name: 'points',
              title: 'Monthly points',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'month', title: 'Month label', type: 'string' }),
                    defineField({ name: 'impressions', title: 'Impressions (indexed)', type: 'number' }),
                    defineField({ name: 'clicks', title: 'Clicks (indexed)', type: 'number' }),
                    defineField({
                      name: 'partial',
                      title: 'Partial month?',
                      type: 'boolean',
                      description: 'Flags a mid-month pull so the dip does not read as a decline',
                    }),
                  ],
                  preview: { select: { title: 'month', subtitle: 'impressions' } },
                },
              ],
            }),
          ],
        }),
        defineField({
          name: 'publishedResult',
          title: 'Published Google result (headline figures)',
          type: 'object',
          fields: [
            defineField({
              name: 'rows',
              title: 'Figures',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. "11.7x"' }),
                    defineField({ name: 'unit', title: 'Unit', type: 'string', description: 'e.g. "impressions"' }),
                  ],
                  preview: { select: { title: 'value', subtitle: 'unit' } },
                },
              ],
            }),
            defineField({ name: 'positionFrom', title: 'Google position — from', type: 'number' }),
            defineField({ name: 'positionTo', title: 'Google position — to', type: 'number' }),
            defineField({ name: 'caption', title: 'Caption', type: 'text', rows: 2 }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      description: 'Frequently asked questions shown as an accordion at the bottom of the case study. Auto-generated from content, editable here.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 3, validation: (rule) => rule.required() }),
          ],
          preview: {
            select: { title: 'question', subtitle: 'answer' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'projectTitle',
      media: 'mainProjectImageThumbnail',
    },
  },
});
