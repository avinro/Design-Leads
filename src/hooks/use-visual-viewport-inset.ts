"use client";

import { useEffect, useState } from "react";

export interface VisualViewportState {
  /** Approximate bottom inset from the OS keyboard overlapping the layout viewport (px). */
  keyboardInset: number;
  /** Visual viewport height when available; falls back to innerHeight. */
  viewportHeight: number;
}

/**
 * Tracks Visual Viewport API metrics for mobile keyboard and browser chrome.
 * Falls back gracefully when `visualViewport` is missing.
 */
export function useVisualViewportInset(enabled: boolean): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    keyboardInset: 0,
    viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (!enabled) return;

    const vv = window.visualViewport;
    if (!vv) {
      const onResize = () => {
        setState({ keyboardInset: 0, viewportHeight: window.innerHeight });
      };
      onResize();
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }

    const update = () => {
      const insetBottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setState({
        keyboardInset: insetBottom,
        viewportHeight: vv.height,
      });
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [enabled]);

  return state;
}
