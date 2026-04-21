import type {
  AIPlatform,
  ApiCallTrace,
  DFSLLMResponseResult,
  DFSCompetitorResult,
} from './types';
import { isDirectLLMPlatform, queryDirectLLM } from './direct-llm';

// ─── Config ─────────────────────────────────────────────────────────

const DFS_BASE = 'https://api.dataforseo.com/v3';

const PLATFORM_MODELS: Record<AIPlatform, string> = {
  // chatgpt + gemini are handled by direct-llm.ts via OpenRouter; these DFS
  // entries are just fallbacks used if someone calls DFS for those platforms
  // directly (they're skipped in queryLLM via isDirectLLMPlatform).
  chatgpt: 'gpt-4o',
  // Haiku instead of Sonnet — a 10-12x cost reduction (Sonnet was $0.066/call
  // vs Haiku ~$0.005) with no quality loss for the "what is X" / "alternatives
  // to X" / "best X" queries we're running. Sonnet-level reasoning is not
  // required to produce a brand-mention paragraph.
  claude: 'claude-haiku-4-5',
  gemini: 'gemini-2.0-flash',
  perplexity: 'sonar',
};

// DataForSEO uses different path segments for each platform
const PLATFORM_PATHS: Record<AIPlatform, string> = {
  chatgpt: 'chat_gpt',
  claude: 'claude',
  gemini: 'gemini',
  perplexity: 'perplexity',
};

const ALL_PLATFORMS: AIPlatform[] = ['chatgpt', 'claude', 'gemini', 'perplexity'];

function getAuthHeader(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error('DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD must be set');
  }
  return `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
}

// ─── Trace Collector ────────────────────────────────────────────────

/**
 * Collects API call traces during an audit run.
 * Create one per audit, pass it to query functions, read traces at the end.
 */
export class TraceCollector {
  private traces: ApiCallTrace[] = [];

  add(trace: ApiCallTrace) {
    this.traces.push(trace);
  }

  getTraces(): ApiCallTrace[] {
    return this.traces;
  }

  getSummary() {
    const successful = this.traces.filter((t) => t.status === 'success').length;
    const failed = this.traces.filter((t) => t.status === 'error').length;
    const empty = this.traces.filter((t) => t.status === 'empty').length;
    const totalCost = this.traces.reduce((sum, t) => sum + (t.costUsd ?? 0), 0);
    const totalDuration = this.traces.reduce((sum, t) => sum + (t.durationMs ?? 0), 0);

    return {
      totalApiCalls: this.traces.length,
      successfulCalls: successful,
      failedCalls: failed,
      emptyCalls: empty,
      totalCostUsd: Math.round(totalCost * 10000) / 10000,
      totalDurationMs: totalDuration,
    };
  }
}

// ─── Generic Fetch ──────────────────────────────────────────────────

async function dfsRequest<T>(
  path: string,
  body: unknown[],
  timeoutMs = 130_000,
): Promise<T[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${DFS_BASE}${path}`, {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`DataForSEO ${res.status}: ${text.slice(0, 300)}`);
    }

    const json = await res.json();

    if (json.status_code !== 20000) {
      throw new Error(`DataForSEO error ${json.status_code}: ${json.status_message}`);
    }

    // Extract results from the nested task structure
    const results: T[] = [];
    for (const task of json.tasks ?? []) {
      if (task.status_code === 20000 && task.result) {
        results.push(...task.result);
      } else if (task.status_code !== 20000) {
        console.warn(`[DFS] Task error ${task.status_code}: ${task.status_message} (path: ${path})`);
      }
    }
    return results;
  } finally {
    clearTimeout(timer);
  }
}

// ─── LLM Responses ─────────────────────────────────────────────────

/**
 * Classify an error as retryable. DataForSEO 5xx, timeouts, and internal
 * task errors are worth a single retry — they're usually transient scraper
 * flakes. Client errors (400/401/403), quota exhaustion, and abort errors
 * are not retryable.
 */
function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message;
  // Aborted by timeout — not retryable, we already waited long enough.
  if (err.name === 'AbortError') return false;
  // HTTP 5xx returned by dfsRequest.
  if (/DataForSEO 5\d\d:/.test(msg)) return true;
  // DataForSEO's own status codes for transient failures.
  if (/DataForSEO error 40501/.test(msg)) return true; // internal task error
  if (/DataForSEO error 40602/.test(msg)) return true; // service temporarily unavailable
  // Network-level failures — fetch throws TypeError / generic Error on DNS/TLS.
  if (/ECONNRESET|ETIMEDOUT|ENOTFOUND|fetch failed|network/i.test(msg)) return true;
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Query a single AI platform with a prompt.
 * Uses the Live endpoint (up to 120s response time).
 * Optionally records a trace for diagnostics.
 *
 * Retries once with a 2s backoff on transient errors (DataForSEO 5xx,
 * internal task errors, network failures). Observed in QA: ~40/41 Phase 1
 * calls failing on a single brand due to a DFS scraper flake — retry-once
 * is expected to recover most of those while only adding ~5% worst-case
 * cost and latency.
 */
export async function queryLLM(
  platform: AIPlatform,
  prompt: string,
  tag?: string,
  tracer?: TraceCollector,
): Promise<DFSLLMResponseResult | null> {
  // ChatGPT and Gemini go through direct API calls (AI Gateway) — DataForSEO's
  // scrapers for those platforms omit citations and have poor recall. Claude
  // and Perplexity stay on DataForSEO since their scrapers work reliably.
  if (isDirectLLMPlatform(platform)) {
    return queryDirectLLM(platform, prompt, tag, tracer);
  }

  const path = `/ai_optimization/${PLATFORM_PATHS[platform]}/llm_responses/live`;
  const phase = (tag ?? 'unknown') as ApiCallTrace['phase'];
  const start = Date.now();

  const attempt = async (): Promise<DFSLLMResponseResult | null> => {
    const results = await dfsRequest<DFSLLMResponseResult>(path, [
      {
        user_prompt: prompt.slice(0, 500), // API limit
        model_name: PLATFORM_MODELS[platform],
        max_output_tokens: 1024,
        web_search: true,
        ...(tag ? { tag } : {}),
      },
    ]);
    return results[0] ?? null;
  };

  let result: DFSLLMResponseResult | null = null;
  let lastError: unknown = null;
  for (let tries = 0; tries < 2; tries++) {
    try {
      result = await attempt();
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      if (tries === 0 && isRetryableError(err)) {
        console.warn(`[DFS] ${platform} query failed (retryable), retrying once after 2s:`, err instanceof Error ? err.message.slice(0, 160) : err);
        await sleep(2000);
        continue;
      }
      break;
    }
  }

  const durationMs = Date.now() - start;

  if (lastError) {
    const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown error';
    console.error(`[DFS] LLM query failed (${platform}):`, errorMessage);
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

  // Check if we got a response but it had no actual content
  const hasContent = result?.items?.some((item) =>
    (item.sections?.length && item.sections.some((s) => s.text?.trim())) ||
    item.text?.trim(),
  );

  if (tracer) {
    tracer.add({
      platform,
      prompt: prompt.slice(0, 100),
      phase,
      status: result && hasContent ? 'success' : result ? 'empty' : 'empty',
      responseTokens: result?.output_tokens,
      costUsd: result?.money_spent ?? result?.cost,
      durationMs,
    });
  }

  if (!hasContent && result) {
    console.warn(`[DFS] ${platform} returned result but no text content for: "${prompt.slice(0, 60)}..."`);
  }

  return result;
}

/**
 * Query all 4 AI platforms with the same prompt in parallel.
 * Returns results keyed by platform.
 */
export async function queryAllPlatforms(
  prompt: string,
  tag?: string,
  tracer?: TraceCollector,
): Promise<Record<AIPlatform, DFSLLMResponseResult | null>> {
  const entries = await Promise.all(
    ALL_PLATFORMS.map(async (platform) => {
      const result = await queryLLM(platform, prompt, tag, tracer);
      return [platform, result] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<AIPlatform, DFSLLMResponseResult | null>;
}

// ─── Competitor Discovery ───────────────────────────────────────────

/**
 * Auto-detect competitors for a domain using DataForSEO Labs.
 * Returns up to `limit` competitor domains sorted by keyword intersection.
 */
export async function getCompetitors(
  domain: string,
  limit = 5,
): Promise<DFSCompetitorResult[]> {
  const path = '/dataforseo_labs/google/competitors_domain/live';

  // Strip protocol and www
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');

  try {
    const results = await dfsRequest<{
      items: DFSCompetitorResult[];
    }>(path, [
      {
        target: cleanDomain,
        location_name: 'United States',
        language_name: 'English',
        exclude_top_domains: true,
        limit,
      },
    ]);

    return results[0]?.items ?? [];
  } catch (err) {
    console.error('[DFS] Competitor detection failed:', err);
    return [];
  }
}

// ─── Concurrency Helper ────────────────────────────────────────────

/**
 * Run async tasks with a concurrency limit.
 * Processes items through `fn` with at most `concurrency` running at once.
 */
export async function withConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );

  return results;
}

export { ALL_PLATFORMS, PLATFORM_MODELS };
