"use client";

import { useEffect } from "react";
import { ensurePostHog } from "@/lib/posthog-client";

const CAL_METADATA_VALUE_LIMIT = 500;

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  const value = cookie?.slice(prefix.length);

  return value ? value.slice(0, CAL_METADATA_VALUE_LIMIT) : undefined;
}

/**
 * CalHandler Component
 *
 * Handles click events for Cal.com booking modal triggers and stitches
 * successful bookings to PostHog via posthog.identify(email). The source-of-truth
 * 'call_booked' event is captured server-side via the /api/webhooks/cal endpoint.
 *
 * Listens for clicks on:
 * - Elements with .btn-cta class
 * - Elements with [data-cal-trigger] attribute
 * - Links with href="#book-modal"
 */
export function CalHandler() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const isBtnCta =
        target.classList.contains("btn-cta") || target.closest(".btn-cta");
      const isCalTrigger =
        target.hasAttribute("data-cal-trigger") ||
        target.closest("[data-cal-trigger]");
      const isBookLink =
        target.getAttribute("href") === "#book-modal" ||
        target.closest('[href="#book-modal"]');

      if (isBtnCta || isCalTrigger || isBookLink) {
        e.preventDefault();
        e.stopPropagation();

        if (typeof window.Cal === "function") {
          const fbp = readCookie("_fbp");
          const fbclid = new URLSearchParams(window.location.search).get("fbclid");
          const fbc =
            readCookie("_fbc") ??
            (fbclid
              ? `fb.1.${Date.now()}.${fbclid}`.slice(0, CAL_METADATA_VALUE_LIMIT)
              : undefined);

          window.Cal("modal", {
            calLink: "arnelbukva/loudface-intro-call",
            config: {
              layout: "month_view",
              utm_source: "website",
              utm_medium: "embed",
              utm_campaign: "intro_call",
              utm_content: window.location.pathname,
              ...(fbp ? { "metadata[fbp]": fbp } : {}),
              ...(fbc ? { "metadata[fbc]": fbc } : {}),
            },
          });
        }
      }
    };

    document.addEventListener("click", handleClick);

    // Stitch the anonymous PostHog session to the attendee's email the moment
    // the booking succeeds. The server webhook is the source of truth for the
    // `call_booked` event (it carries utm_source=website, utm_content=page,
    // booking metadata, etc.). This client-side identify exists *only* so that
    // the prior anonymous pageview history merges into the email-keyed person
    // — without it, embed bookers would show up as two separate people in
    // PostHog. Do NOT add a `posthog.capture()` here; it duplicates the server
    // event and pollutes funnels.
    let registered = false;
    const registerBookingListener = () => {
      if (registered || !window.Cal) return;
      registered = true;
      // Deliberately the deprecated `bookingSuccessful`, not `bookingSuccessfulV2`.
      // V2's documented payload carries uid/title/times but NOT attendees, and the
      // attendee email is the only thing this callback needs. Revisit if Cal.com
      // ever exposes attendees on V2 or retires the old event.
      window.Cal("on", {
        action: "bookingSuccessful",
        callback: (e: unknown) => {
          try {
            const detail = (e as { detail?: { data?: unknown } })?.detail?.data as
              | { booking?: { attendees?: Array<{ email?: string; name?: string }> } }
              | undefined;
            const attendee = detail?.booking?.attendees?.[0];
            const email = attendee?.email?.toLowerCase().trim();
            if (!email) return;

            void ensurePostHog().then((posthog) => {
              posthog?.identify(email, {
                email,
                name: attendee?.name,
              });
            });
          } catch (err) {
            console.warn("[CalHandler] bookingSuccessful handler error", err);
          }
        },
      });
    };

    // Cal loads lazily; poll briefly until it's ready, then register once.
    const interval = window.setInterval(() => {
      if (typeof window.Cal === "function") {
        registerBookingListener();
        window.clearInterval(interval);
      }
    }, 500);

    return () => {
      document.removeEventListener("click", handleClick);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
