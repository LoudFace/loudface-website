/**
 * IndexNow ping helper.
 *
 * IndexNow is a free, simple protocol shared by Bing, Yandex, Seznam, Naver,
 * and downstream AI engines that rely on Bing's index (notably ChatGPT search).
 * Submitting URLs here gets them re-crawled within minutes instead of waiting
 * days for organic discovery.
 *
 * Spec: https://www.indexnow.org/documentation
 *
 * The "secret" here is not a secret — it's a public key file served at
 * `${origin}/${key}.txt`. IndexNow verifies authorship by fetching that file
 * and confirming the contents equal the key. So this module is safe to call
 * from anywhere on the server.
 */

const HOST = 'www.loudface.co';
const ORIGIN = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

export function indexNowKey(): string | null {
  return process.env.INDEXNOW_KEY ?? null;
}

/**
 * Submit one or more URLs to IndexNow. Returns the status code (200/202 = ok).
 * Returns null and logs if the key isn't configured (no-op fail-soft).
 *
 * Accepts either absolute URLs or root-relative paths — relative paths are
 * resolved against the canonical origin.
 */
export async function pingIndexNow(urlsOrPaths: string[]): Promise<number | null> {
  const key = indexNowKey();
  if (!key) {
    console.warn('[indexnow] INDEXNOW_KEY not set, skipping');
    return null;
  }

  const urlList = Array.from(
    new Set(
      urlsOrPaths
        .filter(Boolean)
        .map((u) => (u.startsWith('http') ? u : `${ORIGIN}${u.startsWith('/') ? u : `/${u}`}`))
    )
  );

  if (urlList.length === 0) return null;

  // IndexNow allows up to 10,000 URLs per request — well above anything we'd
  // ever submit at once, but keep this defensive cap anyway.
  const batch = urlList.slice(0, 10000);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `${ORIGIN}/${key}.txt`,
        urlList: batch,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(`[indexnow] ${res.status} for ${batch.length} url(s): ${text.slice(0, 200)}`);
    }
    return res.status;
  } catch (err) {
    console.warn('[indexnow] request failed:', err);
    return null;
  }
}
