import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { nanoid } from 'nanoid';
import { setAuditRecord, getRedis } from '@/lib/audit/pipeline';
import { runAudit } from '@/lib/audit/pipeline';
import { extractBrandFromUrl, normalizeBrandName } from '@/lib/audit/extract-brand';
import type { AuditRecord, UserCompetitor } from '@/lib/audit/types';

export const runtime = 'nodejs';
export const maxDuration = 600;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;

// Rate limits
const PER_IP_LIMIT = 3;       // audits per IP per window
const PER_IP_WINDOW = 86400;  // 24 hours in seconds
const GLOBAL_LIMIT = 50;      // audits per global window
const GLOBAL_WINDOW = 3600;   // 1 hour in seconds

function cleanText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
  return cleaned || undefined;
}

function titleCaseDomainRoot(root: string): string {
  return root
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function parseCompetitorToken(rawToken: string): UserCompetitor | null {
  const raw = rawToken.trim();
  if (!raw) return null;

  let domain = '';
  let name = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');

  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(withProtocol);
    if (parsed.hostname.includes('.')) {
      domain = parsed.hostname.replace(/^www\./i, '').toLowerCase();
      name = titleCaseDomainRoot(domain.split('.')[0] ?? domain);
    }
  } catch {
    if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(name)) {
      domain = name.toLowerCase();
      name = titleCaseDomainRoot(domain.split('.')[0] ?? domain);
    } else {
      domain = raw.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9-]/g, '');
      name = titleCaseDomainRoot(raw);
    }
  }

  if (!name || !domain) return null;
  return { raw, name: name.slice(0, 80), domain: domain.slice(0, 120) };
}

function parseUserCompetitors(input: unknown): UserCompetitor[] {
  if (typeof input !== 'string') return [];
  const seen = new Set<string>();
  const competitors: UserCompetitor[] = [];

  for (const token of input.split(/[\n,;]+/)) {
    const parsed = parseCompetitorToken(token);
    if (!parsed) continue;
    const key = parsed.domain || parsed.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    competitors.push(parsed);
    if (competitors.length >= 5) break;
  }

  return competitors;
}

function getMissingAuditConfig(): string[] {
  const required = [
    'REDIS_URL',
    'DATAFORSEO_LOGIN',
    'DATAFORSEO_PASSWORD',
    'OPENROUTER_API_KEY',
  ];
  return required.filter((key) => !process.env[key]);
}

/**
 * Check rate limits against Redis. Returns null if OK, or an error message string.
 */
async function checkRateLimit(ip: string): Promise<string | null> {
  try {
    const redis = await getRedis();

    // Per-IP rate limit
    const ipKey = `ratelimit:audit:ip:${ip}`;
    const ipCount = await redis.incr(ipKey);
    if (ipCount === 1) {
      await redis.expire(ipKey, PER_IP_WINDOW);
    }
    if (ipCount > PER_IP_LIMIT) {
      return `Rate limit exceeded. Maximum ${PER_IP_LIMIT} audits per 24 hours. Try again later.`;
    }

    // Global rate limit (safety cap for DataForSEO spend)
    const globalKey = 'ratelimit:audit:global';
    const globalCount = await redis.incr(globalKey);
    if (globalCount === 1) {
      await redis.expire(globalKey, GLOBAL_WINDOW);
    }
    if (globalCount > GLOBAL_LIMIT) {
      return 'Service is temporarily busy. Please try again in a few minutes.';
    }

    return null;
  } catch (err) {
    // If Redis is down, allow the request (fail open) but log the error
    console.error('[RateLimit] Redis error, allowing request:', err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const missingConfig = getMissingAuditConfig();
    if (missingConfig.length > 0) {
      console.error('[API] Audit service missing runtime config:', missingConfig.join(', '));
      return NextResponse.json(
        { error: 'Audit service is not configured yet. Please try again later.' },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { url, email } = body;
    const contactName = cleanText(body.contactName, 100);
    const submittedCompanyName = cleanText(body.companyName, 100);
    const buyerPersona = cleanText(body.buyerPersona, 200);
    const userCompetitors = parseUserCompetitors(body.competitors);

    // ─── Validation ───────────────────────────────────────────────
    if (!url || !email) {
      return NextResponse.json(
        { error: 'url and email are required' },
        { status: 400 },
      );
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 },
      );
    }

    if (!URL_RE.test(url)) {
      return NextResponse.json(
        { error: 'Invalid website URL' },
        { status: 400 },
      );
    }

    // ─── Rate Limiting ──────────────────────────────────────────
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';

    const rateLimitError = await checkRateLimit(ip);
    if (rateLimitError) {
      return NextResponse.json(
        { error: rateLimitError },
        { status: 429 },
      );
    }

    // ─── Normalize URL ────────────────────────────────────────────
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // ─── Extract brand from the URL ───────────────────────────────
    // This replaces the user-typed companyName + industry fields.
    // The extractor pulls from JSON-LD Organization → og:site_name → <title> → domain.
    let extracted = await extractBrandFromUrl(normalizedUrl);
    if (!extracted) {
      return NextResponse.json(
        { error: 'Could not resolve that URL. Check the domain and try again.' },
        { status: 400 },
      );
    }

    // If the site blocked our fetch and we fell back to the domain root,
    // ask Haiku to split concatenated multi-word brands (warbyparker → "Warby Parker").
    // Fails silently — worst case we keep the domain-root name.
    if (extracted.source === 'domain-fallback') {
      try {
        extracted = await normalizeBrandName(extracted);
      } catch (err) {
        console.warn('[API] Brand normalization failed, keeping fallback name:', err);
      }
    }

    // ─── Create Audit Record ──────────────────────────────────────
    const id = nanoid(12);
    const record: AuditRecord = {
      id,
      input: {
        url: normalizedUrl,
        email: email.trim().toLowerCase(),
        companyName: extracted.name,
        contactName,
        submittedCompanyName,
        userCompetitors,
        buyerPersona,
        brandSource: extracted.source,
      },
      status: 'processing',
      progress: 0,
      currentPhase: 'Starting audit...',
      createdAt: new Date().toISOString(),
    };

    await setAuditRecord(record);

    // ─── Fire Background Processing ───────────────────────────────
    after(async () => {
      await runAudit(id);
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[API] POST /api/audit error:', err);
    return NextResponse.json(
      { error: 'Failed to create audit' },
      { status: 500 },
    );
  }
}
