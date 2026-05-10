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
       * Curtain content wrapper — reserves the same height as the fixed footer
       * so it is fully revealed when the user reaches the bottom of the page.
       * The footer height leaves 8px below the scrolled navbar before the dark
       * surface begins. bg-background ensures content occludes the footer while
       * scrolling. relative + z-10 establishes the stacking context above the
       * fixed footer.
       */}
      <div className="bg-background relative z-10 mb-[calc(100dvh-72px)] flex flex-1 flex-col">
        {children}
      </div>
      <MobileCtaBar />
    </LenisProvider>
  );
}
