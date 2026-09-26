/**
 * Which routes draw the v11 site chrome: the menus, the phone menu, the cookie card, the header treatment over the
 * hero, and no shared footer (every v11 page renders FooterV11 itself). Since the v11 switch (2026-09-26) that is
 * every public route. The only exceptions are the pre-v11 review routes that still compose v3 bodies: the hero
 * experiment door /preview/hero and the /dev-preview pages other than the v11 previews. They keep the chrome they
 * were built with until they are deleted (docs/v11-handoff.md, go-live step 5).
 */
export function isV11Route(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  if (pathname.startsWith('/preview/')) return false;
  if (pathname.startsWith('/dev-preview/') && !pathname.startsWith('/dev-preview/home-v11')) return false;
  return true;
}

/** The pre-v11 review routes that compose a v3 body with its own FooterV3 (dark header, no shared footer). */
export function isV3PreviewRoute(pathname: string | null | undefined): boolean {
  return !!pathname && pathname.startsWith('/dev-preview/home-') && !pathname.startsWith('/dev-preview/home-v11');
}
