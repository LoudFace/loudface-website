/**
 * Structured LLM extraction primitive.
 *
 * Wraps AI SDK's `generateObject` with Vercel AI Gateway routing, so callers
 * get typed JSON back instead of regex-parsed free text. Used by the audit
 * pipeline to replace the regex-based analysis that was producing gibberish
 * categories, wrong-entity claims, and fragmented strings.
 *
 * Requires `AI_GATEWAY_API_KEY` in the environment. On Vercel deployments
 * the OIDC token is auto-injected; locally, set it in `.env.local`.
 *
 * This is intentionally separate from the DataForSEO wrapper: DataForSEO
 * caps `user_prompt` at 500 chars, which is far too small for extraction
 * prompts that carry ground truth + raw AI responses. Extraction runs once
 * per audit (consolidation step), so the per-audit cost is dominated by
 * the multi-platform Phase 1/2/3 calls — not this.
 */

import { generateObject } from 'ai';
import type { ZodType } from 'zod';
import type { ApiCallTrace } from './types';
import type { TraceCollector } from './dataforseo';

/** Default model for extraction — haiku is fast, cheap, and reliable at structured output. */
const DEFAULT_MODEL = 'anthropic/claude-haiku-4.5';

export interface StructuredExtractionOptions<T> {
  /** Zod schema the output must satisfy. */
  schema: ZodType<T>;
  /** The full prompt, including any source material (ground truth, raw responses, etc.). */
  prompt: string;
  /** Optional system prompt — use to pin the task role. */
  system?: string;
  /**
   * Gateway model ID. Defaults to claude-haiku-4.5.
   * For harder entity reasoning, pass 'anthropic/claude-sonnet-4.6'.
   */
  model?: string;
  /** Diagnostic tag carried into the trace record for this extraction call. */
  tag?: ApiCallTrace['phase'];
  /** Optional trace collector so extraction calls show up in diagnostics. */
  tracer?: TraceCollector;
  /** Upper bound on output tokens. Default 2048 is enough for typical extraction. */
  maxOutputTokens?: number;
  /** Temperature. Default 0.1 for deterministic extraction. */
  temperature?: number;
}

export interface StructuredExtractionResult<T> {
  value: T | null;
  error?: string;
  /** Tokens consumed by this extraction call, for cost accounting. */
  usage?: { inputTokens?: number; outputTokens?: number };
}

/**
 * Extract structured data from the model with a Zod schema.
 * AI SDK handles schema validation and retries internally — callers get
 * a typed object or a null + error string.
 */
export async function extractStructured<T>(
  opts: StructuredExtractionOptions<T>,
): Promise<StructuredExtractionResult<T>> {
  const model = opts.model ?? DEFAULT_MODEL;
  const start = Date.now();

  try {
    const { object, usage } = await generateObject({
      model,
      schema: opts.schema,
      prompt: opts.prompt,
      system: opts.system,
      maxOutputTokens: opts.maxOutputTokens ?? 2048,
      temperature: opts.temperature ?? 0.1,
    });

    // Record in diagnostics so extraction cost shows up alongside DataForSEO calls
    if (opts.tracer && opts.tag) {
      opts.tracer.add({
        platform: 'chatgpt', // tracer is typed to AIPlatform; chatgpt is the closest marker
        prompt: opts.prompt.slice(0, 100),
        phase: opts.tag,
        status: 'success',
        responseTokens: usage?.outputTokens,
        durationMs: Date.now() - start,
      });
    }

    return {
      value: object,
      usage: {
        inputTokens: usage?.inputTokens,
        outputTokens: usage?.outputTokens,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown extraction error';
    console.error(`[extractStructured] Failed (${model}):`, message);

    if (opts.tracer && opts.tag) {
      opts.tracer.add({
        platform: 'chatgpt',
        prompt: opts.prompt.slice(0, 100),
        phase: opts.tag,
        status: 'error',
        errorMessage: message,
        durationMs: Date.now() - start,
      });
    }

    return { value: null, error: message };
  }
}
