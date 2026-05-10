import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { FlowingWorkMenu } from "./flowing-work-menu";
import type { CaseStudy } from "@/lib/content/case-studies";

/*
 * FlowingWorkMenu tests.
 *
 * GSAP is mocked — it relies on browser APIs not available in Node.
 *
 * Covers:
 *   - SSR render without crashing.
 *   - Every case study links to /work/[slug].
 *   - Titles are present in the markup.
 *   - data-slot="flowing-work-menu" attribute is present.
 *   - aria-label="Selected work" is on the nav.
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

const mockCases: CaseStudy[] = [
  {
    frontmatter: {
      title: "Hello Dojo",
      slug: "hello-dojo",
      client: "Hello Dojo",
      role: "Product Design Engineer Lead",
      year: 2023,
      coverage: ["research", "interaction"],
      outcome: "shipped",
      coverImage: "/covers/hello-dojo.jpg",
      order: 1,
      summary: "A learning platform for martial arts.",
      tags: ["Product Design", "UX"],
      gradient: "from-orange-400 to-pink-500",
      draft: false,
    },
    content: "",
    readingTime: { text: "5 min read", minutes: 5, words: 1000 },
  },
  {
    frontmatter: {
      title: "UMA",
      slug: "uma",
      client: "UMA",
      role: "Product Design Engineer",
      year: 2024,
      coverage: ["strategy"],
      outcome: "shipped",
      coverImage: "/covers/uma.jpg",
      order: 2,
      summary: "An education fintech product.",
      tags: ["Product Strategy"],
      gradient: "from-blue-400 to-violet-500",
      draft: false,
    },
    content: "",
    readingTime: { text: "4 min read", minutes: 4, words: 800 },
  },
];

describe("FlowingWorkMenu", () => {
  it("renders without crashing in SSR", () => {
    expect(() => renderToStaticMarkup(<FlowingWorkMenu cases={mockCases} />)).not.toThrow();
  });

  it("renders data-slot attribute for test targeting", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu cases={mockCases} />);
    expect(html).toContain('data-slot="flowing-work-menu"');
  });

  it("renders accessible nav with aria-label", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu cases={mockCases} />);
    expect(html).toContain('aria-label="Selected work"');
  });

  it("renders a link to each case study slug", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu cases={mockCases} />);
    expect(html).toContain('href="/work/hello-dojo"');
    expect(html).toContain('href="/work/uma"');
  });

  it("renders each case study title in the markup", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu cases={mockCases} />);
    expect(html).toContain("Hello Dojo");
    expect(html).toContain("UMA");
  });

  it("renders empty state gracefully with no cases", () => {
    const html = renderToStaticMarkup(<FlowingWorkMenu cases={[]} />);
    expect(html).toContain('data-slot="flowing-work-menu"');
  });
});
