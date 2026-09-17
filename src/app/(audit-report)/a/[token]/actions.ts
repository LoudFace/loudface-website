'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ACCESS_COOKIE_MAX_AGE,
  accessCodeMatches,
  checkRateLimit,
  clearAttempts,
  isProposalLive,
  recordFailedAttempt,
  signAccessCookie,
} from '@/lib/proposal-access';
import { auditCookieName, isValidProposalToken } from '@/lib/proposal-token';
import { fetchAuditGate } from '@/sanity/lib/proposalsClient';

export interface UnlockState {
  error?: string;
}

/** Same wording for every failure. A distinct "no such audit" message would
 *  turn the form into an oracle for which tokens exist. */
const GENERIC_FAILURE = 'That code did not work. Check the email it came in.';

export async function unlockAudit(
  _previous: UnlockState,
  formData: FormData
): Promise<UnlockState> {
  const token = String(formData.get('token') ?? '');
  const submittedCode = String(formData.get('code') ?? '');

  if (!isValidProposalToken(token)) return { error: GENERIC_FAILURE };
  if (!submittedCode.trim()) return { error: 'Enter the access code.' };

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get('cf-connecting-ip') ??
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  // Namespaced so an audit and a proposal sharing an IP do not share a counter.
  const rateKey = `audit:${token}:${ip}`;

  if (!checkRateLimit(rateKey).allowed) {
    return { error: 'Too many tries. Wait 15 minutes, then try again.' };
  }

  const gate = await fetchAuditGate(token);
  if (!gate || !isProposalLive(gate) || !accessCodeMatches(submittedCode, gate.accessCode)) {
    recordFailedAttempt(rateKey);
    return { error: GENERIC_FAILURE };
  }

  clearAttempts(rateKey);

  const cookieStore = await cookies();
  cookieStore.set(auditCookieName(token), signAccessCookie(token, gate.accessCode), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // Scoped to this audit only: the cookie is useless on any other URL.
    path: `/a/${token}`,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  redirect(`/a/${token}?unlocked=1`);
}
