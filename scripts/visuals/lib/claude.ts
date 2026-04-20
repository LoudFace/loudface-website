import { requireEnv } from './env';

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4.6';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface GenerateOpts {
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
}

/** Calls an OpenRouter-hosted Claude model and returns the plain text of the response. */
export async function generate({
  system,
  user,
  model = DEFAULT_MODEL,
  maxTokens = 8000,
}: GenerateOpts): Promise<string> {
  const apiKey = requireEnv('OPENROUTER_API_KEY');

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://www.loudface.co',
      'X-Title': 'LoudFace Visuals Pipeline',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (data.error) {
    throw new Error(`OpenRouter error: ${data.error.message ?? JSON.stringify(data.error)}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`No text content in OpenRouter response: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return content;
}

/**
 * Extracts a JSON object from a model response. Strips markdown fences if present.
 * Does not attempt to repair malformed JSON — fails loudly so the caller can retry.
 */
export function extractJson<T = unknown>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in model response');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}
