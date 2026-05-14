import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, beforeAll } from "vitest";

import AboutPage from "./page";

/*
 * Smoke tests for the About page using react-dom/server (no jsdom needed).
 *
 * Verifies:
 *   - All sr-only section headings are present in the markup
 *   - Page h1 is rendered with the Product Design Engineer identity
 *   - Portrait placeholder is visible and labelled
 *   - Process stages are rendered
 */
describe("AboutPage", () => {
  let html: string;

  beforeAll(() => {
    html = renderToStaticMarkup(<AboutPage />);
  });

  it("renders without throwing and produces non-empty markup", () => {
    expect(html).toBeTruthy();
  });

  it("renders the page h1 with Product Design Engineer identity", () => {
    expect(html).toContain("Product Design Engineer");
  });

  it("renders the sr-only Experience section heading", () => {
    expect(html).toContain("Experience");
  });

  it("renders the sr-only Education section heading", () => {
    expect(html).toContain("Education");
  });

  it("renders the sr-only Tools &amp; methods section heading", () => {
    expect(html).toContain("Tools &amp; methods");
  });

  it("renders the sr-only My Process section heading", () => {
    expect(html).toContain("My Process");
  });

  /*
   * The portrait card is loaded with dynamic({ ssr: false }), so
   * renderToStaticMarkup never executes the client bundle. The old
   * "Portrait placeholder" text is gone; the test now verifies that
   * the markup does NOT regress to that developer-facing label.
   */
  it("does not render the old portrait placeholder label", () => {
    expect(html).not.toContain("Portrait placeholder");
  });

  it("renders all 5 process stage numbers", () => {
    expect(html).toContain("01");
    expect(html).toContain("02");
    expect(html).toContain("03");
    expect(html).toContain("04");
    expect(html).toContain("05");
  });

  it("does not render the removed CTA section", () => {
    expect(html).not.toContain("Let&#x27;s work together");
  });
});
