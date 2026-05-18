"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useLenis } from "@/components/site/lenis-provider";

/**
 * Resets the document scroll position on internal route changes.
 *
 * Next.js scrolls `window` by default, but Lenis (>= md, motion OK) keeps its own
 * animated scroll value — so the viewport can stay near the footer after
 * navigation. This effect syncs Lenis (or native scroll) to the top on every
 * pathname change, except when the URL includes a real hash anchor.
 */
export function RouteScrollRestore() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const hash = window.location.hash;
      if (hash.length > 1) {
        return;
      }

      if (lenis) {
        lenis.scrollTo(0, { immediate: true, programmatic: true });
        lenis.resize();
      } else {
        window.scrollTo(0, 0);
      }

      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pathname, lenis]);

  return null;
}
