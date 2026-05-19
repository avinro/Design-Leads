import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCtaBar } from "@/components/site/mobile-cta-bar";
import { LenisProvider } from "@/components/site/lenis-provider";
import { RouteScrollRestore } from "@/components/site/route-scroll-restore";
import { SiteIntroGate } from "@/components/site/site-intro-gate";
import { CalendlyPrefetch } from "@/components/site/calendly-prefetch";
import { AiChatLoader } from "@/components/site/ai-chat-loader";

/**
 * Marketing site layout — applies to all public portfolio pages.
 *
 * Structure:
 *   LenisProvider   — smooth scroll + GSAP ScrollTrigger sync (>=md only)
 *   RouteScrollRestore — scroll to top on pathname change (Lenis + native)
 *   SiteIntroGate   — hard render gate for the first-session intro.
 *                     On first visit: renders only the intro overlay; the site
 *                     tree is not mounted until the intro completes.
 *                     On return visits: mounts the site tree immediately.
 *   SiteHeader      — z-40, sticky top
 *   SiteFooter      — z-0, fixed bottom (curtain effect; revealed as content scrolls away)
 *   main            — z-10, bg-background; sits above footer, scrolls normally
 *   MobileCtaBar    — z-40, fixed bottom on mobile
 *
 * Layer scale:
 *   z-0   SiteFooter curtain
 *   z-10  Content wrapper (main)
 *   z-40  SiteHeader, MobileCtaBar
 *   z-70  SiteIntroGate checking surface / IntroOpener
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <LenisProvider>
      <RouteScrollRestore />
      <SiteIntroGate>
        <SiteHeader />
        {/*
         * SiteFooter is rendered first in DOM order but sits at z-0 fixed bottom.
         * The main wrapper (z-10) slides up over it as the user scrolls through
         * page content, then "lifts" away at the bottom to reveal the footer.
         */}
        <SiteFooter />
        {/*
         * <main> with id="main-content" + tabIndex={-1}:
         *   - Semantic landmark for page content.
         *   - Skip-link target in SiteHeader.
         *   - focus:outline-none because focus is always programmatic.
         */}
        <main
          id="main-content"
          tabIndex={-1}
          className="bg-background relative z-10 flex min-h-dvh flex-1 flex-col focus:outline-none"
        >
          {children}
        </main>
        {/*
         * Runway sentinel — reserves the scroll distance the fixed footer
         * needs to become fully visible. shrink-0 prevents compression on short
         * viewports; transparent background lets the footer show through.
         */}
        <div aria-hidden="true" className="h-[calc(100dvh-72px)] shrink-0" />
        <MobileCtaBar />
        <CalendlyPrefetch />
        <AiChatLoader />
      </SiteIntroGate>
    </LenisProvider>
  );
}
