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
import { isValidProposalToken, proposalCookieName } from '@/lib/proposal-token';
import { fetchProposalGate } from '@/sanity/lib/proposalsClient';

export interface UnlockState {
  error?: string;
}

/** Same wording for every failure. A distinct "no such proposal" message would
 *  turn the form into an oracle for which tokens exist. */
const GENERIC_FAILURE = 'That code did not work. Check the email it came in.';

export async function unlockProposal(
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
  const rateKey = `${token}:${ip}`;

  if (!checkRateLimit(rateKey).allowed) {
    return { error: 'Too many tries. Wait 15 minutes, then try again.' };
  }

  const gate = await fetchProposalGate(token);
  if (!gate || !isProposalLive(gate) || !accessCodeMatches(submittedCode, gate.accessCode)) {
    recordFailedAttempt(rateKey);
    return { error: GENERIC_FAILURE };
  }

  clearAttempts(rateKey);

  const cookieStore = await cookies();
  cookieStore.set(proposalCookieName(token), signAccessCookie(token, gate.accessCode), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // Scoped to this proposal only: the cookie is useless on any other URL.
    path: `/p/${token}`,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  // ?unlocked=1 tells the page this visit is the moment the gate opened, so
  // the analytics component can fire proposal_unlocked exactly once. The page
  // strips it from the URL after reading it.
  redirect(`/p/${token}?unlocked=1`);
}
