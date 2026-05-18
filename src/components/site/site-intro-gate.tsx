"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";

import { IntroOpener } from "@/components/site/intro-opener";
import { useLenis } from "@/components/site/lenis-provider";
import { clearIntroPendingMark } from "@/lib/intro/block-first-paint";
import { INTRO_JUST_COMPLETED_SESSION_KEY, INTRO_SEEN_SESSION_KEY } from "@/lib/intro/constants";
import { scheduleRefreshLenisBounds } from "@/lib/scroll/refresh-lenis-bounds";

// ---------------------------------------------------------------------------
// SiteIntroGate
//
// Hard render gate for the first-session intro experience.
//
// State machine:
//   Client: reads sessionStorage synchronously in the useState initializer.
//   Server: always "ready" so marketing HTML stays in the document for SEO.
//   First visit pairs with INTRO_BLOCK_FIRST_PAINT_SCRIPT in the root layout,
//   which covers the SSR homepage until React mounts IntroOpener.
//   - "intro"     — first visit: renders IntroOpener only
//   - "ready"     — returning visit OR after intro completes: mounts children
//
// Session keys: see src/lib/intro/constants.ts
// ---------------------------------------------------------------------------

type GateState = "intro" | "ready";

function readGateState(): GateState {
  if (typeof window === "undefined") return "ready";
  return sessionStorage.getItem(INTRO_SEEN_SESSION_KEY) ? "ready" : "intro";
}

interface SiteIntroGateProps {
  children: ReactNode;
}

export function SiteIntroGate({ children }: SiteIntroGateProps) {
  const [state, setState] = useState<GateState>(readGateState);
  const lenis = useLenis();

  // Returning visitors: inline script does not add the pending class; clear if present.
  useLayoutEffect(() => {
    if (state === "ready") {
      clearIntroPendingMark();
    }
  }, [state]);

  // Lenis may initialize while only the intro is mounted; remeasure once the site tree mounts.
  useEffect(() => {
    if (state !== "ready" || !lenis) return;
    scheduleRefreshLenisBounds(lenis);
  }, [state, lenis]);

  const handleIntroComplete = () => {
    sessionStorage.setItem(INTRO_SEEN_SESSION_KEY, "1");
    sessionStorage.setItem(INTRO_JUST_COMPLETED_SESSION_KEY, "1");
    clearIntroPendingMark();
    setState("ready");
  };

  if (state === "intro") {
    return <IntroOpener onComplete={handleIntroComplete} />;
  }

  return <>{children}</>;
}
