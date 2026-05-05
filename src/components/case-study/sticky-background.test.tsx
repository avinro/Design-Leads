/**
 * Tests for the StickyBackground component.
 *
 * Uses react-dom/server (renderToStaticMarkup) — SSR-only verification.
 *
 * Covers:
 *   - Component renders without throwing during SSR
 *   - aria-hidden is present on the sticky container (decorative imagery)
 *   - pointer-events-none is applied so the overlay does not intercept input
 *   - Component renders null when sections array is empty
 *
 * Note: IntersectionObserver behaviour and image crossfade transitions require
 * a browser environment and are verified manually against the running dev server.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { StickyBackground } from "./sticky-background";

// Stub IntersectionObserver — not available in Node.js / vitest environment.
beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

const mockSections = [
  { id: "problem-statement", image: "/case-studies/uma/problem-statement.svg" },
  { id: "process", image: "/case-studies/uma/process.svg" },
];

describe("StickyBackground", () => {
  it("renders without throwing during SSR", () => {
    expect(() => renderToStaticMarkup(<StickyBackground sections={mockSections} />)).not.toThrow();
  });

  it("renders aria-hidden on the sticky container (decorative layer)", () => {
    const html = renderToStaticMarkup(<StickyBackground sections={mockSections} />);
    expect(html).toContain('aria-hidden="true"');
  });

  it("applies pointer-events-none so the overlay does not intercept input", () => {
    const html = renderToStaticMarkup(<StickyBackground sections={mockSections} />);
    expect(html).toContain("pointer-events-none");
  });

  it("renders the first section image as the initial background", () => {
    const html = renderToStaticMarkup(<StickyBackground sections={mockSections} />);
    expect(html).toContain("problem-statement.svg");
  });

  it("renders null when sections array is empty", () => {
    const html = renderToStaticMarkup(<StickyBackground sections={[]} />);
    expect(html).toBe("");
  });
});
