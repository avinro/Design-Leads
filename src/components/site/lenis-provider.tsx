"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Context — exposes the Lenis instance for programmatic scrollTo calls
// ---------------------------------------------------------------------------

const LenisContext = createContext<Lenis | null>(null);

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

// ---------------------------------------------------------------------------
// LenisProvider
//
// Initialises Lenis smooth scroll with GSAP ScrollTrigger sync.
// Disabled on:
//   - Mobile viewports (<768px) — iOS/Android native inertia is sufficient
//   - prefers-reduced-motion — respect user accessibility preference
//
// Z-index layer scale (applied at layout level, documented here):
//   z-0   SiteFooter curtain (behind all content)
//   z-10  Content wrapper (children)
//   z-40  SiteHeader, MobileCtaBar (always on top)
//   z-50  Temporary interaction layers (max)
// ---------------------------------------------------------------------------

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  // State drives the context value so consumers re-render when Lenis mounts.
  // Reading lenisRef.current during render is flagged by react-hooks/refs.
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767.5px)").matches;

    // Skip Lenis on mobile or when user prefers reduced motion.
    // ScrollTrigger still works with native scroll in both cases.
    if (prefersReducedMotion || isMobile) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    });

    lenisRef.current = lenis;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenisInstance(lenis);

    // Bind ScrollTrigger.update so it is called as a standalone function
    // (avoids @typescript-eslint/unbound-method warning).
    const onScroll = () => {
      ScrollTrigger.update();
    };
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };

    // Sync Lenis scroll position with GSAP ScrollTrigger each frame.
    lenis.on("scroll", onScroll);
    gsap.ticker.add(tickerFn);
    // Disable GSAP lag smoothing to prevent ScrollTrigger jitter under Lenis.
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      lenisRef.current = null;

      setLenisInstance(null);
    };
  }, []);

  return <LenisContext.Provider value={lenisInstance}>{children}</LenisContext.Provider>;
}
