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

/**
 * Viewport presets for screenshot capture. These map to Playwright page
 * dimensions in lib/browser.ts — desktop captures a standard article hero
 * size, tablet and mobile are sized to mimic responsive breakpoints.
 */
export const ViewportSchema = z.enum(['desktop', 'tablet', 'mobile']);
export type Viewport = z.infer<typeof ViewportSchema>;

/**
 * Spec for a screenshot capture. The URL must be publicly accessible — the
 * worker navigates in a fresh headless browser without cookies or auth.
 *
 * - `selector`: optional CSS selector to crop the screenshot to a single
 *   element. Dramatically improves signal-to-noise for things like the
 *   answer panel on a Perplexity search page.
 * - `waitFor`: optional CSS selector to wait for before capturing (handles
 *   SPAs and streamed AI answers that settle after the initial paint).
 * - `viewport`: preset name. Defaults to desktop.
 */
export const CaptureSpecSchema = z.object({
  sourceUrl: z.string().url(),
  selector: z.string().nullish(),
  waitFor: z.string().nullish(),
  viewport: ViewportSchema.nullish(),
});

export type CaptureSpec = z.infer<typeof CaptureSpecSchema>;

export const ChartDatumSchema = z.object({
  label: z.string(),
  value: z.number(),
  series: z.string().optional(),
  unit: z.string().optional(),
});

export const ChartSchema = z.object({
  kind: ChartKindSchema,
  title: z.string(),
  xAxis: z.string().nullish(),
  yAxis: z.string().nullish(),
  data: z.array(ChartDatumSchema).min(1),
  source: z.string().nullish(),
  // Claude sometimes emits null for missing URLs. `.nullish()` accepts null |
  // undefined; `.or(z.literal(''))` keeps explicit empty strings valid too.
  sourceUrl: z.string().url().nullish().or(z.literal('')),
});

export type Chart = z.infer<typeof ChartSchema>;

/** A single recommended visual from the planner. */
export const ShotSchema = z.object({
  slot: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slot must be kebab-case'),
  type: z.enum(['illustration', 'chart', 'screenshot']),
  position: PositionSchema,
  alt: z.string().min(10),
  // `.nullish()` so Claude can emit `"caption": null` without blowing up the
  // schema — we treat null and undefined the same downstream.
  caption: z.string().nullish(),

  // Illustration-only
  template: IllustrationTemplateSchema.nullish(),
  subject: z.string().nullish(),

  // Chart-only
  chart: ChartSchema.nullish(),

  // Screenshot-only
  capture: CaptureSpecSchema.nullish(),
}).refine(
  (s) => s.type !== 'illustration' || (s.template && s.subject),
  { message: 'illustration shots require template and subject' },
).refine(
  (s) => s.type !== 'chart' || s.chart,
  { message: 'chart shots require chart payload' },
).refine(
  (s) => s.type !== 'screenshot' || s.capture,
  { message: 'screenshot shots require capture payload' },
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
    /** Whether a style-reference image was attached for this generation. */
    hasReference: z.boolean().optional(),
  }),
});

export type IllustrationResult = z.infer<typeof IllustrationResultSchema>;

/** Output from the screenshot worker — persisted alongside a shot. */
export const ScreenshotResultSchema = z.object({
  slot: z.string(),
  localPath: z.string(),
  sha: z.string(),
  capture: z.object({
    sourceUrl: z.string().url(),
    selector: z.string().nullish(),
    viewport: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    capturedAt: z.string().datetime(),
  }),
});

export type ScreenshotResult = z.infer<typeof ScreenshotResultSchema>;
