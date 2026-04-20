import { z } from 'zod';

/**
 * Position where a visual attaches inside an article body.
 * - `hero` = above all content (under the thumbnail)
 * - `after-h2` with `h2Index` = immediately after the Nth H2's section content
 * - `end` = after all body content
 */
export const PositionSchema = z.object({
  anchor: z.enum(['hero', 'after-h2', 'end']),
  h2Index: z.number().int().min(1).optional(),
}).refine(
  (p) => p.anchor !== 'after-h2' || typeof p.h2Index === 'number',
  { message: 'h2Index required when anchor is "after-h2"' },
);

export type Position = z.infer<typeof PositionSchema>;

/**
 * Template names that must exist as markdown files under prompts/illustrations/.
 * The template frontmatter specifies which fal.ai model to use.
 */
export const IllustrationTemplateSchema = z.enum(['hero', 'spot', 'diagram']);
export type IllustrationTemplate = z.infer<typeof IllustrationTemplateSchema>;

export const ChartKindSchema = z.enum(['bar', 'horizontalBar', 'stat', 'table']);
export type ChartKind = z.infer<typeof ChartKindSchema>;

export const ChartDatumSchema = z.object({
  label: z.string(),
  value: z.number(),
  series: z.string().optional(),
  unit: z.string().optional(),
});

export const ChartSchema = z.object({
  kind: ChartKindSchema,
  title: z.string(),
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
  data: z.array(ChartDatumSchema).min(1),
  source: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
});

export type Chart = z.infer<typeof ChartSchema>;

/** A single recommended visual from the planner. */
export const ShotSchema = z.object({
  slot: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slot must be kebab-case'),
  type: z.enum(['illustration', 'chart']),
  position: PositionSchema,
  alt: z.string().min(10),
  caption: z.string().optional(),

  // Illustration-only
  template: IllustrationTemplateSchema.optional(),
  subject: z.string().optional(),

  // Chart-only
  chart: ChartSchema.optional(),
}).refine(
  (s) => s.type !== 'illustration' || (s.template && s.subject),
  { message: 'illustration shots require template and subject' },
).refine(
  (s) => s.type !== 'chart' || s.chart,
  { message: 'chart shots require chart payload' },
);

export type Shot = z.infer<typeof ShotSchema>;

export const ShotListSchema = z.object({
  articleSlug: z.string(),
  articleTitle: z.string(),
  generatedAt: z.string().datetime(),
  shots: z.array(ShotSchema).min(1).max(12),
});

export type ShotList = z.infer<typeof ShotListSchema>;

/** Output from the illustration worker — persisted alongside a shot. */
export const IllustrationResultSchema = z.object({
  slot: z.string(),
  localPath: z.string(),
  sha: z.string(),
  generation: z.object({
    promptTemplate: z.string(),
    subject: z.string(),
    finalPrompt: z.string(),
    negativePrompt: z.string().optional().default(''),
    model: z.string(),
    requestId: z.string(),
    generatedAt: z.string().datetime(),
  }),
});

export type IllustrationResult = z.infer<typeof IllustrationResultSchema>;
