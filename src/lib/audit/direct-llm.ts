/**
 * Direct LLM calls for ChatGPT and Gemini via OpenRouter.
 *
 * Why not DataForSEO for these two platforms:
 *   - DFS ChatGPT scraper rarely emits source URLs (~0% citation rate)
 *   - DFS Gemini scraper has poor recall on emerging brands (~0% recognition)
 * Both produce misleading "your brand is invisible" signal when the real
 * culprit is the scraper.
 *
 * Why OpenRouter over Vercel AI Gateway (which we tried first):
 *   - Pay-as-you-go, transparent per-call pricing (no Vercel team-wallet
 *     depletion mid-audit — we hit that exact issue on Canva/Glossier/
 *     Shopify/Calendly runs and half their Phase 2/3 calls failed).
 *   - Universal `:online` suffix enables web search on any model —
 *     `openai/gpt-4o-mini:online` and `google/gemini-2.5-flash:online`.
 *     No provider SDK needed, no Gemini-specific tool helpers.
 *   - Richer citation payloads (full content snippets + URL + title).
 *
 * Claude and Perplexity stay on DataForSEO — those scrapers work reliably.
 *
 * Output adapted to `DFSLLMResponseResult` shape so downstream parseResponse
 * and trace collection work unchanged.
 */

import type {
  AIPlatform,
  ApiCallTrace,
  DFSLLMResponseResult,
  DFSResponseItem,
  DFSAnnotation,
} from './types';
import type { TraceCollector } from './dataforseo';

/** Platforms we query via OpenRouter instead of DataForSEO. */
export const DIRECT_LLM_PLATFORMS: readonly AIPlatform[] = ['chatgpt', 'gemini'] as const;

export function isDirectLLMPlatform(platform: AIPlatform): boolean {
  return DIRECT_LLM_PLATFORMS.includes(platform);
}

const MODEL_IDS: Record<'chatgpt' | 'gemini', string> = {
  // `:online` is OpenRouter's universal web-search suffix — returns
  // url_citation annotations alongside the text. Simpler than the old
  // gpt-4o-mini-search-preview / google.tools.googleSearch() split.
  chatgpt: 'openai/gpt-4o-mini:online',
  gemini: 'google/gemini-2.5-flash:online',
};

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// ─── OpenRouter response types ─────────────────────────────────────

interface OpenRouterUrlCitation {
  url: string;
  title?: string;
  start_index?: number;
  end_index?: number;
  /** Some models return the scraped page body here — we don't surface it. */
  content?: string;
}

interface OpenRouterAnnotation {
  type: string;
  url_citation?: OpenRouterUrlCitation;
}

interface OpenRouterMessage {
  role: string;
  content?: string | null;
  annotations?: OpenRouterAnnotation[];
}

interface OpenRouterChoice {
  message?: OpenRouterMessage;
  finish_reason?: string;
}

interface OpenRouterUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost?: number;
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
  usage?: OpenRouterUsage;
  error?: { message?: string; code?: string };
}

// ─── Main entry ────────────────────────────────────────────────────

/**
 * Query ChatGPT or Gemini via OpenRouter and adapt the response to the
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

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('[DirectLLM] OPENROUTER_API_KEY not set — cannot query', platform);
    tracer?.add({
      platform,
      prompt: prompt.slice(0, 100),
      phase,
      status: 'error',
      errorMessage: 'OPENROUTER_API_KEY not set',
      durationMs: 0,
    });
    return null;
  }

  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Attribution headers — show up on OpenRouter's dashboard.
        'HTTP-Referer': 'https://loudface.co',
        'X-Title': 'LoudFace AI Visibility Audit',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 240)}`);
    }

    const data = (await res.json()) as OpenRouterResponse;
    if (data.error) {
      throw new Error(`OpenRouter error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const msg = data.choices?.[0]?.message;
    const text = typeof msg?.content === 'string' ? msg.content : '';

    // Convert OpenRouter annotations (url_citation objects) to DFS-shaped
    // annotations so downstream parseResponse doesn't need to know about
    // the provider. Dedupe by URL — some models emit the same citation
    // multiple times.
    const seenUrls = new Set<string>();
    const annotations: DFSAnnotation[] = [];
    for (const ann of msg?.annotations ?? []) {
      const c = ann.url_citation;
      if (!c?.url) continue;
      if (seenUrls.has(c.url)) continue;
      seenUrls.add(c.url);
      annotations.push({
        type: 'url_citation',
        url: c.url,
        title: c.title,
      });
    }

    const inputTokens = data.usage?.prompt_tokens ?? 0;
    const outputTokens = data.usage?.completion_tokens ?? 0;
    // OpenRouter reports actual per-call cost — use it directly rather than
    // estimating from our own rate table.
    const costUsd = typeof data.usage?.cost === 'number' ? data.usage.cost : 0;

    const item: DFSResponseItem = { type: 'message', text, annotations };
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

    tracer?.add({
      platform,
      prompt: prompt.slice(0, 100),
      phase,
      status: hasContent ? 'success' : 'empty',
      responseTokens: outputTokens,
      costUsd,
      durationMs,
    });

    return adapted;
  } catch (err) {
    const durationMs = Date.now() - start;
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[DirectLLM] ${platform} query failed:`, errorMessage);

    tracer?.add({
      platform,
      prompt: prompt.slice(0, 100),
      phase,
      status: 'error',
      errorMessage,
      durationMs,
    });

    return null;
  }
}
