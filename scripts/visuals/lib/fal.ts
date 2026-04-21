import { fal } from '@fal-ai/client';
import { requireEnv } from './env';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

let configured = false;

function configure() {
  if (configured) return;
  fal.config({ credentials: requireEnv('FAL_KEY') });
  configured = true;
}

export interface GenerateImageOpts {
  /** fal.ai model endpoint, e.g. "fal-ai/gpt-image-1.5" or "fal-ai/nano-banana-2" */
  model: string;
  prompt: string;
  /**
   * Legacy field. Neither gpt-image-1.5/edit nor nano-banana-2/edit accept a
   * negative_prompt parameter, so this is no longer sent to the API — it's
   * accepted here only for backward compatibility and recorded in cache metadata.
   */
  negativePrompt?: string;
  /** nano-banana family: aspect ratio enum (e.g. "16:9") */
  aspectRatio?: string;
  /** nano-banana family: resolution enum ("0.5K" | "1K" | "2K" | "4K") */
  resolution?: string;
  /** gpt-image-1.5 family: "1536x1024" | "1024x1024" | "1024x1536" | "auto" */
  imageSize?: string;
  /** gpt-image-1.5 family: "low" | "medium" | "high" */
  quality?: string;
  /** gpt-image-1.5 family: "low" | "high" — higher = stronger reference adherence */
  inputFidelity?: string;
  /**
   * Optional reference image URLs. When set, the model endpoint is switched to
   * the `/edit` variant (e.g. `fal-ai/gpt-image-1.5` → `fal-ai/gpt-image-1.5/edit`)
   * and the URLs are passed as `image_urls`, acting as style anchors.
   */
  imageUrls?: string[];
  /** Extra model-specific params merged into the request */
  extras?: Record<string, unknown>;
  /** Where to save the resulting PNG */
  outputPath: string;
  /** Cache directory for sha-keyed hits */
  cacheDir: string;
}

export interface GenerateImageResult {
  localPath: string;
  sha: string;
  requestId: string;
  cached: boolean;
  finalPrompt: string;
}

function sha(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

/**
 * Detect model family so we know which parameter shape to send.
 * gpt-image-1.5 uses image_size/quality/input_fidelity.
 * nano-banana family uses aspect_ratio/resolution.
 */
function isGptImageModel(endpoint: string): boolean {
  return endpoint.includes('gpt-image');
}

/**
 * Uploads a local file to fal storage and returns a public URL that fal
 * endpoints can fetch. Used for style-reference images when the user
 * provides a local path instead of a URL.
 */
export async function uploadLocalFile(filePath: string): Promise<string> {
  configure();
  const bytes = fs.readFileSync(filePath);
  const mime = filePath.endsWith('.png')
    ? 'image/png'
    : filePath.endsWith('.webp')
      ? 'image/webp'
      : filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')
        ? 'image/jpeg'
        : 'application/octet-stream';
  const file = new File([new Uint8Array(bytes)], path.basename(filePath), { type: mime });
  return fal.storage.upload(file);
}

/**
 * Generates an image via fal.ai. Caches by sha(model + prompt + negative) so
 * re-runs with the same inputs are free.
 */
export async function generateImage(opts: GenerateImageOpts): Promise<GenerateImageResult> {
  configure();

  const hasRefs = (opts.imageUrls?.length ?? 0) > 0;
  // When image_urls are provided, route to the model's /edit variant.
  const endpoint = hasRefs && !opts.model.endsWith('/edit') ? `${opts.model}/edit` : opts.model;

  const cacheKey = sha(
    [
      endpoint,
      opts.prompt,
      opts.aspectRatio ?? '',
      opts.resolution ?? '',
      opts.imageSize ?? '',
      opts.quality ?? '',
      opts.inputFidelity ?? '',
      (opts.imageUrls ?? []).join('|'),
    ].join('::'),
  );
  const cachePath = path.join(opts.cacheDir, `${cacheKey}.png`);
  const metaPath = path.join(opts.cacheDir, `${cacheKey}.json`);

  fs.mkdirSync(opts.cacheDir, { recursive: true });
  fs.mkdirSync(path.dirname(opts.outputPath), { recursive: true });

  if (fs.existsSync(cachePath) && fs.existsSync(metaPath)) {
    fs.copyFileSync(cachePath, opts.outputPath);
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    return {
      localPath: opts.outputPath,
      sha: cacheKey,
      requestId: meta.requestId,
      cached: true,
      finalPrompt: meta.finalPrompt ?? opts.prompt,
    };
  }

  // Branch on model family: gpt-image-1.5 and nano-banana-2 take incompatible
  // param sets. Neither supports negative_prompt, so excludes must live in the
  // positive prompt text (handled upstream in renderPrompt).
  const input: Record<string, unknown> = {
    prompt: opts.prompt,
    ...(hasRefs && { image_urls: opts.imageUrls }),
  };

  if (isGptImageModel(endpoint)) {
    if (opts.imageSize) input.image_size = opts.imageSize;
    if (opts.quality) input.quality = opts.quality;
    if (opts.inputFidelity) input.input_fidelity = opts.inputFidelity;
  } else {
    if (opts.aspectRatio) input.aspect_ratio = opts.aspectRatio;
    if (opts.resolution) input.resolution = opts.resolution;
  }

  Object.assign(input, opts.extras ?? {});

  const result = await fal.subscribe(endpoint, { input, logs: false });

  const imagesField = (result.data as { images?: Array<{ url: string }> } | undefined)?.images;
  const imageUrl = imagesField?.[0]?.url;
  if (!imageUrl) {
    throw new Error(`fal.ai response missing images[0].url for model ${opts.model}`);
  }

  const requestId = (result.requestId as string) ?? 'unknown';

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());

  fs.writeFileSync(cachePath, bytes);
  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        requestId,
        model: endpoint,
        finalPrompt: opts.prompt,
        negativePrompt: opts.negativePrompt ?? '',
        imageUrls: opts.imageUrls ?? [],
      },
      null,
      2,
    ),
  );
  fs.copyFileSync(cachePath, opts.outputPath);

  return {
    localPath: opts.outputPath,
    sha: cacheKey,
    requestId,
    cached: false,
    finalPrompt: opts.prompt,
  };
}
