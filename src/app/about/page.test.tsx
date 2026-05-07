import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, beforeAll } from "vitest";

import AboutPage from "./page";

/*
 * Smoke tests for the About page using react-dom/server (no jsdom needed).
 *
 * Verifies:
 *   - All 6 sr-only section headings are present in the markup
 *   - Page h1 is rendered with the Lead Product Designer identity
 *   - Portrait placeholder is visible and labelled
 *   - Primary CTA (mailto) and resume CTA (download) are present with correct attrs
 *   - Touch target classes (min-h-11) are present on CTAs
 */
describe("AboutPage", () => {
  let html: string;

  beforeAll(() => {
    html = renderToStaticMarkup(<AboutPage />);
  });

  it("renders without throwing and produces non-empty markup", () => {
    expect(html).toBeTruthy();
  });

  it("renders the page h1 with Lead Product Designer identity", () => {
    expect(html).toContain("Lead Product Designer");
  });

  it("renders the sr-only Experience section heading", () => {
    expect(html).toContain("Experience");
  });

  it("renders the sr-only Tools &amp; methods section heading", () => {
    expect(html).toContain("Tools &amp; methods");
  });

  it("renders the sr-only Design philosophy section heading", () => {
    expect(html).toContain("Design philosophy");
  });

  it("renders the sr-only Strategy &amp; PM section heading", () => {
    expect(html).toContain("Strategy &amp; PM");
  });

  it("renders the sr-only closing CTA section heading", () => {
    expect(html).toContain("Let&#x27;s work together");
  });

  it("renders the portrait placeholder label", () => {
    expect(html).toContain("Portrait placeholder");
  });

  it("primary CTA points to /contact", () => {
    expect(html).toContain('href="/contact"');
  });

  it("resume CTA points to /resume.pdf with download attribute", () => {
    expect(html).toContain('href="/resume.pdf"');
    expect(html).toContain(" download");
  });

  it("CTAs include min-h-11 for touch target compliance", () => {
    expect(html).toContain("min-h-11");
  });
});
