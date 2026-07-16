"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";

const SITE_ORIGIN = "https://www.loudface.co";

/**
 * Pathname-dependent site chrome, resolved client-side via usePathname()
 * instead of reading the `x-pathname` request header in the layout. This
 * decouples the Header hero-theme / shared-footer suppression / hreflang from
 * headers(), which is prep for the Wave-3 static refactor.
 *
 * usePathname() is populated during SSR, so the initial server HTML already
 * carries the correct data-hero-theme and hreflang — no hydration flash of
 * the wrong header treatment, and crawlers see the right alternate links.
 */

interface RouteChrome {
  heroTheme: "dark" | undefined;
  /** True on v3 routes that ship their own in-page FooterV3. */
  suppressSharedFooter: boolean;
}

function deriveRouteChrome(pathname: string): RouteChrome {
  // Blog (index + posts) is v3: electric-hero dark Header + its own FooterV3.
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  // Service child pages (/services/<slug>) are v3, same treatment as the hub.
  const isServiceChild = pathname.startsWith("/services/");

  const isV3 =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/pricing" ||
    pathname === "/services" ||
    isServiceChild ||
    pathname === "/contact" ||
    pathname.startsWith("/case-studies") ||
    isBlog;

  // The Header dark-hero variant additionally covers /home-preview.
  const heroThemeDark = isV3 || pathname === "/home-preview";

  return {
    heroTheme: heroThemeDark ? "dark" : undefined,
    suppressSharedFooter: isV3,
  };
}

/**
 * Renders the hreflang alternates + the Header in its correct hero-theme
 * variant for the current route. React hoists the <link> tags into <head>.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const { heroTheme } = deriveRouteChrome(pathname);
  const hreflangHref = pathname === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${pathname}`;

  return (
    <>
      {/* hreflang — single-language English site. x-default doubles as the
          fallback for AI engines unsure of locale targeting. */}
      <link rel="alternate" hrefLang="en" href={hreflangHref} />
      <link rel="alternate" hrefLang="x-default" href={hreflangHref} />
      <Header heroTheme={heroTheme} />
    </>
  );
}

/**
 * Renders the shared Footer (passed as a server-rendered child) on every
 * route EXCEPT the v3 routes that carry their own in-page FooterV3.
 */
export function SiteFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { suppressSharedFooter } = deriveRouteChrome(pathname);
  return suppressSharedFooter ? null : <>{children}</>;
}
