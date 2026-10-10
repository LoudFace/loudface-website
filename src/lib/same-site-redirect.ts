/**
 * Where a "send me back to ?redirect=" value may go: only somewhere on this
 * site. The value is resolved against the site's origin and kept only when the
 * result is still on that origin; anything else (another host, //host,
 * /\host, javascript:, a malformed value) goes to the home page.
 *
 * Compare origins, never prefixes: "/\host" and "/<tab>/host" start with a
 * single slash and still leave the site. Returns a full URL, never a bare
 * path: "/.//host" normalises to the path "//host", which would leave the site
 * if it were resolved a second time. A value with user details goes home too:
 * "https://example.com@www.loudface.co/x" keeps this origin, but the address
 * the visitor sees reads as example.com.
 */
export function sameSiteRedirect(value: string | null, origin: string): URL {
  const home = new URL('/', origin);
  if (!value) return home;
  try {
    const target = new URL(value, home);
    return target.origin === home.origin && !target.username && !target.password ? target : home;
  } catch {
    return home;
  }
}
