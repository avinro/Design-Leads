"use client";

import { useRef, useLayoutEffect, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "motion/react";

/*
 * ScrollVelocity — horizontally scrolling marquee that accelerates/decelerates
 * with the page scroll velocity.
 *
 * Adapted from React Bits (MIT). Key differences:
 *   - `prefers-reduced-motion`: velocity multiplier clamped to 0 so text moves
 *     at a constant base speed with no scroll-driven acceleration.
 *   - `aria-hidden` is applied by the consumer wrapping element, not here.
 *   - No hardcoded typography — consumers pass className for font tokens.
 */

interface VelocityMapping {
  input: [number, number];
  output: [number, number];
}

interface VelocityTextProps {
  children: React.ReactNode;
  baseVelocity: number;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
  reducedMotion?: boolean;
}

export interface ScrollVelocityProps {
  scrollContainerRef?: React.RefObject<HTMLElement>;
  texts: React.ReactNode[];
  velocity?: number;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
}

function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T | null>): number {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, [ref]);

  return width;
}

function VelocityText({
  children,
  baseVelocity,
  scrollContainerRef,
  className = "",
  damping,
  stiffness,
  numCopies = 6,
  velocityMapping,
  parallaxClassName = "",
  scrollerClassName = "",
  parallaxStyle,
  scrollerStyle,
  reducedMotion = false,
}: VelocityTextProps) {
  const baseX = useMotionValue(0);
  const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
  const { scrollY } = useScroll(scrollOptions);
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: damping ?? 50,
    stiffness: stiffness ?? 400,
  });
  const velocityFactor = useTransform(
    smoothVelocity,
    velocityMapping?.input ?? [0, 1000],
    reducedMotion ? [0, 0] : (velocityMapping?.output ?? [0, 5]),
    { clamp: false },
  );

  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef as React.RefObject<HTMLSpanElement>);

  function wrap(min: number, max: number, v: number): number {
    const range = max - min;
    const mod = (((v - min) % range) + range) % range;
    return mod + min;
  }

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return "0px";
    return `${String(wrap(-copyWidth, 0, v))}px`;
  });

  const directionFactor = useRef<number>(1);
  useAnimationFrame((_t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const spans = [];
  for (let i = 0; i < numCopies; i++) {
    spans.push(
      <span className={`shrink-0 ${className}`} key={i} ref={i === 0 ? copyRef : null}>
        {children}&nbsp;
      </span>,
    );
  }

  return (
    <div className={`relative overflow-hidden ${parallaxClassName}`} style={parallaxStyle}>
      <motion.div
        className={`flex whitespace-nowrap ${scrollerClassName}`}
        style={{ x, ...scrollerStyle }}
      >
        {spans}
      </motion.div>
    </div>
  );
}

export function ScrollVelocity({
  scrollContainerRef,
  texts,
  velocity = 100,
  className = "",
  damping,
  stiffness,
  numCopies,
  velocityMapping,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
}: ScrollVelocityProps) {
  // Lazy initializer reads the media query once on mount (client-only).
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <>
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
          reducedMotion={reducedMotion}
        >
          {text}
        </VelocityText>
      ))}
    </>
  );
}

export default ScrollVelocity;
