"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

import { homeContent } from "@/lib/content/home";
import { TextType } from "@/components/motion/text-type";
import { useLenis } from "@/components/site/lenis-provider";

/** Tailwind `md` — must match phrase1 desktop vs mobile split. */
const INTRO_MD_MIN_WIDTH_PX = 768;

/** Target duration (ms) for typing each intro phrase (spread across characters). */
const INTRO_TYPING_MS_PHRASE_1 = 2500;
const INTRO_TYPING_MS_PHRASE_2 = 1500;

// ---------------------------------------------------------------------------
// IntroOpener
//
// Controlled full-viewport intro overlay. Mounted only by SiteIntroGate when
// the current session has not yet seen the intro.
//
// Responsibilities:
//   - Lock scroll while visible.
//   - Type phrases via TextType.
//   - Hold 1000ms after the final phrase, then slide up and call onComplete.
//   - Esc key triggers a faster 300ms exit (WCAG escape-routes).
//   - Respects prefers-reduced-motion (instant exit, immediate onComplete).
//
// Session management belongs to SiteIntroGate, not here.
// ---------------------------------------------------------------------------

interface IntroOpenerProps {
  onComplete: () => void;
}

export function IntroOpener({ onComplete }: IntroOpenerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitingRef = useRef(false);
  const lenis = useLenis();

  const [introPhrases] = useState(() => {
    const desktop =
      typeof window !== "undefined" &&
      window.matchMedia(`(min-width: ${String(INTRO_MD_MIN_WIDTH_PX)}px)`).matches;
    const first = desktop ? homeContent.intro.phrase1.desktop : homeContent.intro.phrase1.mobile;
    return [first, homeContent.intro.phrase2];
  });

  const typingSpeedByPhrase = useMemo(
    () => [
      INTRO_TYPING_MS_PHRASE_1 / Math.max(introPhrases[0]?.length ?? 1, 1),
      INTRO_TYPING_MS_PHRASE_2 / Math.max(introPhrases[1]?.length ?? 1, 1),
    ],
    [introPhrases],
  );

  // Lock scroll while the intro is visible.
  useEffect(() => {
    if (lenis) {
      lenis.stop();
    } else {
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (lenis) {
        lenis.start();
      } else {
        document.body.style.overflow = "";
      }
    };
  }, [lenis]);

  // Focus the overlay so Esc is immediately reachable without tabbing.
  useEffect(() => {
    overlayRef.current?.focus();
  }, []);

  const triggerExit = (fast = false) => {
    if (exitingRef.current || !overlayRef.current) return;
    exitingRef.current = true;

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      gsap.set(overlayRef.current, { opacity: 0 });
      onComplete();
      return;
    }

    gsap.to(overlayRef.current, {
      yPercent: -100,
      duration: fast ? 0.3 : 0.5,
      ease: fast ? "power2.out" : "power2.inOut",
      onComplete,
    });
  };

  // Esc key — WCAG escape-routes compliance.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") triggerExit(true);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
    // triggerExit uses only refs — stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called by TextType when each phrase finishes typing.
  const handleSentenceComplete = (_sentence: string, index: number) => {
    const lastIndex = introPhrases.length - 1;
    if (index === lastIndex) {
      holdTimerRef.current = setTimeout(() => {
        triggerExit(false);
      }, 1000);
    }
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Intro"
      tabIndex={-1}
      className="bg-foreground text-background fixed inset-0 z-[70] flex items-center justify-center px-6 text-center focus:outline-none"
    >
      <TextType
        text={introPhrases}
        as="h4"
        loop={false}
        typingSpeed={typingSpeedByPhrase}
        pauseDuration={500}
        deletingSpeed={18}
        showCursor
        cursorCharacter="_"
        cursorBlinkDuration={0.5}
        onSentenceComplete={handleSentenceComplete}
        className="text-2xl leading-tight tracking-tight text-balance whitespace-pre-line sm:text-3xl md:text-4xl"
      />
    </div>
  );
}
