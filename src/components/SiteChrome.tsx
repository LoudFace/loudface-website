"use client";

import { usePathname } from "next/navigation";
import { Header, type HeaderProps } from "@/components/Header";
import type { NavV11Data } from "@/app/home-v11/NavV11";
import { isV11Route, isV3PreviewRoute } from "@/lib/v11-routes";

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
  /** True on routes that render their own footer (FooterV11, or FooterV3 on the old review routes). */
  suppressSharedFooter: boolean;
}

function deriveRouteChrome(pathname: string): RouteChrome {
  // Every v11 page starts on the dark-hero header treatment; a light hero marks itself data-hero="light" and
  // home-v11.css turns the header ink until it scrolls. Every v11 page renders FooterV11 itself.
  // The pre-v11 review routes that compose a v3 body keep that treatment too, FooterV3 included; the other
  // old review routes keep the plain header and the shared footer they were built with.
  const ownFooter = isV11Route(pathname) || isV3PreviewRoute(pathname);
  return {
    heroTheme: ownFooter ? "dark" : undefined,
    suppressSharedFooter: ownFooter,
  };
}

/**
 * Renders the hreflang alternates + the Header in its correct hero-theme
 * variant for the current route. React hoists the <link> tags into <head>.
 */
export function SiteHeader({ navContent, navV11 }: { navContent: HeaderProps["content"]; navV11?: NavV11Data }) {
  const pathname = usePathname();
  const { heroTheme } = deriveRouteChrome(pathname);
  const v11 = isV11Route(pathname) && navV11 ? navV11 : undefined;
  const hreflangHref = pathname === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${pathname}`;

  return (
    <>
      {/* hreflang — single-language English site. x-default doubles as the
          fallback for AI engines unsure of locale targeting. */}
      <link rel="alternate" hrefLang="en" href={hreflangHref} />
      <link rel="alternate" hrefLang="x-default" href={hreflangHref} />
      <Header heroTheme={heroTheme} content={navContent} v11={v11} />
    </>
  );
}

/**
 * Renders the shared Footer (passed as a server-rendered child) only on the
 * old review routes that do not carry a footer of their own.
 */
export function SiteFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { suppressSharedFooter } = deriveRouteChrome(pathname);
  return suppressSharedFooter ? null : <>{children}</>;
}
