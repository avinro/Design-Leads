import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MobileCtaBar } from "./mobile-cta-bar";

/*
 * Smoke tests: verify that data-cta-* analytics attributes are present on
 * the MobileCtaBar CTA trigger button.
 */
describe("MobileCtaBar analytics attributes", () => {
  it("CTA trigger has data-cta-position=mobile_bar", () => {
    const html = renderToStaticMarkup(<MobileCtaBar />);
    expect(html).toContain('data-cta-position="mobile_bar"');
  });

  it("CTA trigger has data-cta-href", () => {
    const html = renderToStaticMarkup(<MobileCtaBar />);
    expect(html).toContain("data-cta-href=");
  });

  it("CTA trigger has data-cta-label", () => {
    const html = renderToStaticMarkup(<MobileCtaBar />);
    expect(html).toContain("data-cta-label=");
  });

  it("still includes min-h-[44px] touch target class", () => {
    const html = renderToStaticMarkup(<MobileCtaBar />);
    expect(html).toContain("min-h-[44px]");
  });
});
