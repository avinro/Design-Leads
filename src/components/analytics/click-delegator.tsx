"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { trackCtaClick, trackWorkCardClick } from "@/lib/analytics/events";
import type { CtaPosition, WorkCardSource } from "@/lib/analytics/events";

/**
 * AnalyticsClickDelegator — a single global click listener mounted once in
 * the root layout that translates data-cta-* and data-work-card-* HTML
 * attributes into typed analytics events.
 *
 * Why delegation instead of per-component onClick handlers?
 *   - SiteHeader, WorkCard, and MobileCtaBar are Server Components. Converting
 *     them to client components just to add an onClick would cost a larger JS
 *     bundle and remove RSC streaming benefits.
 *   - A single delegated listener captures any element in the DOM without
 *     coupling individual components to the analytics library.
 *
 * Attribute contract (set on the clickable element or any ancestor):
 *
 *   CTA click:
 *     data-cta-label     — visible label text (e.g. "Let's talk")
 *     data-cta-href      — destination href (e.g. "/contact")
 *     data-cta-position  — CtaPosition enum value (e.g. "header")
 *
 *   Work card click:
 *     data-work-card-slug    — case study slug
 *     data-work-card-title   — case study title
 *     data-work-card-source  — WorkCardSource enum value
 *
 * Double-fire prevention: the listener reads from closest ancestor that
 * carries the attribute, so nested children don't create duplicate events.
 */
export function AnalyticsClickDelegator() {
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Walk up to find a CTA marker
      const ctaEl = target.closest("[data-cta-position]");
      if (ctaEl instanceof HTMLElement) {
        const label = ctaEl.dataset.ctaLabel ?? "";
        const href = ctaEl.dataset.ctaHref ?? "";
        const position = ctaEl.dataset.ctaPosition as CtaPosition;
        trackCtaClick({ label, href, position, page: pathname });
        return; // CTA takes priority over work-card if nested
      }

      // Walk up to find a work-card marker
      const cardEl = target.closest("[data-work-card-slug]");
      if (cardEl instanceof HTMLElement) {
        const slug = cardEl.dataset.workCardSlug ?? "";
        const title = cardEl.dataset.workCardTitle ?? "";
        const source = cardEl.dataset.workCardSource as WorkCardSource;
        trackWorkCardClick({ slug, title, source });
      }
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [pathname]);

  return null;
}
