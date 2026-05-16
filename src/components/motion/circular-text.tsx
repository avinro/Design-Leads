"use client";

/*
 * CircularText — port of the React Bits CircularText component.
 *
 * Adaptations from the original:
 *   - TypeScript strict props, no separate CSS file.
 *   - useReducedMotion(): skips spin and shuffle animations.
 *   - Optional textChangeTransition="shuffle": GSAP-timed stagger when `text`
 *     changes (scramble + settle per letter; no SplitText / Club plugins).
 *     Parent `text` is the single source of truth (e.g. hover vs idle). Each
 *     shuffle run animates from the current on-screen string (ref snapshot) to
 *     `text`, never from a stale "committed" snapshot that could lag behind
 *     rapid hover toggles (B→A interrupted must animate toward A, not snap to B).
 */

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion, useAnimation, useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type CircularTextOnHover = "slowDown" | "speedUp" | "pause" | "goBonkers";

export type CircularTextChangeTransition = "none" | "shuffle";

export interface CircularTextProps {
  text: string;
  size?: number;
  spinDuration?: number;
  onHover?: CircularTextOnHover;
  className?: string;
  "aria-label"?: string;
  fontSize?: string;
  textChangeTransition?: CircularTextChangeTransition;
  shuffleStagger?: number;
  shuffleEvenGroupOffset?: number;
  shuffleCharset?: string;
}

const DEFAULT_SHUFFLE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&·";

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

function randomFromCharset(charset: string): string {
  if (!charset.length) return " ";
  return charset.charAt(Math.floor(Math.random() * charset.length));
}

function replaceAt(s: string, i: number, ch: string): string {
  if (i < 0 || i >= s.length) return s;
  return s.slice(0, i) + ch + s.slice(i + 1);
}

export function CircularText({
  text,
  size = 200,
  spinDuration = 20,
  onHover = "speedUp",
  className,
  "aria-label": ariaLabel,
  fontSize,
  textChangeTransition = "none",
  shuffleStagger = 0.03,
  shuffleEvenGroupOffset,
  shuffleCharset = DEFAULT_SHUFFLE_CHARSET,
}: CircularTextProps) {
  const reducedMotion = useReducedMotion();
  const controls = useAnimation();
  const rotation = useMotionValue(0);
  const shuffleActive = textChangeTransition === "shuffle" && !reducedMotion;
  const [shuffleChars, setShuffleChars] = useState(() => text);
  const [shuffleLayoutSlots, setShuffleLayoutSlots] = useState(() => Math.max(1, text.length));
  const committedTextRef = useRef(text);
  /** Mirrors the last painted shuffle string so layout effects read committed output. */
  const displayCharsRef = useRef(shuffleChars);
  /** Latest `text` prop for stale timeline onComplete / callbacks. */
  const textRef = useRef(text);
  const shuffleGenRef = useRef(0);
  const shuffleTlRef = useRef<gsap.core.Timeline | null>(null);
  const prevShuffleActiveRef = useRef(false);

  const displayChars = shuffleActive ? shuffleChars : text;
  const layoutSlots = shuffleActive ? shuffleLayoutSlots : Math.max(1, text.length);

  useLayoutEffect(() => {
    displayCharsRef.current = displayChars;
    textRef.current = text;
  }, [displayChars, text]);

  useLayoutEffect(() => {
    if (shuffleActive) {
      if (!prevShuffleActiveRef.current) {
        shuffleTlRef.current?.kill();
        shuffleTlRef.current = null;
        setShuffleChars(text);
        setShuffleLayoutSlots(Math.max(1, text.length));
        committedTextRef.current = text;
      }
    } else {
      shuffleTlRef.current?.kill();
      shuffleTlRef.current = null;
      committedTextRef.current = text;
    }
    prevShuffleActiveRef.current = shuffleActive;
  }, [shuffleActive, text]);

  const letters = Array.from(displayChars);

  /* Spin restarts: use parent `text` during shuffle so per-letter setState does not retrigger Motion. */
  const spinSignature = textChangeTransition === "shuffle" && !reducedMotion ? text : displayChars;

  /* Shuffle path: always animate from current on-screen string toward prop `text`. */
  useLayoutEffect(() => {
    if (textChangeTransition !== "shuffle" || reducedMotion) return;

    shuffleTlRef.current?.kill();
    shuffleTlRef.current = null;

    const target = text;
    const fromStr = displayCharsRef.current;

    if (fromStr === target) {
      committedTextRef.current = target;
      setShuffleLayoutSlots(Math.max(1, target.length));
      return;
    }

    const fromLen = Math.max(1, fromStr.length);
    const toLen = Math.max(1, target.length);
    const gen = ++shuffleGenRef.current;

    const n = Math.max(fromStr.length, target.length);
    const fromPadded = fromStr.padEnd(n, " ");
    const toPadded = target.padEnd(n, " ");

    setShuffleChars(fromPadded);
    setShuffleLayoutSlots(fromLen);

    const evenOffset =
      shuffleEvenGroupOffset ??
      (() => {
        const oddCount = Math.ceil(n / 2);
        const oddSpan = Math.max(0, oddCount - 1) * shuffleStagger + 0.18;
        return oddSpan * 0.7;
      })();

    const oddIndices = Array.from({ length: n }, (_, i) => i).filter((i) => i % 2 === 1);
    const evenIndices = Array.from({ length: n }, (_, i) => i).filter((i) => i % 2 === 0);

    let letterEndMax = 0;
    const noteEnd = (timePos: number) => {
      letterEndMax = Math.max(letterEndMax, timePos + 0.12);
    };
    oddIndices.forEach((_, idx) => {
      noteEnd(idx * shuffleStagger);
    });
    evenIndices.forEach((_, idx) => {
      noteEnd(evenOffset + idx * shuffleStagger);
    });
    const layoutDuration = Math.max(letterEndMax, 0.2);

    const layoutProxy = { n: fromLen };

    const tl = gsap.timeline({
      defaults: { duration: 0.001 },
      onComplete: () => {
        if (gen !== shuffleGenRef.current) return;
        // Parent may have changed hover again; do not apply a finished run for an old target.
        if (textRef.current !== target) return;
        committedTextRef.current = target;
        setShuffleChars(target);
        setShuffleLayoutSlots(toLen);
        shuffleTlRef.current = null;
      },
    });
    shuffleTlRef.current = tl;

    if (fromLen !== toLen) {
      tl.to(
        layoutProxy,
        {
          n: toLen,
          duration: layoutDuration,
          ease: "power2.inOut",
          onUpdate: () => {
            if (gen !== shuffleGenRef.current) return;
            setShuffleLayoutSlots(Math.max(1, layoutProxy.n));
          },
        },
        0,
      );
    }

    const addLetter = (i: number, finalCh: string, timePos: number) => {
      tl.call(
        () => {
          if (gen !== shuffleGenRef.current) return;
          setShuffleChars((prev) => replaceAt(prev, i, randomFromCharset(shuffleCharset)));
        },
        undefined,
        timePos,
      );
      tl.call(
        () => {
          if (gen !== shuffleGenRef.current) return;
          setShuffleChars((prev) => replaceAt(prev, i, randomFromCharset(shuffleCharset)));
        },
        undefined,
        timePos + 0.04,
      );
      tl.call(
        () => {
          if (gen !== shuffleGenRef.current) return;
          setShuffleChars((prev) => replaceAt(prev, i, finalCh));
        },
        undefined,
        timePos + 0.12,
      );
    };

    oddIndices.forEach((i, idx) => {
      addLetter(i, toPadded[i] ?? " ", idx * shuffleStagger);
    });
    evenIndices.forEach((i, idx) => {
      addLetter(i, toPadded[i] ?? " ", evenOffset + idx * shuffleStagger);
    });

    return () => {
      tl.kill();
      if (shuffleTlRef.current === tl) shuffleTlRef.current = null;
    };
  }, [
    text,
    textChangeTransition,
    reducedMotion,
    shuffleStagger,
    shuffleEvenGroupOffset,
    shuffleCharset,
  ]);

  useEffect(() => {
    if (reducedMotion) return;

    const start = rotation.get();
    void controls.start({
      rotate: start + 360,
      scale: 1,
      transition: buildTransition(spinDuration, start),
    });
  }, [spinDuration, spinSignature, controls, rotation, reducedMotion]);

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
      aria-label={ariaLabel ?? text.trimEnd()}
      className={cn("relative cursor-pointer", className)}
      style={{ width: size, height: size, rotate: rotation }}
      initial={{ rotate: 0 }}
      animate={reducedMotion ? undefined : controls}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      {letters.map((letter, i) => {
        const slots = Math.max(layoutSlots, 1e-6);
        const rotationDeg = (360 / slots) * i;
        const factor = Math.PI / slots;
        const x = factor * i;
        const y = factor * i;
        const transform = `rotateZ(${String(rotationDeg)}deg) translate3d(${String(x)}px, ${String(y)}px, 0)`;
        const visible = i + 1 <= layoutSlots + 1e-6;
        return (
          <span
            key={i}
            aria-hidden="true"
            className="absolute inset-0 inline-block text-center font-bold"
            style={{
              transform,
              WebkitTransform: transform,
              fontSize: fontSize ?? Math.max(12, size * 0.12),
              opacity: visible ? 1 : 0,
              visibility: visible ? "visible" : "hidden",
              transition:
                textChangeTransition === "shuffle" && !reducedMotion
                  ? "none"
                  : "all 0.5s cubic-bezier(0, 0, 0, 1)",
            }}
          >
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
}
