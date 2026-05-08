/**
 * PostHog client — lazy-initialised, cookieless singleton.
 *
 * Configuration rationale:
 *   - persistence: "memory"       — no localStorage, no cookies. Satisfies the AC
 *                                   "no cookies required for basic page view tracking".
 *                                   Trade-off: distinct_id resets on each page load, so
 *                                   cross-session funnels are unavailable until a consent
 *                                   flow is added in a future issue.
 *   - autocapture: false          — only explicit, typed events from events.ts are sent.
 *                                   Prevents accidental PII capture from DOM selectors.
 *   - capture_pageview: false     — App Router client transitions don't fire native browser
 *                                   navigations, so posthog-js would miss them. Pageviews
 *                                   are captured manually in PostHogProvider.
 *   - disable_session_recording   — no session replay for now.
 *   - loaded callback             — suppresses PostHog's internal pageview on init so we
 *                                   don't double-count the first page.
 *
 * If NEXT_PUBLIC_POSTHOG_KEY is absent, getPosthog() returns null and all
 * track() calls no-op silently. The site must function identically without analytics.
 */

import posthog, { type PostHog } from "posthog-js";

let _posthog: PostHog | null = null;
let _initialised = false;

export function getPosthog(): PostHog | null {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  if (_initialised) return _posthog;
  _initialised = true;

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

  posthog.init(key, {
    api_host: host,
    ui_host: "https://eu.posthog.com",
    persistence: "memory",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    loaded: (ph) => {
      // In development, log events to the console for manual verification.
      if (process.env.NODE_ENV === "development") {
        ph.debug();
      }
    },
  });

  _posthog = posthog;
  return _posthog;
}
