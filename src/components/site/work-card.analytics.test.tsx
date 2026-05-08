import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { WorkCase } from "@/lib/content/home";
import { WorkCard } from "./work-card";

/*
 * Smoke tests: verify that data-work-card-* analytics attributes are present
 * and carry correct values on WorkCard. The AnalyticsClickDelegator reads
 * these to emit work_card_click events without an onClick handler.
 */

const mockCase: WorkCase = {
  slug: "test-project",
  title: "Test Project",
  summary: "A test case study summary.",
  tags: ["Tag A"],
  gradient: "from-violet-500 to-purple-700",
};

describe("WorkCard analytics attributes", () => {
  it("has data-work-card-slug matching the case slug", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain('data-work-card-slug="test-project"');
  });

  it("has data-work-card-title matching the case title", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain('data-work-card-title="Test Project"');
  });

  it("has data-work-card-source=home_selected_work", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain('data-work-card-source="home_selected_work"');
  });

  it("still renders data-slot=work-card and correct href", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain('data-slot="work-card"');
    expect(html).toContain('href="/work/test-project"');
  });

  it("still includes min-h-[44px] touch target", () => {
    const html = renderToStaticMarkup(<WorkCard case_={mockCase} index={1} />);
    expect(html).toContain("min-h-[44px]");
  });
});
