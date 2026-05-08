"use client";

import { useEffect, useRef } from "react";

import { trackCaseStudyScroll, markThresholdFired } from "@/lib/analytics/events";
import type { ScrollThreshold } from "@/lib/analytics/events";

interface CaseStudyScrollTrackerProps {
  slug: string;
}

/**
 * CaseStudyScrollTracker — renders four invisible sentinel divs inside the
 * case study article body, one per depth milestone (25 / 50 / 75 / 100%).
 *
 * Approach:
 *   Each sentinel is positioned at the corresponding percentage of the
 *   tracker's own height via absolute positioning on a relative wrapper.
 *   An IntersectionObserver fires once per sentinel per slug; markThresholdFired()
 *   prevents re-firing when the user scrolls back up.
 *
 * The 100% sentinel sits at the very bottom of this component, which is
 * rendered after the MDX body and before NextCaseCTA — i.e. "read the case",
 * not "saw the next one".
 *
 * rootMargin "0px 0px -10px 0px" triggers the observer slightly before the
 * sentinel fully exits the viewport, matching typical scroll-depth analytics
 * convention (the content was in view, not necessarily pixel-perfect bottom).
 */

const THRESHOLDS: ScrollThreshold[] = [25, 50, 75, 100];

export function CaseStudyScrollTracker({ slug }: CaseStudyScrollTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep refs for each sentinel so the observer can map entry → threshold.
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    const sentinels = sentinelRefs.current.filter(Boolean) as HTMLDivElement[];
    if (sentinels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = sentinels.indexOf(entry.target as HTMLDivElement);
          if (idx === -1) continue;
          const threshold = THRESHOLDS[idx];
          // markThresholdFired returns true only on the first fire for this slug + threshold.
          if (markThresholdFired(slug, threshold)) {
            trackCaseStudyScroll({ slug, threshold });
          }
        }
      },
      { rootMargin: "0px 0px -10px 0px", threshold: 0 },
    );

    sentinels.forEach((s) => {
      observer.observe(s);
    });

    return () => {
      observer.disconnect();
    };
  }, [slug]);

  return (
    /*
     * The container fills the full height of the article body — it is placed
     * at the bottom of the case study page's MDX section by the page component.
     * The sentinels are absolute-positioned at 0 / 25 / 50 / 75 / 100% of the
     * container height.
     *
     * min-h-[100vh] ensures the container is tall enough to distribute the
     * sentinels meaningfully even on very short pages. On long case studies the
     * actual height will be driven by content above, making the sentinels map
     * naturally to the article body length.
     *
     * aria-hidden — purely analytical, no semantic or interactive content.
     */
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none relative"
      style={{ height: "100%" }}
    >
      {THRESHOLDS.map((threshold, i) => (
        <div
          key={threshold}
          ref={(el) => {
            sentinelRefs.current[i] = el;
          }}
          data-scroll-sentinel={threshold}
          className="absolute left-0 w-px"
          style={{ top: `${String(threshold)}%`, height: "1px" }}
        />
      ))}
    </div>
  );
}
