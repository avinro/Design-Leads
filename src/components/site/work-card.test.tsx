import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { WorkCase } from "@/lib/content/home";
import { WorkCard } from "./work-card";

/*
 * Smoke tests for WorkCard using react-dom/server (no jsdom needed).
 * Verifies:
 *   - data-slot="work-card" is present
 *   - Link href resolves to /work/<slug>
 *   - Title, summary, and tags are rendered
 *   - Thumbnail div carries aria-hidden="true"
 *   - Card contains the min-h-[44px] class for touch target compliance
 */

const mockCase: WorkCase = {
  slug: "test-project",
  title: "Test Project",
  summary: "A test case study summary.",
  tags: ["Tag A", "Tag B"],
  gradient: "from-violet-500 to-purple-700",
};

describe("WorkCard", () => {
  it("renders data-slot=work-card", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain('data-slot="work-card"');
  });

  it("links to the correct slug URL", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain('href="/work/test-project"');
  });

  it("renders the case title and summary", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain("Test Project");
    expect(html).toContain("A test case study summary.");
  });

  it("renders all tags as dot-separated text", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain("Tag A · Tag B");
  });

  it("marks the gradient swatch as aria-hidden for decorative content", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain('aria-hidden="true"');
  });

  it("includes min-h-[44px] for touch target compliance", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain("min-h-[44px]");
  });

  it("renders the zero-padded index number", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain("01");
  });
});
