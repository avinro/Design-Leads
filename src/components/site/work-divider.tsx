"use client";

import dynamic from "next/dynamic";

/*
 * WorkDivider — slim chapter-rule marquee that bookends the work section.
 *
 * Designed to be placed both before and after FlowingWorkMenu. Accepts a
 * `direction` prop so the top instance scrolls left and the bottom scrolls
 * right, creating a balanced editorial bracket.
 *
 * Typography is h4-scale (text-xl / text-2xl) — a quiet label, not a hero band.
 *
 * Lazy-loaded (ssr: false) because ScrollVelocity depends on useScroll /
 * useVelocity from motion/react which are browser-only APIs.
 *
 * aria-hidden: this is purely decorative; the accessible work section heading
 * is carried by FlowingWorkMenu's nav aria-label.
 */
const ScrollVelocity = dynamic(
  () => import("@/components/motion/scroll-velocity").then((m) => m.ScrollVelocity),
  {
    ssr: false,
    loading: () => <div className="h-10 w-full" aria-hidden="true" />,
  },
);

interface WorkDividerProps {
  /** Direction the marquee travels. "left" = scrolls left, "right" = scrolls right. */
  direction?: "left" | "right";
}

export function WorkDivider({ direction = "left" }: WorkDividerProps = {}) {
  // ScrollVelocity flips sign for odd indices. With a single-item texts array
  // the velocity prop controls direction directly — no hidden inversion.
  const velocity = direction === "left" ? 50 : -50;

  return (
    <div aria-hidden="true" className="overflow-hidden py-2 md:py-3">
      <ScrollVelocity
        texts={["SELECTED WORK \u2022"]}
        velocity={velocity}
        numCopies={20}
        className="text-foreground/40 font-mono text-xs tracking-widest uppercase"
        scrollerClassName=""
        parallaxClassName="py-2 md:py-2.5"
      />
    </div>
  );
}
