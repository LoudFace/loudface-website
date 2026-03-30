import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { nanoid } from 'nanoid';
import { setAuditRecord, getRedis } from '@/lib/audit/pipeline';
import { runAudit } from '@/lib/audit/pipeline';
import type { AuditRecord } from '@/lib/audit/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;

// Rate limits
const PER_IP_LIMIT = 3;       // audits per IP per window
const PER_IP_WINDOW = 86400;  // 24 hours in seconds
const GLOBAL_LIMIT = 50;      // audits per global window
const GLOBAL_WINDOW = 3600;   // 1 hour in seconds

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
    const body = await request.json();
    const { url, email, companyName, industry } = body;

    // ─── Validation ───────────────────────────────────────────────
    if (!url || !email || !companyName) {
      return NextResponse.json(
        { error: 'url, email, and companyName are required' },
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

    if (companyName.length > 100) {
      return NextResponse.json(
        { error: 'Company name must be 100 characters or fewer' },
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

    // ─── Create Audit Record ──────────────────────────────────────
    const id = nanoid(12);
    const record: AuditRecord = {
      id,
      input: {
        url: normalizedUrl,
        email: email.trim().toLowerCase(),
        companyName: companyName.trim(),
        ...(industry ? { industry: industry.trim() } : {}),
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
