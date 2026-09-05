/**
 * Proposal access tokens and access codes.
 *
 * Isomorphic on purpose: the Sanity Studio (browser) calls these from the
 * `proposal` schema's initialValue so Arnel never invents a token by hand,
 * and the Next.js server calls them to validate the shape of an incoming
 * /p/<token> URL.
 *
 * The token is the ONLY thing standing between a stranger and the URL of a
 * proposal, so it must be non-guessable: 26 characters from a 32-symbol
 * alphabet is 130 bits of entropy. The access code in front of the content
 * is the second factor; it can be short because attempts are rate-limited.
 */

/** 32 symbols, no 0/O/1/l — a token still has to survive being read aloud. */
const TOKEN_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

/** Access codes are typed by a client, so keep them uppercase and unambiguous. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const PROPOSAL_TOKEN_LENGTH = 26;
export const PROPOSAL_TOKEN_PATTERN = /^[a-z0-9]{20,64}$/;

function randomChars(alphabet: string, length: number): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = '';
  // The alphabets are 32 symbols, an exact power of two, so masking the low
  // 5 bits is uniform — no modulo bias, no rejection loop.
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i] & 31];
  return out;
}

/** A URL token: `loudface.co/p/<token>`. */
export function generateProposalToken(length: number = PROPOSAL_TOKEN_LENGTH): string {
  return randomChars(TOKEN_ALPHABET, length);
}

/** An access code the client types into the gate. Grouped for readability. */
export function generateAccessCode(): string {
  return `${randomChars(CODE_ALPHABET, 4)}-${randomChars(CODE_ALPHABET, 4)}`;
}

/** Cheap shape check so a junk URL never reaches the Content Lake. */
export function isValidProposalToken(value: string | undefined | null): value is string {
  return typeof value === 'string' && PROPOSAL_TOKEN_PATTERN.test(value);
}

/** The httpOnly cookie that records "this browser passed the gate". */
export function proposalCookieName(token: string): string {
  return `lf_p_${token}`;
}
