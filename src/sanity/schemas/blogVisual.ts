import { defineType, defineField } from 'sanity';
import { FIGURE_MARKUP_MAX_CHARS } from '../../lib/figure-markup';

export const blogVisual = defineType({
  name: 'blogVisual',
  title: 'Blog Visual',
  type: 'object',
  fields: [
    defineField({
      name: 'position',
      title: 'Position',
      type: 'object',
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'anchor',
          title: 'Anchor',
          type: 'string',
          options: {
            list: [
              { title: 'Hero (top of article)', value: 'hero' },
              { title: 'After Nth H2', value: 'after-h2' },
              { title: 'End (after all content)', value: 'end' },
            ],
          },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'h2Index',
          title: 'H2 Index (1-based, required when anchor = after-h2)',
          type: 'number',
          validation: (rule) => rule.min(1).integer(),
        }),
      ],
    }),

    defineField({
      name: 'type',
      title: 'Visual Type',
      type: 'string',
      options: {
        list: [
          { title: 'Illustration (AI-generated)', value: 'illustration' },
          { title: 'Chart (data-driven)', value: 'chart' },
          { title: 'Screenshot', value: 'screenshot' },
          { title: 'Figure (Team App markup)', value: 'figure' },
        ],
      },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Describes the information content of the visual, not its appearance. Required for accessibility.',
      validation: (rule) => rule.required().min(5),
    }),

    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'text',
      rows: 2,
      description: 'Optional caption displayed below the visual.',
    }),

    // ── Illustration & Screenshot fields ──
    defineField({
      name: 'asset',
      title: 'Image',
      type: 'image',
      description: 'Required for illustration and screenshot types.',
      options: { hotspot: false },
      hidden: ({ parent }) => parent?.type !== 'illustration' && parent?.type !== 'screenshot',
    }),

    // ── Illustration generation metadata ──
    defineField({
      name: 'generation',
      title: 'Generation Metadata',
      type: 'object',
      description: 'Records the exact prompt and model used so the image can be reproduced or regenerated.',
      hidden: ({ parent }) => parent?.type !== 'illustration',
      fields: [
        defineField({ name: 'promptTemplate', title: 'Prompt Template', type: 'string' }),
        defineField({ name: 'subject', title: 'Subject', type: 'text', rows: 2 }),
        defineField({ name: 'finalPrompt', title: 'Final Prompt', type: 'text', rows: 4 }),
        defineField({ name: 'negativePrompt', title: 'Negative Prompt', type: 'text', rows: 2 }),
        defineField({ name: 'model', title: 'Model', type: 'string' }),
        defineField({ name: 'requestId', title: 'Request ID', type: 'string' }),
        defineField({ name: 'generatedAt', title: 'Generated At', type: 'datetime' }),
      ],
    }),

    // ── Screenshot metadata ──
    defineField({
      name: 'capture',
      title: 'Capture Metadata',
      type: 'object',
      hidden: ({ parent }) => parent?.type !== 'screenshot',
      fields: [
        defineField({ name: 'sourceUrl', title: 'Source URL', type: 'url' }),
        defineField({ name: 'capturedAt', title: 'Captured At', type: 'datetime' }),
        defineField({ name: 'viewport', title: 'Viewport', type: 'string' }),
      ],
    }),

    // ── Chart fields ──
    defineField({
      name: 'chart',
      title: 'Chart',
      type: 'object',
      hidden: ({ parent }) => parent?.type !== 'chart',
      fields: [
        defineField({
          name: 'kind',
          title: 'Chart Kind',
          type: 'string',
          options: {
            list: [
              { title: 'Bar (vertical grouped)', value: 'bar' },
              { title: 'Horizontal Bar', value: 'horizontalBar' },
              { title: 'Stat (single number)', value: 'stat' },
              { title: 'Table', value: 'table' },
            ],
          },
        }),
        defineField({ name: 'title', title: 'Chart Title', type: 'string' }),
        defineField({ name: 'xAxis', title: 'X-Axis Label', type: 'string' }),
        defineField({ name: 'yAxis', title: 'Y-Axis Label', type: 'string' }),
        defineField({
          name: 'data',
          title: 'Data Rows',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Label', type: 'string' }),
                defineField({ name: 'value', title: 'Value', type: 'number' }),
                defineField({ name: 'series', title: 'Series (for grouped bars)', type: 'string' }),
                defineField({ name: 'unit', title: 'Unit (e.g. %, $, x)', type: 'string' }),
              ],
              preview: {
                select: { title: 'label', subtitle: 'value' },
              },
            },
          ],
        }),
        defineField({ name: 'source', title: 'Source', type: 'string' }),
        defineField({ name: 'sourceUrl', title: 'Source URL', type: 'url' }),
      ],
    }),

    // ── Figure fields ──
    defineField({
      name: 'figure',
      title: 'Figure',
      type: 'object',
      description: 'A chart, number row, step row or trend line the Team App drew as markup. Written by the content engine, never by hand.',
      hidden: ({ parent }) => parent?.type !== 'figure',
      fields: [
        defineField({
          name: 'markup',
          title: 'Markup',
          type: 'text',
          rows: 6,
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as { type?: string } | undefined;
              if (parent?.type !== 'figure') return true;
              if (!value) return 'Required for the figure type.';
              return value.length <= FIGURE_MARKUP_MAX_CHARS || `At most ${FIGURE_MARKUP_MAX_CHARS} characters.`;
            }),
        }),
        defineField({
          name: 'kind',
          title: 'Figure Kind',
          type: 'string',
          options: {
            list: [
              { title: 'Bars', value: 'bars' },
              { title: 'Line', value: 'line' },
              { title: 'Number row', value: 'stats' },
              { title: 'Step row', value: 'steps' },
            ],
          },
        }),
        defineField({ name: 'drawnAt', title: 'Drawn At', type: 'datetime' }),
      ],
    }),
  ],
  preview: {
    select: {
      type: 'type',
      alt: 'alt',
      anchor: 'position.anchor',
      h2Index: 'position.h2Index',
      media: 'asset',
    },
    prepare({ type, alt, anchor, h2Index, media }) {
      const pos = anchor === 'after-h2' ? `after H2 #${h2Index}` : anchor;
      return {
        title: alt || `(${type})`,
        subtitle: `${type} · ${pos}`,
        media,
      };
    },
  },
});
