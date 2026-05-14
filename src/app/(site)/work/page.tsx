import type { Metadata } from "next";
import Link from "next/link";

import { getPublishedWorks } from "@/lib/content/works";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { WorkGalleryGrid } from "@/components/work/work-gallery-grid";

export const metadata: Metadata = {
  title: "Work",
  description:
    "UI explorations, visual systems, concepts, and product work from a product designer.",
  alternates: {
    canonical: "/work",
  },
};

/*
 * /work — visual explorations, concepts, and UI-led product work.
 *
 * This section is intentionally different from /case-studies:
 *   - Gallery-first (portrait cards, image-led).
 *   - No TOC, no KPI strips, no process narrative.
 *   - Featured items span the full row (dominant visual weight).
 *
 * A cross-link to /case-studies lets visitors who need narrative depth find it.
 */
export default function WorkPage() {
  const works = getPublishedWorks();

  return (
    <main id="main-content">
      {/* Page header */}
      <Section
        as="header"
        spacing="heroInternalCompact"
        className="border-border border-b"
        style={{ paddingBottom: "calc(var(--space-hero) / 2)" }}
      >
        <Container>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              Explore my work
            </p>
            <h1 className="font-display text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
              Explorations,
              <br className="hidden sm:block" /> concepts & UI.
            </h1>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed sm:text-lg md:max-w-none">
              Visual explorations, UI systems, and product concepts.
            </p>

            {/* Cross-link to /case-studies */}
            <p className="text-muted-foreground text-sm">
              Looking for detailed product case studies?{" "}
              <Link
                href="/case-studies"
                className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                View case studies
              </Link>
            </p>
          </div>
        </Container>
      </Section>

      {/* Gallery grid — featured cards span 2 cols, others span 1 */}
      <Section>
        <WorkGalleryGrid works={works} />
      </Section>
    </main>
  );
}
