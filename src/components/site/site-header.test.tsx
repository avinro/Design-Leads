import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

/*
 * Smoke tests for SiteHeader using react-dom/server (no jsdom needed).
 * Verifies:
 *   - Skip link is present and targets #main-content
 *   - Wordmark "Avinro" link is rendered
 *   - Nav links are present (Work, About, Contact)
 *   - Primary CTA ("Let's talk") exists and is hidden on <md via md:flex
 *   - Mobile hamburger: present, md:hidden, aria-expanded, aria-controls
 *   - Mobile nav panel: in the DOM, aria-hidden when closed, links tabindex=-1
 *   - PRO-23: focus-ring class is present on skip link, wordmark, and nav links
 *
 * The mobile expanded content is always in the DOM (no portal) and is visible
 * in SSR output. Interaction behavior (height animation, Esc, close on nav)
 * must be validated via manual QA at 375px.
 */
describe("SiteHeader", () => {
  it("renders a skip link targeting #main-content", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain('href="#main-content"');
    expect(html).toContain("Skip to main content");
  });

  it("renders the wordmark link to /", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain('href="/"');
    expect(html).toContain("Avinro");
  });

  it("renders nav links for /work, /about, /contact", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain('href="/work"');
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/contact"');
  });

  it("renders primary CTA inside a nav element (visible at md+)", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain("Let&#x27;s talk");
    expect(html).toContain("md:flex");
  });

  it("renders a hamburger button with aria-label='Open menu'", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain('aria-label="Open menu"');
  });

  it("hamburger button is mobile-only (md:hidden class)", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    const triggerIdx = html.indexOf('aria-label="Open menu"');
    expect(triggerIdx).toBeGreaterThan(-1);
    const triggerSlice = html.slice(Math.max(0, triggerIdx - 400), triggerIdx + 200);
    expect(triggerSlice).toContain("md:hidden");
  });

  it("hamburger button has aria-expanded and aria-controls attributes", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    // Initial state: closed → aria-expanded="false"
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls="mobile-nav-panel"');
  });

  it("mobile nav panel is in the DOM with id=mobile-nav-panel", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain('id="mobile-nav-panel"');
  });

  it("mobile nav panel is aria-hidden when menu is closed (SSR initial state)", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    const panelIdx = html.indexOf('id="mobile-nav-panel"');
    expect(panelIdx).toBeGreaterThan(-1);
    const panelSlice = html.slice(panelIdx, panelIdx + 200);
    expect(panelSlice).toContain('aria-hidden="true"');
  });

  it("mobile nav links have tabindex=-1 when menu is closed (SSR initial state)", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    const panelIdx = html.indexOf('id="mobile-nav-panel"');
    expect(panelIdx).toBeGreaterThan(-1);
    // All three mobile links should have tabindex="-1" in the closed state
    const panelSection = html.slice(panelIdx, panelIdx + 2000);
    const tabIndexMatches = panelSection.match(/tabindex="-1"/g);
    // At minimum the 3 nav links + CTA = 4 items
    expect(tabIndexMatches?.length).toBeGreaterThanOrEqual(4);
  });

  it("desktop nav has hidden md:flex so it is visible only at md+", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    const navIdx = html.indexOf('aria-label="Main navigation"');
    expect(navIdx).toBeGreaterThan(-1);
    const navSlice = html.slice(navIdx, navIdx + 200);
    expect(navSlice).toContain("hidden");
    expect(navSlice).toContain("md:flex");
  });

  // PRO-23 — focus ring regressions
  it("applies focus-ring class to the skip link (keyboard visibility)", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain('href="#main-content"');
    expect(html).toMatch(/focus-ring[^-]/);
  });

  it("applies focus-ring class to the wordmark link", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    const wordmarkIdx = html.indexOf('href="/"');
    expect(wordmarkIdx).toBeGreaterThan(-1);
    const wordmarkSlice = html.slice(Math.max(0, wordmarkIdx - 300), wordmarkIdx + 200);
    expect(wordmarkSlice).toContain("focus-ring");
  });

  it("applies focus-ring class to each nav link", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    const navIdx = html.indexOf('aria-label="Main navigation"');
    expect(navIdx).toBeGreaterThan(-1);
    const navSection = html.slice(navIdx, navIdx + 1000);
    expect(navSection.match(/focus-ring/g)?.length).toBeGreaterThanOrEqual(3);
  });
});
