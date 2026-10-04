/**
 * Retry a Sanity read on transient failures (connection resets, timeouts, 5xx).
 *
 * Sanity's edge occasionally drops a connection mid-request — observed in the
 * browser as `QUIC_PROTOCOL_ERROR` / `ERR_CONNECTION_RESET`, and on the server
 * as a thrown fetch error. Because the entire (site) route group renders
 * dynamically (SanityLive is mounted in the layout), every request re-queries
 * Sanity live with no cached/static fallback. So a single dropped connection on
 * an *unguarded* fetch (e.g. fetchItemBySlug) surfaces to the visitor as a 500.
 *
 * One short-backoff retry absorbs that class of blip. A genuinely persistent
 * failure still throws after the final attempt — deliberately, so a real outage
 * surfaces (or 404s via notFound) rather than being silently masked.
 *
 * Each retry asks with a request tag of its own (`retry-2`), passed to `fn`.
 * While Next renders a page it memoizes identical GET fetches, failures
 * included, so a retry that repeated the first request got the first failure
 * back without asking Sanity again, and so did every one of @sanity/client's
 * built-in retries (measured on Genie Teacher, 2026-10-04). The tag gives the
 * retry its own URL; spread it into the fetch options.
 *
 * Each attempt is also cut off after `timeoutMs` by a promise race. A hung read
 * would otherwise wait for the Sanity client's own five-minute timeout, and an
 * abort signal does not help: Next drops it on a fetch it is revalidating.
 */
export async function withRetry<T>(
  fn: (retry: { tag?: string }) => Promise<T>,
  { attempts = 2, baseDelayMs = 300, timeoutMs = 10_000 }: { attempts?: number; baseDelayMs?: number; timeoutMs?: number } = {},
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await withDeadline(fn(attempt === 1 ? {} : { tag: `retry-${attempt}` }), timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt));
      }
    }
  }
  throw lastError;
}

function withDeadline<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Sanity did not answer within ${ms}ms`)), ms);
  });
  return Promise.race([work, deadline]).finally(() => clearTimeout(timer));
}
