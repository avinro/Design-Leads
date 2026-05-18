import { INTRO_PENDING_HTML_CLASS, INTRO_SEEN_SESSION_KEY } from "@/lib/intro/constants";

/**
 * Inline script for the root layout <head>.
 * Runs synchronously before body paint so the homepage never flashes on first visit.
 */
export const INTRO_BLOCK_FIRST_PAINT_SCRIPT = `(function(){try{if(!sessionStorage.getItem(${JSON.stringify(INTRO_SEEN_SESSION_KEY)})){document.documentElement.classList.add(${JSON.stringify(INTRO_PENDING_HTML_CLASS)});}}catch(e){}})();`;

/** Clears the first-paint cover once the site is allowed to show. */
export function clearIntroPendingMark(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove(INTRO_PENDING_HTML_CLASS);
}
