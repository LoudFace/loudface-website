/**
 * Direct LLM calls for ChatGPT and Gemini through the Vercel AI Gateway,
 * each with its provider's own web search.
 *
 * Why not DataForSEO for these two platforms:
 *   - DFS ChatGPT scraper rarely emits source URLs (~0% citation rate)
 *   - DFS Gemini scraper has poor recall on emerging brands (~0% recognition)
 * Both produce misleading "your brand is invisible" signal when the real
 * culprit is the scraper.
 *
 * Why the AI Gateway (since 2026-10-24; OpenRouter before that):
 *   - OpenRouter's account ran out of credits and its keys were caught up in
 *     the Railway breach, so audits were failing (402) from 23 Oct.
 *   - Native search: ChatGPT uses OpenAI's own web search tool and Gemini
 *     uses Google Search grounding, which is closer to what each assistant
 *     cites for a real user than OpenRouter's `:online` add-on.
 *   - The gateway bills the LoudFace Vercel team's AI credits. Keep them
 *     topped up: an empty wallet mid-audit is what failed Phase 2/3 calls on
 *     the Canva/Glossier/Shopify/Calendly runs in July.
 *
 * Auth: the AI SDK's default gateway provider uses AI_GATEWAY_API_KEY when it
 * is set, otherwise the deployment's Vercel OIDC token.
 *
 * Claude and Perplexity stay on DataForSEO — those scrapers work reliably.
 *
 * Output adapted to `DFSLLMResponseResult` shape so downstream parseResponse
 * and trace collection work unchanged.
 */

import { generateText, type ToolSet } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import type {
  AIPlatform,
  ApiCallTrace,
  DFSLLMResponseResult,
  DFSResponseItem,
  DFSAnnotation,
} from './types';
import type { TraceCollector } from './dataforseo';

/** Platforms we query through the AI Gateway instead of DataForSEO. */
export const DIRECT_LLM_PLATFORMS: readonly AIPlatform[] = ['chatgpt', 'gemini'] as const;

export function isDirectLLMPlatform(platform: AIPlatform): boolean {
  return DIRECT_LLM_PLATFORMS.includes(platform);
}

const MODEL_IDS: Record<'chatgpt' | 'gemini', string> = {
  chatgpt: 'openai/gpt-4o-mini',
  gemini: 'google/gemini-2.5-flash',
};

/** Each platform searches the web with its provider's own tool. */
function searchTools(platform: 'chatgpt' | 'gemini'): ToolSet {
  return platform === 'chatgpt'
    ? { web_search: openai.tools.webSearch({}) }
    : { google_search: google.tools.googleSearch({}) };
}

/**
 * Hard cap on a single call. Without this, a hung upstream search call
 * blocks indefinitely and can consume the entire Vercel function budget
 * (~300s) by itself, starving every other phase. 60s matches the
 * DataForSEO Live-endpoint budget in dataforseo.ts, since these calls carry
 * similar web-search latency.
 */
const DIRECT_LLM_TIMEOUT_MS = 60_000;

/** Gemini's grounding sources are Google redirect links; this caps each lookup. */
const REDIRECT_TIMEOUT_MS = 5_000;

const GROUNDING_REDIRECT = 'vertexaisearch.cloud.google.com/grounding-api-redirect';

/**
 * Gemini cites `vertexaisearch.cloud.google.com/grounding-api-redirect/...`
 * links whose title is the cited domain. Downstream matching needs the real
 * URL, so follow the redirect once; if that fails, fall back to the domain
 * in the title.
 */
async function resolveCitationUrl(url: string, title?: string): Promise<string> {
  if (!url.includes(GROUNDING_REDIRECT)) return url;
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(REDIRECT_TIMEOUT_MS),
    });
    const location = res.headers.get('location');
    if (location) return location;
  } catch {
    // fall through to the title
  }
  return title && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(title) ? `https://${title}` : url;
}

/** OpenAI tags every cited link with utm_source=openai; drop it so URLs match the page. */
function stripOpenAiTag(url: string): string {
  try {
    const u = new URL(url);
    if (u.searchParams.get('utm_source') !== 'openai') return url;
    u.searchParams.delete('utm_source');
    return u.toString();
  } catch {
    return url;
  }
}

// ─── Main entry ────────────────────────────────────────────────────

/**
 * Query ChatGPT or Gemini through the AI Gateway and adapt the response to the
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DIRECT_LLM_TIMEOUT_MS);

  try {
    const result = await generateText({
      model: modelId,
      prompt,
      tools: searchTools(platform),
      maxOutputTokens: 1024,
      abortSignal: controller.signal,
    });
    const text = result.text ?? '';

    // Convert the SDK's url sources to DFS-shaped annotations so downstream
    // parseResponse doesn't need to know about the provider. Dedupe by URL —
    // providers sometimes cite the same page more than once.
    const urlSources = result.sources.filter((src) => src.sourceType === 'url');
    const resolved = await Promise.all(
      urlSources.map(async (src) => ({
        url: stripOpenAiTag(await resolveCitationUrl(src.url, src.title)),
        title: src.title,
      })),
    );
    const seenUrls = new Set<string>();
    const annotations: DFSAnnotation[] = [];
    for (const c of resolved) {
      if (!c.url || seenUrls.has(c.url)) continue;
      seenUrls.add(c.url);
      annotations.push({
        type: 'url_citation',
        url: c.url,
        title: c.title,
      });
    }

    const inputTokens = result.usage?.inputTokens ?? 0;
    const outputTokens = result.usage?.outputTokens ?? 0;
    // The gateway reports the actual per-call cost (search fees included) —
    // use it directly rather than estimating from our own rate table.
    const gatewayCost = Number(result.providerMetadata?.gateway?.cost);
    const costUsd = Number.isFinite(gatewayCost) ? gatewayCost : 0;

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
    // AbortController.abort() throws a DOMException/Error named 'AbortError' —
    // surface it as a clear timeout message rather than the generic "aborted".
    const errorMessage = err instanceof Error
      ? (err.name === 'AbortError' ? `Timed out after ${DIRECT_LLM_TIMEOUT_MS}ms` : err.message)
      : 'Unknown error';
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
  } finally {
    clearTimeout(timer);
  }
}
