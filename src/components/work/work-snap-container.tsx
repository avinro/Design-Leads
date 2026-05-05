"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import type { CaseStudy } from "@/lib/content/case-studies";
import { WorkSlide } from "./work-slide";

interface WorkSnapContainerProps {
  cases: CaseStudy[];
}

/*
 * WorkSnapContainer — client island that owns the full-page snap-scroll logic.
 *
 * Approach: apply scroll-snap-type directly to the <html> root scroll container
 * on mount and clean it up on unmount. This lets the existing layout (sticky
 * header, footer in normal flow) remain untouched while each <WorkSlide>
 * declares [scroll-snap-align:start] + h-dvh to participate in the snap.
 *
 * After the last slide the user can continue scrolling in the normal window
 * scroll to reach the SiteFooter.
 *
 * Keyboard: ArrowDown / ArrowUp scroll to the adjacent slide. The footer is
 * reachable via Tab or natural scroll beyond the last slide.
 *
 * Pagination dots: fixed to the right edge, one button per slide.
 * Each button is ≥44px × ≥44px to meet touch-target requirements.
 */
export function WorkSnapContainer({ cases }: WorkSnapContainerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Hide pagination dots when no slide is intersecting (user is in the footer).
  const [anySlideVisible, setAnySlideVisible] = useState(true);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const visibilityMap = useRef<Record<number, boolean>>({});
  const prefersReduced = useReducedMotion();

  // Enable full-page snap on the root scroll container for this route only.
  // "proximity" (not "mandatory") lets the user scroll past the last slide to
  // reach the SiteFooter without being snapped back.
  useEffect(() => {
    const html = document.documentElement;
    html.style.scrollSnapType = "y proximity";
    return () => {
      html.style.scrollSnapType = "";
    };
  }, []);

  // Track which slide is centred in the viewport.
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          visibilityMap.current[index] = entry.isIntersecting;
          const anyVisible = Object.values(visibilityMap.current).some(Boolean);
          setAnySlideVisible(anyVisible);
          if (entry.isIntersecting) setActiveIndex(index);
        },
        { threshold: 0.8 },
      );
      observer.observe(slide);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => {
        o.disconnect();
      });
    };
    // Re-run only when case count changes (new MDX added).
  }, [cases.length]);

  // Arrow-key navigation between slides.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" && activeIndex < cases.length - 1) {
        e.preventDefault();
        slideRefs.current[activeIndex + 1]?.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start",
        });
      }
      if (e.key === "ArrowUp" && activeIndex > 0) {
        e.preventDefault();
        slideRefs.current[activeIndex - 1]?.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start",
        });
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [activeIndex, cases.length, prefersReduced]);

  function goToSlide(index: number) {
    slideRefs.current[index]?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <>
      {/* Slides */}
      {cases.map((cs, i) => (
        <WorkSlide
          key={cs.frontmatter.slug}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          case_={cs}
          index={i}
          isActive={activeIndex === i}
        />
      ))}

      {/* Pagination dots — right rail (desktop) / hidden on mobile to avoid
          overlap with the MobileCtaBar. Screen-reader users navigate via Tab
          and the CTA links inside each slide. */}
      <nav
        aria-label="Case study navigation"
        aria-hidden={!anySlideVisible}
        className={`fixed top-1/2 right-4 z-50 hidden -translate-y-1/2 flex-col gap-1 transition-opacity duration-300 md:right-8 md:flex ${
          anySlideVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {cases.map((cs, i) => (
          <button
            key={cs.frontmatter.slug}
            onClick={() => {
              goToSlide(i);
            }}
            aria-label={`Go to case study ${String(i + 1)}: ${cs.frontmatter.title}`}
            aria-current={activeIndex === i ? "step" : undefined}
            className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                activeIndex === i ? "h-3 w-3 bg-white" : "h-2 w-2 bg-white/35 hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </nav>
    </>
  );
}
