"use client";

/*
 * CircularText — port of the React Bits CircularText component.
 *
 * Adaptations from the original:
 *   - TypeScript strict props, no PropTypes.
 *   - No separate CSS file — dimensions driven by `size` prop via inline style.
 *   - useReducedMotion() hook from motion/react: when true, rotation animation
 *     is skipped entirely and hover handlers are disabled. Letters remain
 *     statically positioned so the component is still visually meaningful.
 *   - aria-label on the container makes the rotating text accessible as a
 *     single readable phrase. All letter <span>s carry aria-hidden="true".
 *   - Continuous rAF-style rotation handled by motion animate() loop.
 */

import { useEffect, useRef } from "react";
import { motion, useAnimation, useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type CircularTextOnHover = "slowDown" | "speedUp" | "pause" | "goBonkers";

export interface CircularTextProps {
  text: string;
  /** Diameter of the circle in pixels. Default 200. */
  size?: number;
  /** Duration in seconds for one full rotation. Default 20. */
  spinDuration?: number;
  onHover?: CircularTextOnHover;
  className?: string;
  /** Accessible label for the circular text (read instead of individual letters). */
  "aria-label"?: string;
}

function buildRotationTransition(duration: number, from: number, loop = true) {
  return {
    from,
    to: from + 360,
    ease: "linear" as const,
    duration,
    type: "tween" as const,
    repeat: loop ? Infinity : 0,
  };
}

function buildTransition(duration: number, from: number) {
  return {
    rotate: buildRotationTransition(duration, from),
    scale: { type: "spring" as const, damping: 20, stiffness: 300 },
  };
}

export function CircularText({
  text,
  size = 200,
  spinDuration = 20,
  onHover = "speedUp",
  className,
  "aria-label": ariaLabel,
}: CircularTextProps) {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation = useMotionValue(0);
  const reducedMotion = useReducedMotion();

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    if (reducedMotion) return;

    const start = rotation.get();
    void controls.start({
      rotate: start + 360,
      scale: 1,
      transition: buildTransition(spinDuration, start),
    });

    return () => {
      mountedRef.current = false;
    };
  }, [spinDuration, text, controls, rotation, reducedMotion]);

  const handleHoverStart = () => {
    if (reducedMotion) return;
    const start = rotation.get();
    let transition;
    let scaleVal = 1;

    switch (onHover) {
      case "slowDown":
        transition = buildTransition(spinDuration * 2, start);
        break;
      case "speedUp":
        transition = buildTransition(spinDuration / 4, start);
        break;
      case "pause":
        transition = {
          rotate: { type: "spring" as const, damping: 20, stiffness: 300 },
          scale: { type: "spring" as const, damping: 20, stiffness: 300 },
        };
        break;
      case "goBonkers":
        transition = buildTransition(spinDuration / 20, start);
        scaleVal = 0.8;
        break;
      default:
        transition = buildTransition(spinDuration, start);
    }

    void controls.start({ rotate: start + 360, scale: scaleVal, transition });
  };

  const handleHoverEnd = () => {
    if (reducedMotion) return;
    const start = rotation.get();
    void controls.start({
      rotate: start + 360,
      scale: 1,
      transition: buildTransition(spinDuration, start),
    });
  };

  return (
    <motion.div
      role="img"
      aria-label={ariaLabel ?? text}
      className={cn("relative cursor-pointer", className)}
      style={{ width: size, height: size, rotate: rotation }}
      initial={{ rotate: 0 }}
      animate={reducedMotion ? undefined : controls}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      {letters.map((letter, i) => {
        const rotationDeg = (360 / letters.length) * i;
        const factor = Math.PI / letters.length;
        const x = factor * i;
        const y = factor * i;
        const transform = `rotateZ(${String(rotationDeg)}deg) translate3d(${String(x)}px, ${String(y)}px, 0)`;
        return (
          <span
            key={i}
            aria-hidden="true"
            className="absolute inset-0 inline-block text-center font-bold"
            style={{
              transform,
              WebkitTransform: transform,
              fontSize: Math.max(12, size * 0.12),
              transition: "all 0.5s cubic-bezier(0, 0, 0, 1)",
            }}
          >
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
}
