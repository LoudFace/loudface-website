import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/careers-apply
 *
 * Writes job applications to the Notion DB "Candidates"
 * (database_id hardcoded below — it's a stable identifier, not a secret).
 *
 * Env vars required:
 *   - NOTION_API_KEY (Bearer auth for the Notion integration — same key the
 *     partner-apply route uses). The integration must ALSO be connected to the
 *     Candidates database in Notion, or every write 404s.
 *
 * Defensive, same contract as /api/partner-apply: a Notion outage must never
 * look like a form error to the applicant. On failure we log the full
 * submission under [careers-apply] RECOVERY so it can be replayed from the
 * Vercel function logs, and still return success.
 *
 * If you add a property to the Notion DB, add it here AND in
 * CareersApplicationForm.tsx — otherwise that property stays blank on every row.
 */

const NOTION_API_VERSION = '2022-06-28';
// Notion DB "Candidates" — not a secret, fine to hardcode.
const NOTION_DB_ID = 'c1a5d01d-d3c4-46e5-821f-c397adc8bfda';
const NOTION_API_KEY = process.env.NOTION_API_KEY ?? '';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Notion: Role (select). Values must match the DB options exactly. */
const ROLES = new Set([
  'Designer',
  'Developer',
  'Copywriter',
  'Project Manager',
  'Organic Search Strategist',
]);

/** Notion: Source (select). Set from the ?src= link param, not by the applicant. */
const SOURCES = new Set([
  'Inbound form',
  'Contra',
  'Upwork',
  'LinkedIn',
  'Dribbble',
  'Behance',
  'Referral',
  'Other',
]);

/** Notion: How heard (multi_select). */
const HEARD = new Set([
  'LinkedIn',
  'Instagram',
  'X (Twitter)',
  'Dribbble',
  'Behance',
  'Contra',
  'Referral',
  'Our website',
  'Other',
]);

/** Notion caps a single rich_text object at 2000 characters. */
const RICH_TEXT_LIMIT = 2000;

/** Long answers live in the page body; these are the ones we also summarise. */
const LONG_ANSWER_FIELDS = [
  ['aboutYou', 'About you'],
  ['proofOfWork', 'Proof of work'],
  ['workLinks', 'Work links'],
  ['builtWithAI', 'Built with AI'],
] as const;

interface CareersApplicationPayload {
  name: string;
  email: string;
  role: string;
  linkedin: string;
  portfolio: string;
  loom: string;
  location: string;
  salary: number | null;
  aboutYou: string;
  proofOfWork: string;
  workLinks: string;
  builtWithAI: string;
  heard: string[];
  source: string;
}

function str(value: unknown, max = 4000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      role,
      linkedin,
      portfolio,
      loom,
      location,
      salary,
      aboutYou,
      proofOfWork,
      workLinks,
      builtWithAI,
      heard,
      source,
      company, // honeypot — a real applicant never sees or fills this
      elapsedMs, // milliseconds between page load and submit
    } = body ?? {};

    // ─── Spam gates ───────────────────────────────────────────────
    // Both answer with a success shape so a bot learns nothing from the reply.
    if (typeof company === 'string' && company.trim() !== '') {
      console.warn('[careers-apply] honeypot tripped — discarded.');
      return NextResponse.json({ success: true, message: 'Application received.' }, { status: 200 });
    }
    if (typeof elapsedMs === 'number' && elapsedMs < 3000) {
      console.warn('[careers-apply] submitted in %dms — discarded.', elapsedMs);
      return NextResponse.json({ success: true, message: 'Application received.' }, { status: 200 });
    }

    // ─── Validation ───────────────────────────────────────────────
    const cleanName = str(name, 120);
    const cleanEmail = str(email, 256).toLowerCase();

    if (!cleanName) {
      return NextResponse.json(
        { success: false, message: 'Please enter your name.' },
        { status: 400 },
      );
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 },
      );
    }

    if (typeof role !== 'string' || !ROLES.has(role)) {
      return NextResponse.json(
        { success: false, message: 'Please choose the role you are applying for.' },
        { status: 400 },
      );
    }

    const cleanHeard = Array.isArray(heard) ? heard.filter((h) => HEARD.has(h)).slice(0, 9) : [];

    let cleanSalary: number | null = null;
    if (typeof salary === 'number' && Number.isFinite(salary) && salary > 0) {
      cleanSalary = Math.round(Math.min(salary, 1_000_000));
    }

    const submission: CareersApplicationPayload = {
      name: cleanName,
      email: cleanEmail,
      role,
      linkedin: str(linkedin, 256),
      portfolio: str(portfolio, 256),
      loom: str(loom, 256),
      location: str(location, 120),
      salary: cleanSalary,
      aboutYou: str(aboutYou),
      proofOfWork: str(proofOfWork),
      workLinks: str(workLinks),
      builtWithAI: str(builtWithAI),
      heard: cleanHeard,
      source: typeof source === 'string' && SOURCES.has(source) ? source : 'Inbound form',
    };

    // ─── Write to Notion ─────────────────────────────────────────
    if (NOTION_API_KEY) {
      try {
        await sendToNotion(submission);
      } catch (err) {
        console.error('[careers-apply] Notion error:', err);
        // Recoverable record — replay this from the Vercel function logs.
        console.error('[careers-apply] RECOVERY %s', JSON.stringify(submission));
      }
    } else {
      console.warn('[careers-apply] NOTION_API_KEY not set — skipping Notion write.');
      console.error('[careers-apply] RECOVERY %s', JSON.stringify(submission));
    }

    return NextResponse.json(
      { success: true, message: 'Application received.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('[careers-apply] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 },
    );
  }
}

/* ─── Notion ────────────────────────────────────────────────────── */

/** Only send a URL property Notion will accept — it rejects malformed values. */
function urlProp(value: string): { url: string } | null {
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    new URL(withScheme);
    return { url: withScheme };
  } catch {
    return null;
  }
}

function richText(value: string) {
  return { rich_text: [{ type: 'text', text: { content: value.slice(0, RICH_TEXT_LIMIT) } }] };
}

/** Notion caps a paragraph's rich_text at 2000 chars, so split longer answers. */
function paragraphBlocks(heading: string, value: string) {
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += RICH_TEXT_LIMIT) {
    chunks.push(value.slice(i, i + RICH_TEXT_LIMIT));
  }
  return [
    {
      object: 'block',
      type: 'heading_3',
      heading_3: { rich_text: [{ type: 'text', text: { content: heading } }] },
    },
    ...chunks.map((chunk) => ({
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: chunk } }] },
    })),
  ];
}

async function sendToNotion(s: CareersApplicationPayload): Promise<void> {
  const properties: Record<string, unknown> = {
    Name: { title: [{ type: 'text', text: { content: s.name } }] },
    Email: { email: s.email },
    Role: { select: { name: s.role } },
    Stage: { select: { name: 'New' } },
    Source: { select: { name: s.source } },
    Outreach: { select: { name: 'Not contacted' } },
    'Applied on': { date: { start: new Date().toISOString().slice(0, 10) } },
  };

  const linkedin = urlProp(s.linkedin);
  if (linkedin) properties.LinkedIn = linkedin;

  const portfolio = urlProp(s.portfolio);
  if (portfolio) properties.Portfolio = portfolio;

  const loom = urlProp(s.loom);
  if (loom) properties.Loom = loom;

  if (s.location) properties.Location = richText(s.location);
  if (s.salary !== null) properties['Salary /m USD'] = { number: s.salary };
  if (s.heard.length > 0) {
    properties['How heard'] = { multi_select: s.heard.map((name) => ({ name })) };
  }

  // Summary in the property (scannable in a table view), full text in the body.
  const children: unknown[] = [];
  for (const [key, label] of LONG_ANSWER_FIELDS) {
    const value = s[key];
    if (!value) continue;
    properties[label] = richText(value);
    children.push(...paragraphBlocks(label, value));
  }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_DB_ID },
      properties,
      ...(children.length > 0 ? { children } : {}),
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Notion API ${res.status}: ${errBody.slice(0, 500)}`);
  }
}
