import { describe, it, expect, beforeEach } from "vitest";

import { markThresholdFired, _resetFiredThresholds, type ScrollThreshold } from "./events";

/*
 * Unit tests for the analytics event helpers.
 *
 * These tests exercise only the pure, DOM-free logic:
 *   - markThresholdFired — scroll-depth dedupe Map logic.
 *
 * Click and scroll events that require a real browser environment are
 * verified manually during the QA step described in the PR body.
 * The current Vitest configuration uses environment: "node", which cannot
 * exercise IntersectionObserver, document.addEventListener, or PostHog init.
 */

describe("markThresholdFired", () => {
  beforeEach(() => {
    _resetFiredThresholds();
  });

  it("returns true on the first fire for a slug + threshold pair", () => {
    expect(markThresholdFired("hello-dojo", 25)).toBe(true);
  });

  it("returns false on a duplicate fire for the same slug + threshold", () => {
    markThresholdFired("hello-dojo", 25);
    expect(markThresholdFired("hello-dojo", 25)).toBe(false);
  });

  it("tracks thresholds independently per slug", () => {
    expect(markThresholdFired("hello-dojo", 50)).toBe(true);
    expect(markThresholdFired("uma", 50)).toBe(true);
    // Each slug can still fire again only once
    expect(markThresholdFired("hello-dojo", 50)).toBe(false);
    expect(markThresholdFired("uma", 50)).toBe(false);
  });

  it("tracks each threshold independently within the same slug", () => {
    const thresholds: ScrollThreshold[] = [25, 50, 75, 100];
    for (const t of thresholds) {
      expect(markThresholdFired("hello-dojo", t)).toBe(true);
    }
    for (const t of thresholds) {
      expect(markThresholdFired("hello-dojo", t)).toBe(false);
    }
  });

  it("resets state between test runs via _resetFiredThresholds", () => {
    markThresholdFired("hello-dojo", 25);
    _resetFiredThresholds();
    expect(markThresholdFired("hello-dojo", 25)).toBe(true);
  });
});
