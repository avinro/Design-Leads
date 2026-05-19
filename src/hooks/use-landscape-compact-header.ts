"use client";

import { useEffect, useState } from "react";

const QUERY = "(orientation: landscape) and (max-height: 500px)";

/** True in short landscape viewports (keyboard + header compete for space). */
export function useLandscapeCompactHeader(enabled: boolean): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const mq = window.matchMedia(QUERY);
    const run = () => {
      setCompact(mq.matches);
    };
    run();
    mq.addEventListener("change", run);
    return () => {
      mq.removeEventListener("change", run);
    };
  }, [enabled]);

  return compact;
}
