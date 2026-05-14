/**
 * CaseStudyBody — layout wrapper for case study pages.
 *
 * Column layout (mobile-first):
 *   base  — single column (flex-col)
 *   lg    — two columns: TOC sidebar (14rem) + article content (1fr)
 *   xl    — three columns when `rail` is provided:
 *             TOC (12rem) + article (1fr) + related rail (16rem)
 *           two columns when TOC is absent:
 *             article (1fr) + related rail (16rem)
 *
 * The rail column is intentionally hidden below xl to avoid cramping the
 * article column on tablets and small laptops where the two-column layout
 * already works well.
 */

import type { ReactNode } from "react";
import type { TocHeading } from "@/lib/content/toc";
import { TocSidebar } from "./toc-sidebar";
import { cn } from "@/lib/utils";

interface CaseStudyBodyProps {
  headings: TocHeading[];
  children: ReactNode;
  /** Optional right rail (e.g. RelatedRail). Rendered as a third column at xl+. */
  rail?: ReactNode;
  className?: string;
}

export function CaseStudyBody({ headings, children, rail, className }: CaseStudyBodyProps) {
  const hasToc = headings.length >= 2;

  if (!hasToc) {
    // No TOC — single column up to lg, then content + optional rail at xl.
    return (
      <div
        className={cn(
          "flex flex-col",
          rail && "xl:grid xl:grid-cols-[minmax(0,1fr)_16rem] xl:gap-8",
          className,
        )}
      >
        <div className="min-w-0">{children}</div>
        {rail}
      </div>
    );
  }

  return (
    <div
      className={cn(
        // Mobile: single column, TOC above content (rendered in TocSidebar).
        "flex flex-col",
        // lg: two-column grid — TOC sidebar left, content right.
        "lg:grid lg:gap-12",
        rail
          ? // xl adds the right rail as a third column.
            "lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[12rem_minmax(0,1fr)_16rem] xl:gap-8"
          : "lg:grid-cols-[14rem_minmax(0,1fr)]",
        className,
      )}
    >
      {/*
       * TocSidebar renders a mobile <details> element at the top of the flow
       * and a sticky <aside> for lg+. Placing it first in DOM order satisfies
       * a11y: keyboard users reach "skip to section" navigation before the
       * article body.
       */}
      <TocSidebar headings={headings} />

      {/* Article content */}
      <div className="min-w-0">{children}</div>

      {/* Right rail — visible only at xl+, controlled internally by RelatedRail */}
      {rail}
    </div>
  );
}
