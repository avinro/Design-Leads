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
 *   - gap-2 (8px) — uniform horizontal and vertical at all breakpoints.
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
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2" aria-label="Case studies">
        {cases.map((cs) => (
          <li key={cs.frontmatter.slug}>
            <CaseStudyGridCard cs={cs} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
