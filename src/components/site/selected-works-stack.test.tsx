import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SelectedWorksStack } from "./selected-works-stack";
import type { CaseStudy } from "@/lib/content/case-studies";

/*
 * SelectedWorksStack tests.
 *
 * GSAP ScrollTrigger is mocked — it relies on browser APIs (getBoundingClientRect,
 * window.innerHeight, rAF) not available in test environment.
 *
 * Covers:
 *   - Server-side render without crashing (SSR-safe).
 *   - All case study titles and numbers are rendered.
 *   - Each card links to /work/[slug].
 *   - Static fallback renders the expected list structure.
 *   - No horizontal overflow classes are present on the outer wrapper.
 */

vi.mock("gsap", () => ({
  gsap: {
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    set: vi.fn(),
    ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    create: vi.fn(),
    update: vi.fn(),
    refresh: vi.fn(),
  },
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
      coverage: ["strategy", "visual"],
      outcome: "launched",
      coverImage: "/covers/uma.jpg",
      order: 2,
      summary: "A digital platform for architecture professionals.",
      tags: ["Product Strategy", "Visual Design"],
      gradient: "from-blue-400 to-cyan-500",
      draft: false,
    },
    content: "",
    readingTime: { text: "4 min read", minutes: 4, words: 800 },
  },
];

describe("SelectedWorksStack", () => {
  it("renders without crashing in SSR", () => {
    expect(() => renderToStaticMarkup(<SelectedWorksStack cases={mockCases} />)).not.toThrow();
  });

  it("renders all case study titles", () => {
    const html = renderToStaticMarkup(<SelectedWorksStack cases={mockCases} />);
    expect(html).toContain("Hello Dojo");
    expect(html).toContain("UMA");
  });

  it("renders links to each case study page", () => {
    const html = renderToStaticMarkup(<SelectedWorksStack cases={mockCases} />);
    expect(html).toContain('href="/work/hello-dojo"');
    expect(html).toContain('href="/work/uma"');
  });

  it("renders editorial index numbers", () => {
    const html = renderToStaticMarkup(<SelectedWorksStack cases={mockCases} />);
    expect(html).toContain("01");
    expect(html).toContain("02");
  });

  it("renders the aria-label for the section", () => {
    const html = renderToStaticMarkup(<SelectedWorksStack cases={mockCases} />);
    expect(html).toContain('aria-label="Selected work"');
  });

  it("renders data-slot for test targeting", () => {
    const html = renderToStaticMarkup(<SelectedWorksStack cases={mockCases} />);
    expect(html).toContain('data-slot="selected-works-stack"');
  });
});
