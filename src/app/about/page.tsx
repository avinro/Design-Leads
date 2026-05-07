import type { Metadata } from "next";

import { aboutContent } from "@/lib/content/about";
import { PersonJsonLd } from "@/lib/seo/json-ld";
import type { ExperienceEntry, ToolGroup } from "@/lib/content/about";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "About",
  description:
    "Lead Product Designer working at the intersection of strategy, design, and execution. Background, experience, tools, and design philosophy.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Avinro — Lead Product Designer",
    description:
      "Lead Product Designer working at the intersection of strategy, design, and execution.",
    url: "/about",
    images: [
      {
        url: "/about/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Avinro — Lead Product Designer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Avinro — Lead Product Designer",
    description:
      "Lead Product Designer working at the intersection of strategy, design, and execution.",
    images: ["/about/opengraph-image"],
  },
};

// ---------------------------------------------------------------------------
// Section helpers — inline, page-specific, not reused elsewhere
// ---------------------------------------------------------------------------

/*
 * SectionKicker — small mono label above each section.
 * Same convention as SocialProof and SelectedWork kickers.
 */
function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase">
      {children}
    </p>
  );
}

/*
 * ExperienceRow — single timeline entry.
 * Follows the same editorial row vocabulary as WorkCard:
 * year (mono) · role — company · outcome
 */
function ExperienceRow({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="border-border/40 flex flex-col gap-1 border-b py-6 first:border-t sm:flex-row sm:items-start sm:gap-8">
      {/* Year — anchored, does not move */}
      <span className="text-muted-foreground w-16 shrink-0 font-mono text-sm tabular-nums">
        {entry.year}
      </span>

      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-display text-lg font-semibold tracking-tight">
          {entry.role}
          <span className="text-muted-foreground font-sans text-base font-normal">
            {" "}
            — {entry.company}
          </span>
        </span>
        <span className="text-muted-foreground text-sm leading-relaxed">{entry.outcome}</span>
      </div>
    </div>
  );
}

/*
 * ToolChip — single tool label pill.
 */
function ToolChip({ label }: { label: string }) {
  return (
    <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 font-mono text-xs tracking-wide uppercase">
      {label}
    </span>
  );
}

/*
 * ToolGroupBlock — one labelled group of tool chips.
 */
function ToolGroupBlock({ group }: { group: ToolGroup }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-foreground text-sm font-medium">{group.label}</span>
      <div className="flex flex-wrap gap-2">
        {group.items.map((item) => (
          <ToolChip key={item} label={item} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/*
 * About page — PRO-18 / F1-7.
 *
 * Sections (in order):
 *   1. Hero         — bio + portrait placeholder
 *   2. Experience   — editorial timeline rows
 *   3. Tools        — three chip groups
 *   4. Philosophy   — single display paragraph
 *   5. PM layer     — strategy-as-complement framing
 *   6. Closing CTA  — mailto + resume download
 *
 * Server component — no client JS required.
 * Mobile-first: all base styles target 375px, sm:/md: are additive.
 */
export default function AboutPage() {
  const { hero, experience, tools, philosophy, pmLayer, cta } = aboutContent;

  return (
    <main id="main-content">
      <PersonJsonLd />
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <Section spacing="hero">
        <Container>
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-16">
            {/* Text column */}
            <div className="flex flex-col gap-6 md:flex-1">
              <SectionKicker>About</SectionKicker>

              <h1
                className="font-display font-semibold tracking-tight text-balance"
                style={{ fontSize: "var(--text-display-sm)", lineHeight: 1.1 }}
              >
                Lead Product Designer.
              </h1>

              <div className="flex flex-col gap-4">
                {hero.bio.map((paragraph, i) => (
                  <p key={i} className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/*
             * Portrait placeholder — intentional card, not a bare decorative div.
             * TODO(portrait): replace this block with:
             *   <Image
             *     src="/about/portrait.jpg"
             *     alt="Portrait of Ary"
             *     fill
             *     className="object-cover"
             *     sizes="(max-width: 768px) 100vw, 320px"
             *   />
             * when the photo asset is available at public/about/portrait.jpg.
             */}
            <div className="w-full md:w-72 lg:w-80">
              <div className="border-border/40 bg-muted relative aspect-[3/4] w-full overflow-hidden rounded-xl border">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  {/* Minimal silhouette placeholder */}
                  <div className="bg-muted-foreground/20 h-16 w-16 rounded-full" />
                  <div className="bg-muted-foreground/10 h-20 w-24 rounded-t-full" />
                  <span
                    className="text-muted-foreground/50 absolute bottom-4 font-mono text-xs tracking-widest uppercase"
                    data-testid="portrait-placeholder"
                  >
                    Portrait placeholder
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 2. Experience ───────────────────────────────────────────────── */}
      <Section>
        <Container>
          <div className="flex flex-col gap-8">
            <SectionKicker>{experience.sectionTitle}</SectionKicker>

            <h2 className="sr-only">{experience.sectionTitle}</h2>

            <div>
              {experience.entries.map((entry) => (
                <ExperienceRow key={`${entry.year}-${entry.role}-${entry.company}`} entry={entry} />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 3. Tools & methods ──────────────────────────────────────────── */}
      <Section>
        <Container>
          <div className="flex flex-col gap-8">
            <SectionKicker>{tools.sectionTitle}</SectionKicker>

            <h2 className="sr-only">{tools.sectionTitle}</h2>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {tools.groups.map((group) => (
                <ToolGroupBlock key={group.label} group={group} />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 4. Design philosophy ────────────────────────────────────────── */}
      <Section>
        <Container width="narrow">
          <div className="flex flex-col gap-6">
            <SectionKicker>{philosophy.sectionTitle}</SectionKicker>

            <h2 className="sr-only">{philosophy.sectionTitle}</h2>

            <p
              className="font-display text-foreground leading-snug font-semibold tracking-tight text-balance"
              style={{ fontSize: "var(--text-display-sm)" }}
            >
              {philosophy.body}
            </p>
          </div>
        </Container>
      </Section>

      {/* ── 5. PM / strategy layer ──────────────────────────────────────── */}
      <Section>
        <Container width="narrow">
          <div className="flex flex-col gap-6">
            <SectionKicker>{pmLayer.sectionTitle}</SectionKicker>

            <h2 className="sr-only">{pmLayer.sectionTitle}</h2>

            <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
              {pmLayer.body}
            </p>
          </div>
        </Container>
      </Section>

      {/* ── 6. Closing CTA ──────────────────────────────────────────────── */}
      <Section>
        <Container>
          <div className="flex flex-col gap-8">
            <SectionKicker>{cta.sectionTitle}</SectionKicker>

            <h2 className="sr-only">{cta.sectionTitle}</h2>

            {/*
             * Two CTAs stacked on mobile, side-by-side at sm+.
             * min-h-11 + px-5 ensure >= 44px touch targets.
             * gap-3 keeps adjacent touch areas separated.
             */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="min-h-11 cursor-pointer px-5">
                <a href={cta.primaryHref}>{cta.primaryLabel}</a>
              </Button>

              <Button asChild variant="outline" size="lg" className="min-h-11 cursor-pointer px-5">
                <a href={cta.resumeHref} download>
                  {cta.resumeLabel}
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
