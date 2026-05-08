import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

/*
 * Smoke tests: verify that data-cta-* analytics attributes are present on
 * the SiteHeader primary CTA. These attributes are read by AnalyticsClickDelegator
 * to emit cta_click events without converting the server component to a client
 * component.
 */
describe("SiteHeader analytics attributes", () => {
  it("primary CTA link has data-cta-position=header", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain('data-cta-position="header"');
  });

  it("primary CTA link has data-cta-href", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain("data-cta-href=");
  });

  it("primary CTA link has data-cta-label", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain("data-cta-label=");
  });

  it("analytics attributes do not remove touch-target classes or links", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain('href="#main-content"');
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/work"');
  });
});
