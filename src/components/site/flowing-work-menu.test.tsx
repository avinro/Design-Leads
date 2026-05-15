import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { FlowingWorkMenu } from "./flowing-work-menu";
import type { SelectedWorkItem } from "./flowing-work-menu";

/*
 * FlowingWorkMenu tests.
 *
 * GSAP is mocked — it relies on browser APIs not available in Node.
 *
 * Covers:
 *   - SSR render without crashing.
 *   - Case-study items link to /case-studies/[slug].
 *   - Work items link to /work/[slug].
 *   - Titles are present in the markup.
 *   - data-slot="flowing-work-menu" attribute is present.
 *   - aria-label="Selected work" is on the nav.
 *   - Kind badges (Case study / Work) are rendered.
 */

vi.mock("gsap", () => ({
  gsap: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    to: vi.fn(() => ({ kill: vi.fn() })),
    timeline: vi.fn(() => ({ set: vi.fn(), to: vi.fn() })),
    set: vi.fn(),
    ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
  },
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

const mockItems: SelectedWorkItem[] = [
  {
    kind: "case-study",
    slug: "hello-dojo",
    title: "Hello Dojo",
    coverImage: "/covers/hello-dojo.jpg",
    order: 1,
  },
  {
    kind: "work",
    slug: "domain-plug",
    title: "DomainPlug",
    coverImage: "/works/domain-plug/cover.jpg",
    order: 4,
  },
];

describe("FlowingWorkMenu", () => {
  it("renders without crashing in SSR", () => {
    expect(() => renderToStaticMarkup(<FlowingWorkMenu items={mockItems} />)).not.toThrow();
  });

  it("renders data-slot attribute for test targeting", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu items={mockItems} />);
    expect(html).toContain('data-slot="flowing-work-menu"');
  });

  it("renders accessible nav with aria-label", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu items={mockItems} />);
    expect(html).toContain('aria-label="Selected work"');
  });

  it("case-study items link to /case-studies/[slug]", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu items={mockItems} />);
    expect(html).toContain('href="/case-studies/hello-dojo"');
  });

  it("work items link to /work/[slug]", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu items={mockItems} />);
    expect(html).toContain('href="/work/domain-plug"');
  });

  it("renders each item title in the markup", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu items={mockItems} />);
    expect(html).toContain("Hello Dojo");
    expect(html).toContain("DomainPlug");
  });

  it("renders kind badges to distinguish content types", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu items={mockItems} />);
    expect(html).toContain("Case study");
    expect(html).toContain("Work");
  });

  it("renders empty state gracefully with no items", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu items={[]} />);
    expect(html).toContain('data-slot="flowing-work-menu"');
  });
});
