import { NextRequest, NextResponse } from 'next/server';
import { fetchApplicationOpening } from '@/lib/careers-data';
import { CONTACT_EMAIL } from '@/lib/site-contact';

/**
 * POST /api/careers-apply
 *
 * Files job applications as Candidates in the hiring app, a self-hosted Twenty
 * at recruiting.loudface.co (repo LoudFace/loudface-hiring).
 *
 * Env var required:
 *   - HIRING_TWENTY_API_KEY: the hiring app's "careers-form" key. Its role may
 *     read, create and update Candidates and nothing else.
 *
 * One Candidate per email. Someone who applies again updates their record
 * (new answers on top, old ones kept) instead of becoming a second row.
 *
 * DELIBERATELY UNLIKE /api/partner-apply, which returns success even when its
 * write fails. This endpoint does not: it retries once, and if the application
 * still is not stored it says so and points the applicant at CONTACT_EMAIL
 * with their answers still on screen. Telling a candidate "received" when
 * nothing was stored means they wait for a reply that can never come, and we
 * never learn they existed. The full submission is also logged under
 * [careers-apply] RECOVERY for replay from the Vercel logs.
 *
 * The form's role, source and "how heard" values are still the Notion-era
 * labels (Hiring Openings lives in Notion); the maps below turn them into the
 * hiring app's option values. A new form field needs a line in
 * buildCandidateRecord, or it is dropped.
 */

const HIRING_CANDIDATES_URL = 'https://recruiting.loudface.co/rest/candidates';
const HIRING_API_KEY = process.env.HIRING_TWENTY_API_KEY ?? '';

// Quotes, backslashes, commas and brackets are refused: the address goes into the hiring app's
// lookup filter, where those characters would change what the filter matches.
const EMAIL_REGEX = /^[^\s@"'\\,()]+@[^\s@"'\\,()]+\.[^\s@"'\\,()]+$/;

/** Form role label -> the hiring app's hiringRole option. */
const ROLE_OPTIONS: Record<string, string> = {
  Designer: 'DESIGNER',
  Developer: 'DEVELOPER',
  Copywriter: 'COPYWRITER',
  'Project Manager': 'PROJECT_MANAGER',
  'Organic Search Strategist': 'ORGANIC_SEARCH_STRATEGIST',
};

/** ?src= link label -> the hiring app's source option. Set by the link, not the applicant. */
const SOURCE_OPTIONS: Record<string, string> = {
  'Inbound form': 'INBOUND_FORM',
  Contra: 'CONTRA',
  Upwork: 'UPWORK',
  LinkedIn: 'LINKEDIN',
  Dribbble: 'DRIBBBLE',
  Behance: 'BEHANCE',
  Referral: 'REFERRAL',
  Other: 'OTHER',
};
const DEFAULT_SOURCE = 'Inbound form';

/** Stages a returning applicant is moved out of, back to New. Anyone further along keeps their place. */
const REOPENED_STAGES = new Set(['TALENT_POOL', 'REJECTED']);

/** The answers a person can give to "how did you hear about us". */
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

/** Written answers, stored together in the candidate's applicationAnswers. */
const WRITTEN_ANSWERS = [
  ['aboutYou', 'About you'],
  ['proofOfWork', 'Proof of work'],
  ['builtWithAI', 'Built with AI'],
] as const;

export interface CareersApplicationPayload {
  name: string;
  email: string;
  role: string;
  /** Human title of the vacancy they applied to, when they came through one. */
  openingTitle: string | null;
  linkedin: string;
  portfolio: string;
  loom: string;
  location: string;
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
      openingId,
      linkedin,
      portfolio,
      loom,
      location,
      aboutYou,
      proofOfWork,
      workLinks,
      builtWithAI,
      heard,
      source,
      company, // honeypot; a real applicant never sees or fills this
      elapsedMs, // milliseconds between page load and submit
    } = body ?? {};

    // ─── Spam gates ───────────────────────────────────────────────
    // Both answer with a success shape so a bot learns nothing from the reply.
    if (typeof company === 'string' && company.trim() !== '') {
      console.warn('[careers-apply] honeypot tripped; discarded.');
      return NextResponse.json({ success: true, message: 'Application received.' }, { status: 200 });
    }
    if (typeof elapsedMs === 'number' && elapsedMs < 3000) {
      console.warn('[careers-apply] submitted in %dms; discarded.', elapsedMs);
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

    let cleanRole = '';
    let openingTitle: string | null = null;

    if (typeof openingId === 'string' && openingId.trim()) {
      const openingResult = await fetchApplicationOpening(openingId, { fresh: true });

      if (openingResult.status === 'unavailable') {
        return NextResponse.json(
          {
            success: false,
            message: 'We could not verify this opening. Please try again in a moment.',
          },
          { status: 502 },
        );
      }

      if (openingResult.status !== 'open') {
        return NextResponse.json(
          {
            success: false,
            message: 'This role is no longer accepting applications.',
          },
          { status: 400 },
        );
      }

      cleanRole = openingResult.opening.roleKey;
      openingTitle = openingResult.opening.title;
    } else if (typeof role === 'string' && Object.hasOwn(ROLE_OPTIONS, role)) {
      cleanRole = role;
    } else {
      return NextResponse.json(
        { success: false, message: 'Please choose the role you are applying for.' },
        { status: 400 },
      );
    }

    const cleanHeard = Array.isArray(heard) ? heard.filter((h) => HEARD.has(h)).slice(0, 9) : [];

    const submission: CareersApplicationPayload = {
      name: cleanName,
      email: cleanEmail,
      role: cleanRole,
      openingTitle,
      linkedin: str(linkedin, 256),
      portfolio: str(portfolio, 256),
      loom: str(loom, 256),
      location: str(location, 120),
      aboutYou: str(aboutYou),
      proofOfWork: str(proofOfWork),
      workLinks: str(workLinks),
      builtWithAI: str(builtWithAI),
      heard: cleanHeard,
      source: typeof source === 'string' && Object.hasOwn(SOURCE_OPTIONS, source) ? source : DEFAULT_SOURCE,
    };

    // ─── File in the hiring app ──────────────────────────────────
    let stored = false;

    if (HIRING_API_KEY) {
      stored = await fileCandidateWithRetry(submission);
    } else {
      console.error('[careers-apply] HIRING_TWENTY_API_KEY not set; cannot store application.');
    }

    if (!stored) {
      // Never tell someone their application was received when it was not
      // stored. A silent swallow here means the candidate waits for a reply
      // that can never come, and we never learn they existed. The full
      // submission is logged so it can still be recovered from Vercel logs.
      console.error('[careers-apply] RECOVERY %s', JSON.stringify(submission));
      return NextResponse.json(
        {
          success: false,
          message:
            `We couldn't save your application just now. That's on us, not you. Your answers are still on this page. Please copy them into an email to ${CONTACT_EMAIL}, and we'll pick it up from there.`,
        },
        { status: 502 },
      );
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

/* ─── Hiring app (Twenty) ───────────────────────────────────────── */

/** How much of the hiring app's error reply goes into the log line. */
const ERROR_BODY_LOG_CHARS = 500;

class HiringRequestError extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message);
    this.name = 'HiringRequestError';
  }
}

/**
 * One retry, and only for failures a retry can fix (network blips, 429s, 5xx).
 * A 4xx is a key or schema mistake; retrying it only doubles the wait before
 * the same failure.
 *
 * Returns true only when the application is genuinely stored.
 */
async function fileCandidateWithRetry(s: CareersApplicationPayload): Promise<boolean> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await fileCandidate(s);
      return true;
    } catch (err) {
      const retryable = err instanceof HiringRequestError ? err.retryable : true;
      console.error('[careers-apply] hiring app write failed (attempt %d):', attempt, err);
      if (!retryable || attempt === 2) return false;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  return false;
}

interface LinkValue {
  primaryLinkUrl: string;
  primaryLinkLabel: string;
}

/** The hiring app refuses a link it cannot parse, so only send one it will accept. */
function linkValue(value: string, label: string): LinkValue | null {
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    new URL(withScheme);
    return { primaryLinkUrl: withScheme, primaryLinkLabel: label };
  } catch {
    return null;
  }
}

function answersBlock(s: CareersApplicationPayload, appliedAt: Date): string {
  const heading = `=== Application ${appliedAt.toISOString().slice(0, 10)} · ${s.openingTitle ?? s.role} ===`;
  const answers = WRITTEN_ANSWERS.filter(([key]) => s[key]).map(([key, label]) => `${label}:\n${s[key]}`);
  return [heading, ...(answers.length > 0 ? answers : ['(no written answers)'])].join('\n\n');
}

/** A first-time applicant's Candidate record. */
export function buildCandidateRecord(
  s: CareersApplicationPayload,
  appliedAt: Date,
): Record<string, unknown> {
  const record: Record<string, unknown> = {
    name: s.name,
    email: { primaryEmail: s.email },
    hiringRole: ROLE_OPTIONS[s.role],
    roleTagNote: s.openingTitle
      ? `Applied to the opening "${s.openingTitle}"`
      : 'Chose this role on the careers form',
    roleConfidence: 'HIGH',
    stage: 'NEW',
    waitingOn: 'AGENT',
    source: SOURCE_OPTIONS[s.source],
    appliedAt: appliedAt.toISOString(),
    timesApplied: 1,
    applicationAnswers: answersBlock(s, appliedAt),
  };

  const links = [
    ['linkedin', linkValue(s.linkedin, 'LinkedIn')],
    ['portfolio', linkValue(s.portfolio, 'Portfolio')],
    ['applicationVideo', linkValue(s.loom, 'Video')],
  ] as const;
  for (const [field, link] of links) {
    if (link) record[field] = link;
  }

  if (s.location) record.location = s.location;
  if (s.workLinks) record.workLinks = s.workLinks;
  if (s.heard.length > 0) record.howHeard = s.heard.join(', ');

  return record;
}

/** A repeat application never renames the person; stage, waiting-on, the count and the answers follow their own rules below. */
const FIELDS_NOT_COPIED_ON_REPEAT = ['name', 'email', 'stage', 'waitingOn', 'timesApplied', 'applicationAnswers'];

export interface ExistingCandidate {
  id: string;
  stage: string | null;
  timesApplied: number | null;
  applicationAnswers: string | null;
}

/**
 * What changes on a Candidate who applies again. Their new answers go on top of
 * the old ones, and they return to New for screening unless they are already
 * mid-process (shortlisted, call booked, offer), where a second form must not
 * move them backwards.
 */
export function buildRepeatApplicationUpdate(
  existing: ExistingCandidate,
  s: CareersApplicationPayload,
  appliedAt: Date,
): Record<string, unknown> {
  const fresh = buildCandidateRecord(s, appliedAt);
  const { stage, waitingOn, applicationAnswers } = fresh;
  for (const field of FIELDS_NOT_COPIED_ON_REPEAT) delete fresh[field];
  const reopened = existing.stage === null || REOPENED_STAGES.has(existing.stage);

  return {
    ...fresh,
    ...(reopened ? { stage, waitingOn } : {}),
    timesApplied: (existing.timesApplied ?? 1) + 1,
    applicationAnswers: [applicationAnswers, existing.applicationAnswers].filter(Boolean).join('\n\n'),
  };
}

/** A hung hiring app must fail the attempt, not hold the applicant's request open. */
const HIRING_REQUEST_TIMEOUT_MS = 8000;

async function hiringRequest(url: string, init: { method: string; body?: unknown }): Promise<unknown> {
  const res = await fetch(url, {
    method: init.method,
    signal: AbortSignal.timeout(HIRING_REQUEST_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${HIRING_API_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new HiringRequestError(
      `Hiring app ${init.method} ${res.status}: ${errBody.slice(0, ERROR_BODY_LOG_CHARS)}`,
      res.status === 429 || res.status >= 500,
    );
  }
  return res.json();
}

async function findCandidateByEmail(email: string): Promise<ExistingCandidate | null> {
  const query = new URLSearchParams({ filter: `email.primaryEmail[eq]:"${email}"`, limit: '1' });
  const found = (await hiringRequest(`${HIRING_CANDIDATES_URL}?${query}`, { method: 'GET' })) as {
    data?: { candidates?: ExistingCandidate[] };
  };
  const candidates = found.data?.candidates;
  if (!candidates) throw new HiringRequestError('Hiring app lookup returned no candidates list', false);
  return candidates[0] ?? null;
}

async function fileCandidate(s: CareersApplicationPayload): Promise<void> {
  const appliedAt = new Date();
  const existing = await findCandidateByEmail(s.email);

  if (existing) {
    // The retry can arrive after a write that did land (the reply was lost). Their answers
    // are then already on top of the record, and filing them again would count the application twice.
    if (existing.applicationAnswers?.startsWith(answersBlock(s, appliedAt))) return;
    await hiringRequest(`${HIRING_CANDIDATES_URL}/${existing.id}`, {
      method: 'PATCH',
      body: buildRepeatApplicationUpdate(existing, s, appliedAt),
    });
    return;
  }
  await hiringRequest(HIRING_CANDIDATES_URL, { method: 'POST', body: buildCandidateRecord(s, appliedAt) });
}
