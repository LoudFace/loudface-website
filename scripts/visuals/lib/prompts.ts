import fs from 'fs';
import path from 'path';

export interface IllustrationTemplate {
  name: string;
  model: string;
  aspectRatio?: string;
  resolution?: string;
  promptBody: string;
  negativePrompt: string;
}

const PROMPTS_DIR = path.resolve(process.cwd(), 'scripts/visuals/prompts');

export function readSystemPrompt(): string {
  return fs.readFileSync(path.join(PROMPTS_DIR, 'planner-system.md'), 'utf-8');
}

/**
 * Loads an illustration prompt template by name. Templates live under
 * prompts/illustrations/<name>.md and have YAML-ish frontmatter.
 */
export function readIllustrationTemplate(name: string): IllustrationTemplate {
  const file = path.join(PROMPTS_DIR, 'illustrations', `${name}.md`);
  if (!fs.existsSync(file)) {
    throw new Error(`Illustration template not found: ${file}`);
  }
  const raw = fs.readFileSync(file, 'utf-8');
  const { frontmatter, body } = splitFrontmatter(raw);

  const promptMatch = body.match(/## Prompt template\s*\n+([\s\S]*?)(?=\n## |\s*$)/);
  const negativeMatch = body.match(/## Negative prompt\s*\n+([\s\S]*?)(?=\n## |\s*$)/);

  if (!promptMatch) throw new Error(`Template ${name} missing "## Prompt template" section`);

  return {
    name,
    model: frontmatter.model ?? 'fal-ai/nano-banana-pro',
    aspectRatio: frontmatter.aspectRatio,
    resolution: frontmatter.resolution,
    promptBody: promptMatch[1].trim(),
    negativePrompt: negativeMatch?.[1].trim() ?? '',
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

/** Interpolates {{subject}} into the prompt template body. */
export function renderPrompt(template: IllustrationTemplate, subject: string): string {
  return template.promptBody.replace(/\{\{\s*subject\s*\}\}/g, subject);
}
