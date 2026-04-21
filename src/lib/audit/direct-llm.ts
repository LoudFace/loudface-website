/**
 * Direct LLM calls for ChatGPT and Gemini, bypassing DataForSEO scrapers.
 *
 * Why: DataForSEO's ChatGPT scraper returns responses but rarely emits
 * source citations, and its Gemini scraper has poor recall on emerging
 * brands — both produce 0% in production audits, which misleads readers
 * and hides real visibility signal.
 *
 * We route those two platforms through Vercel AI Gateway with search /
 * grounding enabled:
 *   - ChatGPT:  openai/gpt-4o-mini-search-preview (built-in web search)
 *   - Gemini:   google/gemini-2.5-flash + google.tools.googleSearch()
 *
 * The output is adapted to the same `DFSLLMResponseResult` shape so
 * downstream `parseResponse` and trace collection work unchanged.
 *
 * Claude and Perplexity stay on DataForSEO — their scrapers work well.
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import type {
  AIPlatform,
  ApiCallTrace,
  DFSLLMResponseResult,
  DFSResponseItem,
  DFSAnnotation,
} from './types';
import type { TraceCollector } from './dataforseo';

/**
 * Platforms we query via direct API instead of DataForSEO.
 * Callers dispatch on this to choose the right path.
 */
export const DIRECT_LLM_PLATFORMS: readonly AIPlatform[] = ['chatgpt', 'gemini'] as const;

export function isDirectLLMPlatform(platform: AIPlatform): boolean {
  return DIRECT_LLM_PLATFORMS.includes(platform);
}

const MODEL_IDS: Record<'chatgpt' | 'gemini', string> = {
  chatgpt: 'openai/gpt-4o-mini-search-preview',
  gemini: 'google/gemini-2.5-flash',
};

/**
 * Per-million-token prices for cost accounting.
 * Sourced from AI Gateway's pricing page (2026-04). Approximate — the
 * gateway may overlay a small margin, but this is close enough for the
 * cost totals we surface in diagnostics.
 */
const PRICING_USD_PER_MTOK: Record<'chatgpt' | 'gemini', { input: number; output: number }> = {
  chatgpt: { input: 0.15, output: 0.60 }, // gpt-4o-mini pricing; search adds a per-call fee we're absorbing
  gemini: { input: 0.30, output: 2.50 }, // gemini-2.5-flash
};

function estimateCostUsd(
  platform: 'chatgpt' | 'gemini',
  inputTokens: number,
  outputTokens: number,
): number {
  const rates = PRICING_USD_PER_MTOK[platform];
  return (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000;
}

/**
 * Normalize a source's host for display. Google grounding returns Vertex
 * redirect URLs with the real domain stored in `title` — if the URL host
 * is a Vertex redirect, the title is what we actually want to surface.
 */
function extractCitationHost(src: { url: string; title?: string }): { url: string; title?: string } {
  try {
    const u = new URL(src.url);
    if (u.hostname === 'vertexaisearch.cloud.google.com' && src.title) {
      // Use title (the real source domain) instead of the redirect URL.
      return { url: `https://${src.title}`, title: src.title };
    }
    return { url: src.url, title: src.title };
  } catch {
    return { url: src.url, title: src.title };
  }
}

/**
 * Query ChatGPT or Gemini via AI Gateway and adapt the response to the
 * DataForSEO result shape. Returns `null` on any failure (same contract
 * as the DataForSEO path).
 */
export async function queryDirectLLM(
  platform: AIPlatform,
  prompt: string,
  tag?: string,
  tracer?: TraceCollector,
): Promise<DFSLLMResponseResult | null> {
  if (platform !== 'chatgpt' && platform !== 'gemini') return null;
  const phase = (tag ?? 'unknown') as ApiCallTrace['phase'];
  const start = Date.now();
  const modelId = MODEL_IDS[platform];

  try {
    const commonArgs = {
      model: modelId,
      prompt,
    } as const;

    const result = platform === 'gemini'
      ? await generateText({
          ...commonArgs,
          tools: { google_search: google.tools.googleSearch({}) },
        })
      : await generateText(commonArgs);

    const text = result.text || '';
    const sources = (result.sources ?? []).filter((s): s is { type: 'source'; sourceType: 'url'; id: string; url: string; title?: string } =>
      s.sourceType === 'url' && typeof s.url === 'string',
    );

    const annotations: DFSAnnotation[] = sources.map((s) => {
      const { url, title } = extractCitationHost(s);
      return { type: 'url_citation', url, title };
    });

    const item: DFSResponseItem = {
      type: 'message',
      text,
      annotations,
    };

    const inputTokens = result.usage?.inputTokens ?? 0;
    const outputTokens = result.usage?.outputTokens ?? 0;
    const costUsd = estimateCostUsd(platform, inputTokens, outputTokens);

    const adapted: DFSLLMResponseResult = {
      model_name: modelId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      money_spent: costUsd,
      cost: costUsd,
      items: [item],
      extra: { annotations },
    };

    const durationMs = Date.now() - start;
    const hasContent = text.trim().length > 0;

    if (tracer) {
      tracer.add({
        platform,
        prompt: prompt.slice(0, 100),
        phase,
        status: hasContent ? 'success' : 'empty',
        responseTokens: outputTokens,
        costUsd,
        durationMs,
      });
    }

    return adapted;
  } catch (err) {
    const durationMs = Date.now() - start;
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[DirectLLM] ${platform} query failed:`, errorMessage);

    if (tracer) {
      tracer.add({
        platform,
        prompt: prompt.slice(0, 100),
        phase,
        status: 'error',
        errorMessage,
        durationMs,
      });
    }

    return null;
  }
}
