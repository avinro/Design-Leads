"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "motion/react";

/*
 * AboutPortraitCard — TiltedCard-style 3D tilt effect wrapping the portrait
 * image. Adapted from React Bits TiltedCard to TypeScript + Tailwind,
 * with no external CSS file.
 *
 * Behavior by device:
 *   Desktop (pointer: fine) → full 3D tilt + floating caption tooltip.
 *   Mobile / coarse pointer → static card, no tilt, no tooltip.
 *   prefers-reduced-motion  → tilt disabled; motion values stay at 0.
 *
 * 3D CSS properties that Tailwind does not expose as utilities are applied via
 * style={{}} inline:
 *   perspective          on the <figure>
 *   transformStyle       on the inner motion.div (preserve-3d)
 *   translateZ           on the badges overlay (floats in front of the card)
 *   willChange           on the tilt layer
 *
 * Badges live inside the preserve-3d container and use translateZ(40px) so
 * they participate in the tilt and visually float in front of the card surface.
 *
 * Portrait image is passed via `imageSrc` (path under public/).
 */

const SPRING = { damping: 30, stiffness: 100, mass: 2 } as const;

const CAPTION_SPRING = { stiffness: 350, damping: 30, mass: 1 } as const;

const BADGES = ["anime lover", "bad bunny fan", "video games", "crypto enthusiast"] as const;

export interface AboutPortraitCardProps {
  /** Public URL path to the portrait image (e.g. /images/about.jpg). */
  imageSrc: string;
}

export function AboutPortraitCard({ imageSrc }: AboutPortraitCardProps) {
  const figureRef = useRef<HTMLElement>(null);
  const [lastY, setLastY] = useState(0);

  // Tooltip cursor tracking
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // 3D rotation springs
  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);
  const scale = useSpring(1, SPRING);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, CAPTION_SPRING);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (!figureRef.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const rect = figureRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const amplitude = 12;
    rotateX.set((offsetY / (rect.height / 2)) * -amplitude);
    rotateY.set((offsetX / (rect.width / 2)) * amplitude);

    // Offset 20px to the right so the tooltip doesn't sit on the cursor tip.
    cursorX.set(e.clientX - rect.left + 20);
    cursorY.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    scale.set(1.05);
    opacity.set(1);
  }

  function handleMouseLeave() {
    scale.set(1);
    opacity.set(0);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={figureRef}
      data-testid="portrait-card"
      aria-label="Portrait of Ary"
      className="relative flex w-full items-center justify-center"
      style={{ perspective: "800px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/*
       * 3D tilt layer — preserve-3d enables children to use translateZ
       * and truly float in front of the card surface during tilt.
       */}
      <motion.div
        className="relative w-full rounded-xl"
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Card surface — portrait */}
        <div className="border-border/40 bg-muted relative aspect-[3/4] w-full overflow-hidden rounded-xl border">
          <Image
            src={imageSrc}
            alt="Ary — portrait"
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
            priority
          />
        </div>

        {/*
         * Badges overlay — translateZ(40px) lifts them in front of the card.
         * Left-aligned, fades in/out with the same opacity spring as the tooltip
         * so they appear only on hover (desktop) and stay visible on mobile.
         */}
        <motion.div
          aria-label="Interests"
          className="absolute bottom-4 left-0 z-10 flex w-full flex-wrap justify-start gap-2 px-4"
          style={{ transform: "translateZ(40px)", opacity }}
        >
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="bg-background/80 text-foreground rounded-full px-3 py-1 font-mono text-xs tracking-wide uppercase shadow-sm backdrop-blur-sm"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating cursor tooltip — desktop only */}
      <motion.figcaption
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-10 hidden rounded bg-white px-2.5 py-1 font-mono text-[10px] text-[#2d2d2d] md:block"
        style={{
          x: cursorX,
          y: cursorY,
          opacity,
          rotate: rotateFigcaption,
        }}
      >
        Hi! What&apos;s up?
      </motion.figcaption>
    </figure>
  );
}
