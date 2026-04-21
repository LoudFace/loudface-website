/**
 * Phase 1 structured extraction.
 *
 * Consolidates what the regex-based analysis layer used to compute in ~900 lines
 * (category inference, accurate claims, inaccuracies, gaps, competitor extraction,
 * entity disambiguation) into a single schema-constrained LLM call.
 *
 * Input: ground truth (the site's own story) + raw Phase 1 AI responses.
 * Output: typed findings the pipeline uses directly — no post-processing.
 *
 * This is the core trust layer for the whole audit. If the model reports
 * `entity_disambiguation.is_correct_entity: false`, downstream phases can
 * flag the audit as low-confidence instead of rendering misleading stats.
 */

import { z } from 'zod';
import { extractStructured } from './extract-structured';
import { formatGroundTruthForPrompt, type GroundTruth } from './ground-truth';
import type { BrandBaselineData, PlatformResult } from './types';
import type { TraceCollector } from './dataforseo';

// ─── Schema ─────────────────────────────────────────────────────────

const ENTITY_TYPES = [
  'agency',
  'saas',
  'ecommerce',
  'consumer-brand',
  'marketplace',
  'publisher',
  'other',
] as const;

const CONFIDENCE = ['high', 'medium', 'low'] as const;

const PLATFORMS = ['chatgpt', 'claude', 'gemini', 'perplexity'] as const;

const Phase1Schema = z.object({
  entity_disambiguation: z.object({
    is_correct_entity: z
      .boolean()
      .describe('Whether the AI responses are actually about THIS brand (as described in the ground truth), not a different entity with the same or similar name.'),
    confidence: z.enum(CONFIDENCE).describe('Confidence in the entity-match judgment.'),
    wrong_entity_description: z
      .string()
      .describe('If is_correct_entity is false, a concise NOUN PHRASE describing the other entity the AI is mistakenly describing. Must start with an indefinite article ("a" / "an") and slot cleanly after the phrase "The AI responses appear to describe __". Examples: "an insurance-claims automation platform, not the SEO agency at omnius.so", "a consumer wearable device, not the agency at loudface.co". Do NOT start with "The AI platforms...", "They describe...", or any meta-commentary about the responses themselves. Empty string if is_correct_entity is true.'),
  }),
  categorization: z.object({
    specific_category: z
      .string()
      .describe('The most specific category that fits the brand. 2-5 words, must read as a complete noun phrase, never ending in a preposition, article, or conjunction (that, for, of, with, and, the). Examples: "Webflow agency", "crypto payroll platform", "mental-health app". Derived from the ground truth, not from AI responses.'),
    broad_category: z
      .string()
      .describe('The broader industry the specific category belongs to. 1-3 words, complete noun phrase. Examples: "marketing agency", "fintech", "consumer health".'),
    industry: z
      .string()
      .describe('The single-word industry label. Examples: "SaaS", "agency", "ecommerce".'),
    entity_type: z.enum(ENTITY_TYPES).describe('The business model / entity type.'),
  }),
  brand_knowledge: z.object({
    accurate_claims: z
      .array(
        z.object({
          claim: z.string().describe('A factually accurate statement about the brand, in the AI\'s own phrasing. Full sentence, no fragments.'),
          platforms: z.array(z.enum(PLATFORMS)).describe('Which AI platforms made this claim.'),
        }),
      )
      .describe('Facts the AI platforms got right about the brand, validated against the ground truth. Only include claims that multiple platforms made OR that are clearly supported by the ground truth. Max 6 items.'),
    inaccurate_claims: z
      .array(
        z.object({
          claim: z.string().describe('The inaccurate statement.'),
          why_wrong: z.string().describe('One sentence explaining why this contradicts the ground truth.'),
          platforms: z.array(z.enum(PLATFORMS)),
        }),
      )
      .describe('Statements the AI made that contradict the ground truth. Max 4 items.'),
    knowledge_gaps: z
      .array(
        z.object({
          gap: z
            .string()
            .describe('One full sentence describing a specific thing AI platforms failed to mention or got confused about.'),
          suggested_page_path: z
            .string()
            .describe(
              'A concrete URL path to create or update on the brand\'s own site that would close this gap. Must start with "/". 2-5 segments max. Examples: "/pricing", "/features/ai-prompt-to-code", "/about/sustainability", "/compare/figma-vs-adobe-xd". Pick a path that would realistically rank for the missing information — not a generic "/about".',
            ),
        }),
      )
      .describe('Aspects of the brand that AI platforms failed to mention or got confused about, paired with the specific page the brand should create to close each gap. Max 4 items.'),
  }),
  competitors_mentioned: z
    .array(
      z.object({
        name: z.string().describe('Competitor name as it appeared in responses.'),
        // Plain `z.number()` rather than `.int()` — OpenRouter routes some
        // Anthropic models via Azure, whose JSON-schema implementation
        // rejects `type: integer` outright. Our code treats this as an int
        // anyway; keeping the type permissive avoids a cross-provider
        // schema rejection that silently fails Phase 1 extraction.
        mention_count: z.number().describe('Approximate number of times it was mentioned across all responses. Integer, at least 1.'),
      }),
    )
    .describe('Companies the AI platforms named as competitors or alternatives to the brand. Max 8 items, sorted by mention_count desc.'),
});

export type Phase1Extraction = z.infer<typeof Phase1Schema>;

// ─── Prompt construction ────────────────────────────────────────────

function formatPlatformResponses(results: PlatformResult[], maxChars = 4500): string {
  const lines: string[] = [];
  let usedChars = 0;

  // Group by platform for readability
  const byPlatform: Record<string, PlatformResult[]> = {};
  for (const r of results) {
    if (!r.rawResponse) continue;
    (byPlatform[r.platform] ??= []).push(r);
  }

  for (const platform of Object.keys(byPlatform)) {
    const header = `\n─── ${platform} ───`;
    if (usedChars + header.length > maxChars) break;
    lines.push(header);
    usedChars += header.length;

    for (const r of byPlatform[platform]) {
      const snippet = r.rawResponse!.slice(0, 600);
      const entry = `• ${snippet}`;
      if (usedChars + entry.length > maxChars) {
        lines.push('[… more responses truncated …]');
        return lines.join('\n');
      }
      lines.push(entry);
      usedChars += entry.length;
    }
  }

  return lines.join('\n');
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Run the Phase 1 structured extraction. Returns null only on total failure —
 * callers should fall back to a conservative default in that case.
 */
export async function extractPhase1Insights(args: {
  companyName: string;
  domain: string;
  groundTruth: GroundTruth | null;
  brandBaseline: BrandBaselineData;
  tracer?: TraceCollector;
}): Promise<Phase1Extraction | null> {
  const { companyName, domain, groundTruth, brandBaseline, tracer } = args;

  const allResults = brandBaseline.queries.flatMap((q) => q.results);
  const responsesBlock = formatPlatformResponses(allResults);

  const groundTruthBlock = groundTruth
    ? formatGroundTruthForPrompt(groundTruth)
    : `URL: https://${domain}\nDomain: ${domain}\n(ground-truth scrape failed — rely on domain only)`;

  const system = [
    'You analyze how AI platforms (ChatGPT, Claude, Gemini, Perplexity) represent a specific brand.',
    'Your output drives an AI-visibility audit that brand teams will read. Write for that audience:',
    'specific, concrete, opinionated — not hedged marketing copy.',
    '',
    'Rules:',
    '1. The ground truth is the source of truth about what this brand actually is. Always cross-check AI claims against it.',
    '2. If AI responses describe a DIFFERENT entity with the same/similar name (e.g. "LoudFace" as a wearable device when the brand is LoudFace the agency), flag is_correct_entity: false.',
    '3. Never invent competitors. Only list companies the AI platforms actually named.',
    '4. Be concise. Each claim is a FULL SENTENCE, not a fragment. No trailing ellipses.',
    '',
    'Writing quality — this matters:',
    '5. Accurate claims read as specific differentiating facts (what this brand is known for, what it does that others do not, measurable things), not generic category descriptions. "Mailchimp is an email marketing platform" is weak. "Mailchimp is best known for serving small businesses and offering a generous free tier that competitors like HubSpot do not match" is strong.',
    '6. Inaccuracies include *why it is wrong* from the ground truth, not just "this is wrong". Each why_wrong is one concrete sentence contrasting AI claim vs reality.',
    '7. Knowledge gaps are things a well-informed person WOULD expect AI to know about the brand but didn\'t say — pricing, target customer, signature product, recent milestones, leadership. Not vague "AI could say more".',
    '8. If the ground truth is empty or low-confidence, still produce opinions — but draw only from patterns in the AI responses themselves, and err toward fewer claims over inventing them.',
  ].join('\n');

  const prompt = [
    `BRAND: ${companyName}`,
    '',
    '=== GROUND TRUTH (from the brand\'s own website) ===',
    groundTruthBlock,
    '',
    '=== RAW AI RESPONSES (Phase 1: 10 branded queries × 4 platforms) ===',
    responsesBlock || '[no text responses]',
    '',
    '=== TASK ===',
    'Analyze the AI responses against the ground truth and return a structured extraction that matches the schema.',
  ].join('\n');

  const result = await extractStructured({
    schema: Phase1Schema,
    prompt,
    system,
    tag: 'brand-baseline',
    tracer,
    maxOutputTokens: 2048,
    // Haiku 4.5 — cheaper and still handles the entity disambiguation + claim
    // extraction task reliably. We burned ~$0.20-0.50 per audit on Sonnet for
    // what is essentially structured fact extraction against a ground-truth
    // anchor. Haiku produces comparable Zod-validated output at ~10x lower
    // cost and meaningfully lower latency.
    model: 'anthropic/claude-haiku-4.5',
  });

  if (!result.value) {
    console.error('[extractPhase1Insights] Extraction failed:', result.error);
    return null;
  }

  return result.value;
}
