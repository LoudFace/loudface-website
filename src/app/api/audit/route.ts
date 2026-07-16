import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { nanoid } from 'nanoid';
import { setAuditRecord, getRedis } from '@/lib/audit/pipeline';
import { runAudit } from '@/lib/audit/pipeline';
import { extractBrandFromUrl, normalizeBrandName } from '@/lib/audit/extract-brand';
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
    // Redis is the only thing standing between us and uncapped paid-pipeline
    // spend, so an outage must fail CLOSED for the cost-relevant path — never
    // silently allow unlimited runs while we can't count them.
    console.error('[RateLimit] Redis error, failing closed:', err);
    return 'Service temporarily unavailable. Please try again shortly.';
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, email } = body;

    // ─── Validation ───────────────────────────────────────────────
    if (!url || !email) {
      return NextResponse.json(
        { error: 'url and email are required' },
        { status: 400 },
      );
    }

    if (typeof url !== 'string' || typeof email !== 'string' || url.length > 2048 || email.length > 320) {
      return NextResponse.json(
        { error: 'Invalid website URL' },
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
    // Prefer Vercel's own non-spoofable client-IP header. `x-forwarded-for` is
    // attacker-controlled at the FRONT of the chain (Vercel appends the real
    // client IP at the end), so reading the first entry lets anyone bypass
    // the per-IP cap by sending a fake header.
    const vercelForwarded = request.headers.get('x-vercel-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const forwarded = request.headers.get('x-forwarded-for');
    const forwardedLast = forwarded?.split(',').pop()?.trim();
    const ip = vercelForwarded?.split(',')[0]?.trim() || realIp?.trim() || forwardedLast || 'unknown';

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
    const normalizedEmail = email.trim().toLowerCase();

    // ─── Idempotency (double-submit / retry guard) ─────────────────
    // A fresh nanoid + full paid pipeline runs on every POST, so a network
    // retry or a double-click would otherwise kick off two audits for the
    // same url+email. Claim a short-lived lock keyed on the normalized
    // input; if someone already claimed it in the last ~2 minutes, hand back
    // their audit id instead of starting a new run. Fails OPEN here only —
    // this is a cost nicety, not a security control, so a Redis hiccup
    // should never block a real submission.
    const idempotencyKey = `audit:idempotency:${normalizedUrl.toLowerCase()}:${normalizedEmail}`;
    const id = nanoid(12);
    try {
      const redis = await getRedis();
      const lockAcquired = await redis.set(idempotencyKey, id, { NX: true, EX: 120 });
      if (!lockAcquired) {
        const existingId = await redis.get(idempotencyKey);
        if (existingId) {
          return NextResponse.json({ id: existingId }, { status: 200 });
        }
      }
    } catch (err) {
      console.warn('[API] Idempotency check failed, proceeding normally:', err);
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
    // `id` was already generated above to seed the idempotency lock.
    const record: AuditRecord = {
      id,
      input: {
        url: normalizedUrl,
        email: normalizedEmail,
        companyName: extracted.name,
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
