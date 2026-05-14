"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";

// ---------------------------------------------------------------------------
// SiteTemplate — per-page enter animation.
//
// Next.js App Router's template.tsx unmounts and remounts on every navigation
// (unlike layout.tsx which persists). This makes it the correct location for
// soft page-enter animations.
//
// Guards:
//   - Skipped when prefers-reduced-motion is set.
//   - Skipped on the first mount immediately after the intro completes.
//     SiteIntroGate sets avinro:intro-just-completed before mounting the site
//     tree. Without this guard, template.tsx would animate the home page entry
//     right after the intro exits, producing a jarring double-animation.
//     The flag is consumed (removed) on the first read so it fires only once.
//
// Motion:
//   - opacity 0 → 1, translateY 14px → 0, 350ms power2.out.
//   - No exit animation — navigation must feel immediate.
// ---------------------------------------------------------------------------

const JUST_COMPLETED_KEY = "avinro:intro-just-completed";

export default function SiteTemplate({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Consume the one-shot flag set by SiteIntroGate.
    const introJustCompleted = sessionStorage.getItem(JUST_COMPLETED_KEY);
    if (introJustCompleted) {
      sessionStorage.removeItem(JUST_COMPLETED_KEY);
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
    );
  }, []);

  return <div ref={ref}>{children}</div>;
}
