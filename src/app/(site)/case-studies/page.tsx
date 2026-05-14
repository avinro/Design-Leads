import type { Metadata } from "next";

import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CaseStudyGrid } from "@/components/case-study/case-study-grid";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "A selection of 0→1 products and multi-app systems, designed and shipped.",
  alternates: {
    canonical: "/case-studies",
  },
};

/*
 * /case-studies — minimal page header + 2-column case study grid.
 *
 * Layout:
 *   - Section heroInternalCompact handles sticky-nav offset
 *     (pt-[7rem] mobile / pt-[10rem] md+).
 *   - Container (default max-w-6xl) aligns header to the site-wide gutter
 *     rhythm — same as About, Contact, and other internal pages.
 *   - CaseStudyGrid wraps its own Container, so <Section> here has no wrapper
 *     padding of its own and the grid aligns to the same max-w-6xl column.
 */
export default function CaseStudiesPage() {
  const cases = getPublishedCaseStudies();

  return (
    <main id="main-content">
      {/* Page header — centered, with a creative hook line below the h1 */}
      <Section
        as="header"
        spacing="heroInternalCompact"
        className="border-border border-b"
        style={{ paddingBottom: "calc(var(--space-hero) / 2)" }}
      >
        <Container>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              Into my process
            </p>
            <h1 className="font-display text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
              Problems solved,
              <br className="hidden sm:block" /> products shipped.
            </h1>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed sm:text-lg md:max-w-none">
              Real constraints, real teams, real outcomes.
            </p>
          </div>
        </Container>
      </Section>

      {/* Case study grid — all cards share equal column width */}
      <Section>
        <CaseStudyGrid cases={cases} />
      </Section>
    </main>
  );
}
