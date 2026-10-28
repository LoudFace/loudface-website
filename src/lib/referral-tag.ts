/**
 * The tracking tag of the link that first brought a visitor (Arnel, 28 Oct 2026: every Social contest result must
 * be provable). A teammate's link carries utm_content=<their tag> (the Team App's Playbook gives it: andrea, abhay,
 * ...). The proxy keeps the first tag it sees in a first-party cookie for 30 days, and every Cal.com booking carries
 * it as metadata[lf_tag], the route _fbp already takes. The Team App reads it back from Cal.com to see whose link
 * brought a discovery call. The booking's utm_content field keeps the page the booking was made on.
 */
export const REFERRAL_TAG_COOKIE = 'lf_tag';
export const REFERRAL_TAG_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** A tag is a short lowercase slug; anything else (a page path, a sentence, markup) is not kept. */
export function cleanReferralTag(value: string | null | undefined): string | undefined {
  const tag = value?.trim().toLowerCase();
  return tag && /^[a-z0-9][a-z0-9_-]{0,39}$/.test(tag) ? tag : undefined;
}

/**
 * Browser only. The cookie first; then the page's own utm_content, for a visitor whose first page the proxy does
 * not run on (/audit) or whose browser refused the cookie.
 */
export function readReferralTag(): string | undefined {
  const prefix = `${REFERRAL_TAG_COOKIE}=`;
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return (
    cleanReferralTag(cookie ? decodeURIComponent(cookie.slice(prefix.length)) : undefined) ??
    cleanReferralTag(new URLSearchParams(window.location.search).get('utm_content'))
  );
}
