import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Container } from "./container";

/*
 * Smoke tests using react-dom/server to avoid pulling jsdom into the
 * vitest config. These verify the public contract of Container:
 *   - it renders a <div> with data-slot="container"
 *   - the width variant maps to the right max-width class
 *   - className overrides can extend the variant output
 */
describe("Container", () => {
  it("renders a div with data-slot and default width", () => {
    const html = renderToStaticMarkup(<Container>child</Container>);
    expect(html).toContain('data-slot="container"');
    expect(html).toContain('data-width="default"');
    expect(html).toContain("max-w-6xl");
    expect(html).toContain("mx-auto");
  });

  it("applies width=narrow", () => {
    const html = renderToStaticMarkup(<Container width="narrow">x</Container>);
    expect(html).toContain('data-width="narrow"');
    expect(html).toContain("max-w-prose");
    expect(html).not.toContain("max-w-6xl");
  });

  it("applies width=caseStudy", () => {
    const html = renderToStaticMarkup(<Container width="caseStudy">x</Container>);
    expect(html).toContain('data-width="caseStudy"');
    expect(html).toContain("max-w-[1420px]");
    expect(html).not.toContain("max-w-6xl");
  });

  it("applies width=full", () => {
    const html = renderToStaticMarkup(<Container width="full">x</Container>);
    expect(html).toContain("max-w-none");
  });

  it("merges consumer className", () => {
    const html = renderToStaticMarkup(<Container className="custom-class">x</Container>);
    expect(html).toContain("custom-class");
  });
});
