"use client";

/*
 * CurvedLoop — port of the React Bits CurvedLoop component.
 *
 * Adaptations from the original:
 *   - TypeScript strict props, no PropTypes.
 *   - No separate CSS file — layout and typography via Tailwind and inline style.
 *   - useReducedMotion() from motion/react: when true the rAF animation loop is
 *     never started and the text is rendered statically on its SVG path. The
 *     curved shape and text content remain fully visible.
 *   - `interactive` defaults to false — drag is opt-in since pointer capture on
 *     a marquee conflicts with native touch scroll on mobile.
 *   - Container height is prop-driven (default 120px SVG viewBox) rather than
 *     100vh from the original CSS. Use inside a <Section> for rhythm.
 *   - Fill colour defaults to `currentColor` so the component inherits
 *     text-foreground / text-background from the parent.
 */

import { useRef, useEffect, useState, useMemo, useId, useCallback } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface CurvedLoopProps {
  marqueeText: string;
  /** Pixels of vertical curve on the SVG path. Default 200. */
  curveAmount?: number;
  /** Pixels per frame scrolled. Default 2. */
  speed?: number;
  /** "left" or "right". Default "left". */
  direction?: "left" | "right";
  /** Allow pointer drag to change offset. Default false. */
  interactive?: boolean;
  /** Extra classes applied to the text element inside SVG. */
  className?: string;
  /** Font size for the curved text. Default "5rem". */
  fontSize?: string;
}

export function CurvedLoop({
  marqueeText,
  curveAmount = 200,
  speed = 2,
  direction = "left",
  interactive = false,
  className,
  fontSize = "5rem",
}: CurvedLoopProps) {
  const reducedMotion = useReducedMotion();

  const text = useMemo(() => {
    const trimmed = marqueeText.replace(/\s+$/, "");
    return trimmed + "\u00A0";
  }, [marqueeText]);

  const measureRef = useRef<SVGTextElement>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  // Track drag state via useState so cursor style is reactive without reading
  // refs during render (which triggers react-hooks/refs lint error).
  const [isDragging, setIsDragging] = useState(false);
  const uid = useId();
  const pathId = `curve-${uid}`;

  const pathD = `M-100,40 Q720,${String(40 + curveAmount)} 1540,40`;

  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const velRef = useRef(0);
  const dirRef = useRef(direction);

  useEffect(() => {
    if (measureRef.current) {
      setSpacing(measureRef.current.getComputedTextLength());
    }
  }, [text, className, fontSize]);

  useEffect(() => {
    if (!spacing || !textPathRef.current) return;
    const initial = -spacing;
    textPathRef.current.setAttribute("startOffset", String(initial) + "px");
    setOffset(initial);
  }, [spacing]);

  useEffect(() => {
    if (!spacing || reducedMotion) return;

    let frame: number;
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === "right" ? speed : -speed;
        const current = parseFloat(textPathRef.current.getAttribute("startOffset") ?? "0");
        let next = current + delta;
        if (next <= -spacing) next += spacing;
        if (next > 0) next -= spacing;
        textPathRef.current.setAttribute("startOffset", String(next) + "px");
        setOffset(next);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [spacing, speed, reducedMotion]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive) return;
      dragRef.current = true;
      setIsDragging(true);
      lastXRef.current = e.clientX;
      velRef.current = 0;
      (e.target as Element).setPointerCapture(e.pointerId);
    },
    [interactive],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || !dragRef.current || !textPathRef.current) return;
      const dx = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      velRef.current = dx;
      const current = parseFloat(textPathRef.current.getAttribute("startOffset") ?? "0");
      let next = current + dx;
      if (next <= -spacing) next += spacing;
      if (next > 0) next -= spacing;
      textPathRef.current.setAttribute("startOffset", String(next) + "px");
      setOffset(next);
    },
    [interactive, spacing],
  );

  const endDrag = useCallback(() => {
    if (!interactive) return;
    dragRef.current = false;
    setIsDragging(false);
    dirRef.current = velRef.current > 0 ? "right" : "left";
  }, [interactive]);

  const ready = spacing > 0;

  const totalText = ready
    ? Array(Math.ceil(1800 / spacing) + 2)
        .fill(text)
        .join("")
    : text;

  const cursorStyle = interactive ? (isDragging ? "grabbing" : "grab") : "auto";

  return (
    <div
      aria-hidden="true"
      className={cn("w-full overflow-hidden", !ready && "invisible")}
      style={{ cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <svg
        viewBox="0 0 1440 120"
        className="block w-full overflow-visible select-none"
        style={{
          aspectRatio: "100 / 12",
          fontSize,
          fill: "currentColor",
          fontWeight: 700,
          textTransform: "uppercase",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        <text
          ref={measureRef}
          xmlSpace="preserve"
          style={{ visibility: "hidden", opacity: 0, pointerEvents: "none" }}
        >
          {text}
        </text>

        <defs>
          <path id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>

        {ready && (
          <text fontWeight="bold" xmlSpace="preserve" className={className}>
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              startOffset={String(offset) + "px"}
              xmlSpace="preserve"
            >
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
}
