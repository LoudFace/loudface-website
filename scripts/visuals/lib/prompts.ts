import fs from 'fs';
import path from 'path';

/**
 * A parsed illustration prompt template. Templates are split into four sections
 * so we can drop the style instructions when a reference image is attached —
 * otherwise the text prompt fights the image and the model ignores the
 * reference's visual style.
 */
export interface IllustrationTemplate {
  name: string;
  model: string;
  /** nano-banana family: aspect_ratio enum (e.g. "16:9") */
  aspectRatio?: string;
  /** nano-banana family: resolution enum ("0.5K" | "1K" | "2K" | "4K") */
  resolution?: string;
  /** gpt-image-1.5 family: image_size enum ("1536x1024" | "1024x1024" | "1024x1536" | "auto") */
  imageSize?: string;
  /** gpt-image-1.5 family: "low" | "medium" | "high" */
  quality?: string;
  /** gpt-image-1.5 family: "low" | "high" — higher = stronger reference adherence */
  inputFidelity?: string;
  /** Subject + composition + mood — always sent. */
  subject: string;
  /** Palette / texture / material — dropped when a reference is attached. */
  style: string;
  /** Content-level excludes (text, logos, faces) — always sent. */
  negativeBase: string;
  /** Aesthetic excludes (3d, gradients, photo-realism) — dropped with reference. */
  negativeStyle: string;
}

const PROMPTS_DIR = path.resolve(process.cwd(), 'scripts/visuals/prompts');

export function readSystemPrompt(): string {
  return fs.readFileSync(path.join(PROMPTS_DIR, 'planner-system.md'), 'utf-8');
}

/**
 * Loads an illustration prompt template by name. Templates live under
 * prompts/illustrations/<name>.md and have YAML-ish frontmatter.
 *
 * New-format templates use four sections: "Subject", "Style", "Negative prompt",
 * "Style negatives". Legacy single-section templates ("Prompt template") are
 * still accepted — their content becomes `subject` and style stays empty.
 */
export function readIllustrationTemplate(name: string): IllustrationTemplate {
  const file = path.join(PROMPTS_DIR, 'illustrations', `${name}.md`);
  if (!fs.existsSync(file)) {
    throw new Error(`Illustration template not found: ${file}`);
  }
  const raw = fs.readFileSync(file, 'utf-8');
  const { frontmatter, body } = splitFrontmatter(raw);

  const readSection = (heading: string): string => {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`##\\s+${escaped}\\s*\\n+([\\s\\S]*?)(?=\\n##\\s+|\\s*$)`);
    const match = body.match(re);
    return match ? match[1].trim() : '';
  };

  let subject = readSection('Subject');
  const style = readSection('Style');
  const negativeBase = readSection('Negative prompt');
  const negativeStyle = readSection('Style negatives');

  // Legacy: old templates used a single "Prompt template" section containing
  // subject + style together. Treat the whole thing as subject so the template
  // still works, just without the split behavior.
  if (!subject) {
    subject = readSection('Prompt template');
    if (!subject) {
      throw new Error(
        `Template ${name} missing "## Subject" section (or legacy "## Prompt template")`,
      );
    }
  }

  return {
    name,
    model: frontmatter.model ?? 'fal-ai/gpt-image-1.5',
    aspectRatio: frontmatter.aspectRatio,
    resolution: frontmatter.resolution,
    imageSize: frontmatter.imageSize,
    quality: frontmatter.quality,
    inputFidelity: frontmatter.inputFidelity,
    subject,
    style,
    negativeBase,
    negativeStyle,
  };
}

function splitFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } {
  if (!raw.startsWith('---\n')) return { frontmatter: {}, body: raw };
  const end = raw.indexOf('\n---\n', 4);
  if (end === -1) return { frontmatter: {}, body: raw };
  const fm = raw.slice(4, end);
  const body = raw.slice(end + 5);
  const frontmatter: Record<string, string> = {};
  for (const line of fm.split('\n')) {
    const match = line.match(/^(\w+):\s*(.+)\s*$/);
    if (match) frontmatter[match[1]] = match[2].trim();
  }
  return { frontmatter, body };
}

/**
 * Phrase appended to the prompt when a reference image is attached, to
 * reinforce that the model should mimic the reference's visual style rather
 * than invent its own.
 */
const REFERENCE_DIRECTIVE =
  'Match the color palette, lighting, materials, texture, and overall visual style of the reference image exactly. Do not introduce stylistic elements that are not present in the reference — even if those elements appear in the reference image as incidental detail (such as readable text or labels), they must not be reproduced.';

/**
 * Turns a comma-separated exclude list into a natural-language constraint
 * sentence. Used because gpt-image-1.5 and nano-banana-2 don't expose a
 * `negative_prompt` field — the only way to suppress content is to tell the
 * model inside the positive prompt.
 */
function toExclusionClause(excludes: string): string {
  if (!excludes.trim()) return '';
  return `The illustration must contain none of the following — this is a strict constraint: ${excludes}. Any readable text, letters, numbers, or labels anywhere in the image are forbidden; use only shapes, icons, and abstract forms.`;
}

export interface RenderPromptResult {
  prompt: string;
  /**
   * Legacy field. Populated for traceability only — neither gpt-image-1.5/edit
   * nor nano-banana-2/edit accept a negative_prompt parameter, so the actual
   * exclusion list is embedded in `prompt` via toExclusionClause() instead.
   */
  negativePrompt: string;
}

/**
 * Renders a template into a final prompt. When a reference image is attached
 * we drop the style block and the style negatives, and append a directive
 * telling the model to follow the reference. Content-level excludes (faces,
 * text, logos) are folded into the positive prompt as a strict constraint
 * sentence because the allowed models don't expose negative_prompt.
 */
export function renderPrompt(
  template: IllustrationTemplate,
  subject: string,
  opts: { hasReference?: boolean } = {},
): RenderPromptResult {
  const subjectRendered = template.subject.replace(/\{\{\s*subject\s*\}\}/g, subject);

  const excludes = opts.hasReference
    ? template.negativeBase
    : [template.negativeBase, template.negativeStyle].filter(Boolean).join(', ');
  const exclusionClause = toExclusionClause(excludes);

  if (opts.hasReference) {
    return {
      prompt: [subjectRendered, exclusionClause, REFERENCE_DIRECTIVE].filter(Boolean).join('\n\n'),
      negativePrompt: excludes,
    };
  }

  return {
    prompt: [subjectRendered, template.style, exclusionClause].filter(Boolean).join('\n\n'),
    negativePrompt: excludes,
  };
}
