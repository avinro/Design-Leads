"use client";

import { useCallback, useEffect, useRef } from "react";

const NEAR_BOTTOM_PX = 56;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface UseStickToBottomReturn {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  /** Call when the user sends a message or the sheet opens to force the next scroll-to-bottom. */
  markForceStick: () => void;
  /** Scrolls the container to the bottom if the user was already at the bottom or `force` is true. */
  scrollToBottomIfNeeded: (options?: { force?: boolean; instant?: boolean }) => void;
}

/**
 * Manages scroll stickiness for a flex child overflow container: auto-scroll only while the user
 * stays near the bottom; respects prefers-reduced-motion; throttles via rAF for streaming.
 */
export function useStickToBottom(): UseStickToBottomReturn {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const userAtBottomRef = useRef(true);
  const forceNextStickRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const flushScroll = useCallback((instant: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.scrollTop = el.scrollHeight;
    } else if (instant) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
    userAtBottomRef.current = true;
  }, []);

  const scrollToBottomIfNeeded = useCallback(
    (options?: { force?: boolean; instant?: boolean }) => {
      const force = options?.force === true;
      const instant = options?.instant === true;

      if (!force && !forceNextStickRef.current && !userAtBottomRef.current) {
        return;
      }

      if (forceNextStickRef.current) {
        forceNextStickRef.current = false;
      }

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        flushScroll(instant);
      });
    },
    [flushScroll],
  );

  const markForceStick = useCallback(() => {
    forceNextStickRef.current = true;
    userAtBottomRef.current = true;
  }, []);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    userAtBottomRef.current = distance < NEAR_BOTTOM_PX;
  }, []);

  useEffect(
    () => () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    },
    [],
  );

  return { scrollRef, onScroll, markForceStick, scrollToBottomIfNeeded };
}
