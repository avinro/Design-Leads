"use client";

/**
 * StickyBackground — immersive per-section background image for case study pages.
 *
 * Architecture:
 *   - Renders a sticky 100dvh container that lives at the top of the page and
 *     remains fixed in the viewport while the foreground scrolls over it.
 *   - Receives `sections` (id + image path) from the page server component.
 *   - Mounts an IntersectionObserver on every h2[data-section-id] inside the
 *     case study body; whichever heading crosses the -35% / -55% threshold
 *     becomes the "active" section.
 *   - Crossfades between images using AnimatePresence (300 ms). When
 *     useReducedMotion() is true, images swap instantly without animation.
 *   - Background images are aria-hidden — they are decorative atmosphere only.
 *     All meaningful content lives in the MDX body.
 *   - `pointer-events-none` on the sticky layer ensures it never intercepts
 *     keyboard or mouse events meant for the scrolling content.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface StickySection {
  id: string;
  image: string;
}

interface StickyBackgroundProps {
  sections: StickySection[];
}

export function StickyBackground({ sections }: StickyBackgroundProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReduced = useReducedMotion();

  // Observe every h2[data-section-id] in the document to detect active section.
  useEffect(() => {
    if (sections.length === 0) return;

    const sectionIds = sections.map((s) => s.id);

    const targets = sectionIds
      .map((id) => document.querySelector<HTMLElement>(`h2[data-section-id="${id}"]`))
      .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    // rootMargin "-35% top / -55% bottom" means only headings in the middle
    // 10% band of the viewport fire. This avoids rapid toggling on short sections
    // and prevents the active section from switching while reading the body.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-section-id");
            const idx = sectionIds.indexOf(sectionId ?? "");
            if (idx !== -1) {
              setActiveIndex(idx);
            }
          }
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );

    targets.forEach((el) => {
      observer.observe(el);
    });
    return () => {
      observer.disconnect();
    };
  }, [sections]);

  const activeSection = sections[activeIndex] ?? sections[0];
  if (sections.length === 0) return null;

  const crossfadeDuration = prefersReduced ? 0 : 0.3;

  return (
    // Sticky container — stays in viewport while page content scrolls over it.
    // position:sticky avoids iOS Safari jitter caused by position:fixed.
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-0 h-[100dvh] w-full overflow-hidden"
    >
      {/* Image layer — AnimatePresence enables crossfade between section images */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={activeSection.image}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: crossfadeDuration, ease: "easeInOut" }}
          // GPU compositing — limit will-change to the animated layer only
          className="absolute inset-0 transform-gpu will-change-[opacity]"
        >
          <Image
            src={activeSection.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            // Priority on first image; remaining images load lazily
            priority={activeIndex === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark scrim — fixed opacity guarantees ≥4.5:1 contrast for light text */}
      <div className="absolute inset-0 bg-black/65 dark:bg-black/70" />
    </div>
  );
}
