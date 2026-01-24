"use client";

import { useEffect } from "react";

// Type for the Cal global object
declare global {
  interface Window {
    Cal?: (action: string, options?: Record<string, unknown>) => void;
  }
}

/**
 * CalHandler Component
 *
 * Handles click events for Cal.com booking modal triggers.
 * Listens for clicks on:
 * - Elements with .btn-cta class
 * - Elements with [data-cal-trigger] attribute
 * - Links with href="#book-modal"
 */
export function CalHandler() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if clicked on .btn-cta, [data-cal-trigger], or a link to #book-modal
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

        // Open Cal.com popup modal
        if (typeof window.Cal !== "undefined") {
          window.Cal("modal", {
            calLink: "arnelbukva/loudface-intro-call",
            config: { layout: "month_view" },
          });
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
