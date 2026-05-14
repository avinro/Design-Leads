import { Container } from "@/components/layout/container";
import { CaseStudyGridCard } from "./case-study-grid-card";
import type { CaseStudy } from "@/lib/content/case-studies";

/*
 * CaseStudyGrid — responsive 2-column case-study grid for /case-studies.
 *
 * Layout rules (mobile-first):
 *   - 1 column on mobile (all cards are full-width).
 *   - 2 columns from md upward, all cards at equal weight (col-span-1).
 *   - `featured` is intentionally ignored here; it is only used by home to
 *     populate FlowingWorkMenu.
 *
 * Spacing:
 *   - gap-y-10  (40px) mobile — compact for small screens.
 *   - gap-y-20  (80px) md+   — breathing room on the designed breakpoint.
 *   - gap-x-6 / md:gap-x-8   — horizontal gutter between cards.
 *
 * The Container (max-w-6xl + adaptive gutters) is applied here so the page
 * can simply render <CaseStudyGrid cases={cases} /> inside a <Section>.
 */

interface CaseStudyGridProps {
  cases: CaseStudy[];
}

export function CaseStudyGrid({ cases }: CaseStudyGridProps) {
  return (
    <Container>
      <ul
        className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 md:gap-x-8 md:gap-y-20"
        aria-label="Case studies"
      >
        {cases.map((cs) => (
          <li key={cs.frontmatter.slug}>
            <CaseStudyGridCard cs={cs} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
