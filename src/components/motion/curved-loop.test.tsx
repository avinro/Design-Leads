import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

/*
 * CurvedLoop smoke tests.
 *
 * CurvedLoop uses useReducedMotion from motion/react. We mock it so tests
 * run in Node without browser APIs. The key assertions are:
 *   - aria-hidden applied to the outer div (it's decorative)
 *   - marqueeText content is present in the SVG even before spacing is measured
 *     (the measure <text> element always renders the raw text)
 *   - The component doesn't throw when rendered server-side
 */
vi.mock("motion/react", () => ({
  useReducedMotion: () => false,
}));

import { CurvedLoop } from "./curved-loop";

describe("CurvedLoop", () => {
  it("renders without throwing", () => {
    expect(() => renderToStaticMarkup(<CurvedLoop marqueeText="WORK *" />)).not.toThrow();
  });

  it("applies aria-hidden to the container (decorative element)", () => {
    const html = renderToStaticMarkup(<CurvedLoop marqueeText="WORK *" />);
    expect(html).toContain('aria-hidden="true"');
  });

  it("includes the marquee text in the hidden measurement element", () => {
    const html = renderToStaticMarkup(<CurvedLoop marqueeText="SELECTED WORK" />);
    // The invisible measure <text> always contains the raw text
    expect(html).toContain("SELECTED WORK");
  });

  it("renders an SVG element", () => {
    const html = renderToStaticMarkup(<CurvedLoop marqueeText="TEST" />);
    expect(html).toContain("<svg");
  });
});

/*
 * Reduced-motion: the module-level mock (useReducedMotion: () => false) is
 * hoisted and applies to all tests in this file. The static-render tests above
 * already exercise the rendered output path. A dedicated reduced-motion test
 * would require a separate test file with its own mock returning true.
 */
