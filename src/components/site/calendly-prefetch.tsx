"use client";

import { useEffect } from "react";

import { loadCalendlyScript } from "@/lib/calendly/load";

// Preconnect hints — React 19 automatically hoists <link> tags to <head>.
function CalendlyPreconnect() {
  return (
    <>
      <link rel="preconnect" href="https://assets.calendly.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://calendly.com" />
    </>
  );
}

function ignoreCalendlyLoadFailure(): undefined {
  return undefined;
}

// Intent detection — start loading widget.js before the user clicks,
// so the first-open feels instant.
function CalendlyIntentLoader() {
  useEffect(() => {
    let removed = false;

    const isTouch = window.matchMedia("(hover: none)").matches;

    if (isTouch) {
      // Touch-only devices have no hover signal: load after 4 s idle.
      const ric = window.requestIdleCallback;
      if (typeof ric === "function") {
        const id = ric(
          () => {
            void loadCalendlyScript().catch(ignoreCalendlyLoadFailure);
          },
          { timeout: 4_000 },
        );
        return () => {
          removed = true;
          const cic = window.cancelIdleCallback;
          if (typeof cic === "function") cic(id);
        };
      }

      const id = window.setTimeout(() => {
        void loadCalendlyScript().catch(ignoreCalendlyLoadFailure);
      }, 4_000);
      return () => {
        removed = true;
        window.clearTimeout(id);
      };
    }

    // Desktop / pointer devices: load on first intent toward any CTA.
    const handleIntent = (e: Event) => {
      if (removed) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("[data-cta='lets-talk']")) return;
      removed = true;
      document.removeEventListener("pointerenter", handleIntent, true);
      document.removeEventListener("focusin", handleIntent, true);
      void loadCalendlyScript().catch(ignoreCalendlyLoadFailure);
    };

    document.addEventListener("pointerenter", handleIntent, true);
    document.addEventListener("focusin", handleIntent, true);

    return () => {
      removed = true;
      document.removeEventListener("pointerenter", handleIntent, true);
      document.removeEventListener("focusin", handleIntent, true);
    };
  }, []);

  return null;
}

export function CalendlyPrefetch() {
  return (
    <>
      <CalendlyPreconnect />
      <CalendlyIntentLoader />
    </>
  );
}
