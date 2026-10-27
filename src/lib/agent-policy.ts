/**
 * What loudface.co tells agents it may do with its pages. One place, read by robots.txt
 * (src/app/robots.txt/route.ts) and by the response header set in src/proxy.ts.
 * All allowed: we want to be crawled, quoted and cited, and the bot rules in robots.txt already allow every AI crawler.
 */

/** contentsignals.org: search, ai-input (grounding and live answers), ai-train. */
export const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=yes';

/** IETF AIPREF (draft-ietf-aipref-vocab): train-ai, ai-output, search. */
export const CONTENT_USAGE = 'train-ai=y, ai-output=y, search=y';

export const SITE_ORIGIN = 'https://www.loudface.co';
