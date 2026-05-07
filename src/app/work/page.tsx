import type { Metadata } from "next";
import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { WorkCard } from "@/components/site/work-card";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Work",
  description: "A selection of 0→1 products and multi-app systems, designed and shipped.",
  alternates: {
    canonical: "/work",
  },
};

/*
 * /work — ordered listing of published case studies.
 *
 * Reuses WorkCard (the editorial numbered row component) so the listing stays
 * visually consistent with the home SelectedWork section.
 */
export default function WorkPage() {
  const cases = getPublishedCaseStudies();

  return (
    <main id="main-content">
      <Section spacing="hero">
        <Container>
          <p className="text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase">
            Selected work
          </p>
          <h1 className="font-display mt-4 mb-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Case studies
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            A selection of 0→1 products and multi-app systems. Each one started as an unclear idea —
            and ended up shipped.
          </p>
        </Container>
      </Section>

      <Section spacing="none">
        <Container>
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
        </Container>
      </Section>
    </main>
  );
}
