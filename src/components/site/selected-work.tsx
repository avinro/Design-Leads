import { homeContent } from "@/lib/content/home";
import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { WorkCard } from "./work-card";

/*
 * SelectedWork — editorial numbered list of case studies.
 *
 * Design intent (PRO-13 visual refinement):
 *   Rows replace the previous 12-col grid of cards. Each project is a full-
 *   width row with a number, title, tags, summary and a gradient swatch bar.
 *   This is a flex-col layout — no Grid/GridItem needed here; Grid is reserved
 *   for case-study pages that require multi-column layouts.
 *
 *   The section heading "Selected work" sits above the rows as a small mono
 *   kicker — not an h2 competing with the editorial row titles.
 *
 * Data source (PRO-14):
 *   Case cards are now derived from the MDX content layer (published only),
 *   sorted by frontmatter.order. homeContent.selectedWork retains only the
 *   section title and framing copy.
 */
export function SelectedWork() {
  const { selectedWork } = homeContent;
  const cases = getPublishedCaseStudies();

  return (
    <Section>
      <Container>
        <div className="flex flex-col gap-6">
          {/* Section kicker */}
          <p className="text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase">
            {selectedWork.sectionTitle}
          </p>

          {/* Framing sentence — context before the case list */}
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            {selectedWork.body}
          </p>

          {/* Editorial rows — no Grid, straight flex-col */}
          <div>
            {cases.map((cs, i) => (
              <WorkCard
                key={cs.frontmatter.slug}
                case_={{
                  slug: cs.frontmatter.slug,
                  title: cs.frontmatter.title,
                  summary: cs.frontmatter.summary,
                  tags: cs.frontmatter.tags,
                  gradient: cs.frontmatter.gradient,
                }}
                index={i + 1}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
