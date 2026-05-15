/**
 * Typed analytics event contract.
 *
 * All events are defined here so that:
 *   - Event names and payloads are enforced by TypeScript at the call site.
 *   - Dashboard queries always use the canonical string constants.
 *   - Adding a new event is a single diff in this file, immediately caught by the compiler.
 *
 * Closed enum types prevent ad-hoc strings from entering the data pipeline:
 *   - CtaPosition  — which surface triggered the CTA click.
 *   - WorkCardSource — which listing the work card lives in.
 *   - ScrollThreshold — the four standard depth milestones.
 */

import { getPosthog } from "./posthog";

// ---------------------------------------------------------------------------
// Enum types
// ---------------------------------------------------------------------------

export type CtaPosition =
  | "header"
  | "mobile_bar"
  | "hero_secondary"
  | "footer_link"
  | "next_case"
  | "next_work"
  | "prev_work";

export type WorkCardSource = "home_selected_work" | "work_listing";

export type ScrollThreshold = 25 | 50 | 75 | 100;

// ---------------------------------------------------------------------------
// Event union
// ---------------------------------------------------------------------------

export type AppEvent =
  | {
      name: "cta_click";
      props: { label: string; href: string; position: CtaPosition; page: string };
    }
  | {
      name: "work_card_click";
      props: { slug: string; title: string; source: WorkCardSource };
    }
  | {
      name: "case_study_scroll";
      props: { slug: string; threshold: ScrollThreshold };
    }
  | { name: "calendly_modal_open"; props: { position: string } };

// ---------------------------------------------------------------------------
// Core track helper
// ---------------------------------------------------------------------------

/**
 * Fire a typed analytics event. No-ops silently when:
 *   - NEXT_PUBLIC_POSTHOG_KEY is absent.
 *   - PostHog fails to initialise.
 *   - Called during SSR.
 */
export function track(event: AppEvent): void {
  try {
    const ph = getPosthog();
    if (!ph) return;
    ph.capture(event.name, event.props);
  } catch {
    // Tracking must never break the UI.
  }
}

// ---------------------------------------------------------------------------
// Per-event helpers
// ---------------------------------------------------------------------------

export function trackCtaClick(props: {
  label: string;
  href: string;
  position: CtaPosition;
  page: string;
}): void {
  track({ name: "cta_click", props });
}

export function trackWorkCardClick(props: {
  slug: string;
  title: string;
  source: WorkCardSource;
}): void {
  track({ name: "work_card_click", props });
}

export function trackCaseStudyScroll(props: { slug: string; threshold: ScrollThreshold }): void {
  track({ name: "case_study_scroll", props });
}

export function trackCalendlyModalOpen(position: string): void {
  track({ name: "calendly_modal_open", props: { position } });
}

// ---------------------------------------------------------------------------
// Scroll-depth dedupe helper (pure, no DOM)
// ---------------------------------------------------------------------------

/**
 * Returns a Set of thresholds that have already fired for a given slug.
 * Called by CaseStudyScrollTracker to guard against duplicate events when
 * the user scrolls back and forward within the same SPA session.
 *
 * The Map is module-level so it persists across component remounts but is
 * cleared on full page reload (consistent with `persistence: "memory"`).
 */
const _firedThresholds = new Map<string, Set<ScrollThreshold>>();

export function markThresholdFired(slug: string, threshold: ScrollThreshold): boolean {
  let set = _firedThresholds.get(slug);
  if (!set) {
    set = new Set<ScrollThreshold>();
    _firedThresholds.set(slug, set);
  }
  if (set.has(threshold)) return false; // already fired
  set.add(threshold);
  return true; // first time — caller should fire the event
}

/** Exposed for unit tests only. Resets all fired thresholds. */
export function _resetFiredThresholds(): void {
  _firedThresholds.clear();
}
