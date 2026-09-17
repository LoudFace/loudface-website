import { defineType, defineField, defineArrayMember } from 'sanity';
import {
  generateAccessCode,
  generateProposalToken,
  PROPOSAL_TOKEN_PATTERN,
} from '@/lib/proposal-token';

/**
 * Audits — the hand-authored diagnostic we send a prospect before a call.
 *
 * Same surface as a proposal (`/p/<token>`), same private dataset, same gate:
 * an audit names a prospect's weaknesses in writing, so it is not something to
 * leave readable by anyone who guesses a URL. It lives at `/a/<token>`.
 *
 * NOT the same thing as `/audit/<id>`. That is the automated lead-magnet deck
 * driven by src/lib/audit/pipeline.ts off the /ai-audit form. This is the
 * consultative one a human writes, with measured evidence and a plan.
 *
 * Section types here cover what a diagnostic needs and a proposal does not:
 * a two-sided verdict, a scorecard of measured numbers, findings, comparison
 * tables where one row is us, bar rankings, and a provenance table. Prose and
 * plain tables are reused from the proposal schema rather than duplicated.
 */

/* ── Shared field helpers ─────────────────────────────────────────────── */

const heading = defineField({
  name: 'heading',
  title: 'Heading',
  type: 'string',
});

const band = defineField({
  name: 'band',
  title: 'Band',
  type: 'string',
  options: {
    list: [
      { title: 'Plain (page ground)', value: 'plain' },
      { title: 'White', value: 'white' },
      { title: 'Tint', value: 'tint' },
      { title: 'Dark', value: 'dark' },
    ],
    layout: 'radio',
  },
  initialValue: 'plain',
  description: 'Consecutive sections sharing a band are drawn on one band, not stacked cards.',
});

/* ── Verdict: the headline gap, stated as two numbers ─────────────────── */

const auditVerdictSection = defineType({
  name: 'auditVerdictSection',
  title: 'Verdict — two numbers',
  type: 'object',
  fields: [
    heading,
    band,
    defineField({
      name: 'leftValue',
      title: 'Left number',
      type: 'string',
      description: 'The standing they already have, e.g. "1 of 12".',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'leftLabel', title: 'Left label', type: 'text', rows: 3 }),
    defineField({ name: 'leftSource', title: 'Left source', type: 'string' }),
    defineField({
      name: 'rightValue',
      title: 'Right number',
      type: 'string',
      description: 'The reality, e.g. "2 of 23".',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'rightLabel', title: 'Right label', type: 'text', rows: 3 }),
    defineField({ name: 'rightSource', title: 'Right source', type: 'string' }),
    defineField({
      name: 'connector',
      title: 'Connector word',
      type: 'string',
      initialValue: 'versus',
    }),
  ],
  preview: {
    select: { left: 'leftValue', right: 'rightValue' },
    prepare: ({ left, right }) => ({ title: `Verdict — ${left} vs ${right}` }),
  },
});

/* ── Scorecard: the measured numbers, in a row ────────────────────────── */

const auditScorecardSection = defineType({
  name: 'auditScorecardSection',
  title: 'Scorecard',
  type: 'object',
  fields: [
    heading,
    band,
    defineField({
      name: 'tiles',
      title: 'Tiles',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'scoreTile',
          type: 'object',
          fields: [
            defineField({ name: 'value', title: 'Value', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
            defineField({
              name: 'tone',
              title: 'Tone',
              type: 'string',
              options: {
                list: [
                  { title: 'Bad', value: 'bad' },
                  { title: 'Good', value: 'good' },
                  { title: 'Neutral', value: 'neutral' },
                ],
                layout: 'radio',
              },
              initialValue: 'bad',
            }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
      validation: (rule) => rule.min(2).max(6),
    }),
  ],
  preview: {
    select: { tiles: 'tiles' },
    prepare: ({ tiles }) => ({ title: `Scorecard — ${tiles?.length ?? 0} numbers` }),
  },
});

/* ── Finding: the callout that names what the evidence means ──────────── */

const auditFindingSection = defineType({
  name: 'auditFindingSection',
  title: 'Finding callout',
  type: 'object',
  fields: [
    defineField({
      name: 'tag',
      title: 'Tag',
      type: 'string',
      description: 'The short uppercase label, e.g. "The pattern", "Own goal".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({ type: 'proposalRichText' })],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tone',
      title: 'Tone',
      type: 'string',
      options: {
        list: [
          { title: 'Problem', value: 'alert' },
          { title: 'Encouraging', value: 'ok' },
        ],
        layout: 'radio',
      },
      initialValue: 'alert',
    }),
  ],
  preview: {
    select: { title: 'tag', tone: 'tone' },
    prepare: ({ title, tone }) => ({ title: `Finding — ${title}`, subtitle: tone }),
  },
});

/* ── Comparison table: hairline rows, pills, and one row that is us ───── */

const auditTableSection = defineType({
  name: 'auditTableSection',
  title: 'Comparison table',
  type: 'object',
  fields: [
    heading,
    band,
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3 }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'numericColumns',
      title: 'Right-aligned columns',
      type: 'array',
      of: [defineArrayMember({ type: 'number' })],
      description: 'Zero-based column indexes that hold numbers. They get tabular figures and right alignment.',
    }),
    defineField({
      name: 'pillColumns',
      title: 'Pill columns',
      type: 'array',
      of: [defineArrayMember({ type: 'number' })],
      description:
        'Zero-based column indexes rendered as status pills. Tone is read from the text: absent/no/none/404 reads as a problem, yes/live/present reads as good, anything else is neutral.',
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'auditTableRow',
          type: 'object',
          fields: [
            defineField({
              name: 'cells',
              title: 'Cells',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: 'highlight',
              title: 'This row is the client',
              type: 'boolean',
              initialValue: false,
              description: 'Tints the row so the reader finds themselves without hunting.',
            }),
          ],
          preview: {
            select: { cells: 'cells', highlight: 'highlight' },
            prepare: ({ cells, highlight }) => ({
              title: (cells ?? []).join(' · ').slice(0, 80) || 'Row',
              subtitle: highlight ? 'client row' : undefined,
            }),
          },
        }),
      ],
    }),
    defineField({ name: 'note', title: 'Caption', type: 'string' }),
  ],
  preview: {
    select: { title: 'heading', rows: 'rows' },
    prepare: ({ title, rows }) => ({
      title: title || 'Comparison table',
      subtitle: `${rows?.length ?? 0} rows`,
    }),
  },
});

/* ── Bars: who occupies the answer, ranked ────────────────────────────── */

const auditBarsSection = defineType({
  name: 'auditBarsSection',
  title: 'Bar ranking',
  type: 'object',
  fields: [
    heading,
    band,
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3 }),
    defineField({
      name: 'bars',
      title: 'Bars',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'auditBar',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
            defineField({
              name: 'value',
              title: 'Value shown',
              type: 'string',
              description: 'The figure printed at the end of the bar, e.g. "21/25".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'fraction',
              title: 'Bar length (0–100)',
              type: 'number',
              validation: (rule) => rule.required().min(0).max(100),
            }),
            defineField({
              name: 'self',
              title: 'This bar is the client',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'value' },
          },
        }),
      ],
    }),
    defineField({ name: 'note', title: 'Note under the bars', type: 'text', rows: 3 }),
  ],
  preview: {
    select: { title: 'heading', bars: 'bars' },
    prepare: ({ title, bars }) => ({
      title: title || 'Bar ranking',
      subtitle: `${bars?.length ?? 0} bars`,
    }),
  },
});

/* ── Evidence quote: what a machine actually said ─────────────────────── */

const auditQuoteSection = defineType({
  name: 'auditQuoteSection',
  title: 'Evidence quote',
  type: 'object',
  fields: [
    heading,
    band,
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
      description: 'Where the quote came from and when, e.g. "ChatGPT, 17 Sep 2026".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 5,
      description: 'Wrap the client\'s own name in [[ ]] to mark it inside the quote.',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'note', title: 'Note under the quote', type: 'text', rows: 2 }),
  ],
  preview: {
    select: { subtitle: 'attribution' },
    prepare: ({ subtitle }) => ({ title: 'Evidence quote', subtitle }),
  },
});

/* ── Plan: ranked moves ───────────────────────────────────────────────── */

const auditPlanSection = defineType({
  name: 'auditPlanSection',
  title: 'Plan — ranked moves',
  type: 'object',
  fields: [
    heading,
    band,
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3 }),
    defineField({
      name: 'moves',
      title: 'Moves',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'auditMove',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Move', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'body', title: 'What it is', type: 'text', rows: 4, validation: (r) => r.required() }),
            defineField({
              name: 'meta',
              title: 'Timing',
              type: 'string',
              description: 'e.g. "Weeks 1–3", "Days", "Live now".',
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'meta' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', moves: 'moves' },
    prepare: ({ title, moves }) => ({
      title: title || 'Plan',
      subtitle: `${moves?.length ?? 0} moves`,
    }),
  },
});

/* ── Method: every number, its source, its date ───────────────────────── */

const auditMethodSection = defineType({
  name: 'auditMethodSection',
  title: 'Method and provenance',
  type: 'object',
  fields: [
    heading,
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'auditMethodRow',
          type: 'object',
          fields: [
            defineField({ name: 'measurement', title: 'Measurement', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'source', title: 'Source', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'pulled', title: 'Pulled', type: 'string', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'measurement', subtitle: 'source' } },
        }),
      ],
    }),
    defineField({ name: 'note', title: 'Closing note', type: 'text', rows: 3 }),
  ],
  preview: { prepare: () => ({ title: 'Method and provenance' }) },
});

/* ── The document ─────────────────────────────────────────────────────── */

const audit = defineType({
  name: 'audit',
  title: 'Audit',
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
      title: 'Company audited',
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
      description: 'The people who will read it.',
    }),
    defineField({
      name: 'token',
      title: 'Link token',
      type: 'string',
      group: 'access',
      readOnly: true,
      description:
        'The secret part of the URL: loudface.co/a/<token>. Generated for you. Do not edit or retype it — changing it breaks every link already sent.',
      initialValue: () => generateProposalToken(),
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          if (typeof value !== 'string' || !PROPOSAL_TOKEN_PATTERN.test(value)) {
            return 'Token must be 20-64 lowercase letters and digits.';
          }
          const client = context.getClient({ apiVersion: '2025-03-29' });
          const id = context.document?._id?.replace(/^drafts\./, '') ?? '';
          const params: Record<string, unknown> = { token: value, id };
          const taken = (await client.fetch(
            `count(*[_type == "audit" && token == $token && !(_id in [$id, "drafts." + $id])]) > 0`,
            params
          )) as boolean;
          return taken ? 'That token is already used by another audit.' : true;
        }),
    }),
    defineField({
      name: 'accessCode',
      title: 'Access code',
      type: 'string',
      group: 'access',
      description:
        'What the reader types to open the audit. Send it separately from the link. Change it to revoke access for everyone who already opened it.',
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
          { title: 'Draft (link 404s)', value: 'draft' },
          { title: 'Sent (link is live)', value: 'sent' },
          { title: 'Accepted', value: 'accepted' },
          { title: 'Expired', value: 'expired' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),

    /* Content */
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      group: 'content',
      description: 'The small line above the headline, e.g. "AI Search & SEO Diagnostic".',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      description: 'Rendered at the top of the page. The finding, in one sentence.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'standfirst',
      title: 'Standfirst',
      type: 'array',
      of: [defineArrayMember({ type: 'proposalRichText' })],
      group: 'content',
      description: 'Two or three sentences under the headline. State the gap and that everything is measured.',
    }),
    defineField({
      name: 'subject',
      title: 'Subject line',
      type: 'string',
      group: 'content',
      description: 'The domain audited, e.g. "pisano.com".',
    }),
    defineField({
      name: 'measuredOn',
      title: 'Measured on',
      type: 'string',
      group: 'content',
      description: 'Shown in the masthead, e.g. "17 September 2026".',
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({ type: 'auditVerdictSection' }),
        defineArrayMember({ type: 'auditScorecardSection' }),
        defineArrayMember({ type: 'richTextSection' }),
        defineArrayMember({ type: 'auditTableSection' }),
        defineArrayMember({ type: 'auditBarsSection' }),
        defineArrayMember({ type: 'auditFindingSection' }),
        defineArrayMember({ type: 'auditQuoteSection' }),
        defineArrayMember({ type: 'auditPlanSection' }),
        defineArrayMember({ type: 'auditMethodSection' }),
      ],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      group: 'content',
      initialValue: 'arnel@loudface.co',
    }),
  ],
  preview: {
    select: { title: 'title', clientName: 'clientName', status: 'status' },
    prepare: ({ title, clientName, status }) => ({
      title: title || clientName,
      subtitle: `${clientName} — ${status}`,
    }),
  },
});

export const auditSchemaTypes = [
  auditVerdictSection,
  auditScorecardSection,
  auditTableSection,
  auditBarsSection,
  auditFindingSection,
  auditQuoteSection,
  auditPlanSection,
  auditMethodSection,
  audit,
];
