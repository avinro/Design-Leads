import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCtaBar } from "@/components/site/mobile-cta-bar";
import { LenisProvider } from "@/components/site/lenis-provider";

/**
 * Marketing site layout — applies to all public portfolio pages.
 *
 * Structure:
 *   LenisProvider   — smooth scroll + GSAP ScrollTrigger sync (>=md only)
 *   SiteHeader      — z-40, sticky top
 *   SiteFooter      — z-0, fixed bottom (curtain effect; revealed as content scrolls away)
 *   Curtain wrapper — z-10, bg-background; sits above footer, scrolls normally
 *   MobileCtaBar    — z-40, fixed bottom on mobile
 *
 * Layer scale:
 *   z-0   SiteFooter curtain
 *   z-10  Content wrapper
 *   z-40  SiteHeader, MobileCtaBar
 *   z-50  Temporary interaction elements (max)
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <LenisProvider>
      <SiteHeader />
      {/*
       * SiteFooter is rendered first in DOM order but sits at z-0 fixed bottom.
       * The curtain wrapper (z-10) slides up over it as the user scrolls through
       * page content, then "lifts" away at the bottom to reveal the footer.
       */}
      <SiteFooter />
      {/*
       * Curtain content wrapper — bg-background + z-10 ensures content occludes
       * the fixed footer while scrolling. relative + z-10 establishes the
       * stacking context above the footer (z-0).
       *
       * The mb-[calc(100dvh-72px)] was removed: margins on flex-1 items interact
       * poorly with flex containers on long pages (e.g. home 300dvh sections),
       * causing Lenis to under-estimate the scroll range before layout stabilises.
       * The runway is now a dedicated sentinel sibling below (see next comment).
       */}
      <div className="bg-background relative z-10 flex flex-1 flex-col">{children}</div>
      {/*
       * Curtain runway sentinel — a transparent flex item that reserves exactly
       * the scroll distance the fixed footer needs to become fully visible.
       * Using a dedicated element (instead of margin-bottom) makes the
       * contribution to scrollHeight unambiguous regardless of flex context,
       * and gives Lenis a stable target when it refreshes after page load.
       *
       * shrink-0 prevents the flex container from compressing this space on
       * short viewports. No background means the footer (z-0 fixed) is visible
       * through it as the curtain lifts.
       */}
      <div aria-hidden="true" className="h-[calc(100dvh-72px)] shrink-0" />
      <MobileCtaBar />
    </LenisProvider>
  );
}
