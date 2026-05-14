import type { Metadata } from "next";

import { aboutContent } from "@/lib/content/about";
import { PersonJsonLd } from "@/lib/seo/json-ld";
import type { ExperienceEntry, EducationEntry, ToolGroup } from "@/lib/content/about";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProcessStack } from "@/components/site/process-stack";
import { AboutPortraitCardLoader } from "@/components/site/about-portrait-card-loader";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "About",
  description:
    "Product Design Engineer working at the intersection of strategy, design, and front-end implementation. Background, experience, tools, and design philosophy.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Avinro — Product Design Engineer",
    description:
      "Product Design Engineer working at the intersection of strategy, design, and front-end implementation.",
    url: "/about",
    images: [
      {
        url: "/about/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Avinro — Product Design Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Avinro — Product Design Engineer",
    description:
      "Product Design Engineer working at the intersection of strategy, design, and front-end implementation.",
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
 * year (mono) · role — company · outcome paragraph
 */
function ExperienceRow({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="border-border/40 flex flex-col gap-1 border-b py-6 first:border-t sm:flex-row sm:items-start sm:gap-12">
      <span className="text-muted-foreground w-36 shrink-0 font-mono text-sm whitespace-nowrap tabular-nums">
        {entry.year}
      </span>

      <div className="flex flex-1 flex-col gap-1">
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
 * EducationRow — single education entry, same vocabulary as ExperienceRow.
 */
function EducationRow({ entry }: { entry: EducationEntry }) {
  return (
    <div className="border-border/40 flex flex-col gap-1 border-b py-6 first:border-t sm:flex-row sm:items-start sm:gap-8">
      {/*
       * When a description is present, show the graduation year (end of range).
       * Otherwise show the start year as usual.
       */}
      <span className="text-muted-foreground w-16 shrink-0 font-mono text-sm tabular-nums">
        {entry.description ? entry.years.slice(-4) : entry.years.slice(0, 4)}
      </span>

      <div className="flex flex-1 flex-col gap-1">
        <span className="font-display text-lg font-semibold tracking-tight">
          {entry.degree}
          <span className="text-muted-foreground font-sans text-base font-normal">
            {" "}
            — {entry.institution}
          </span>
        </span>
        {entry.description ? (
          <span className="text-muted-foreground text-sm leading-relaxed">{entry.description}</span>
        ) : (
          <span className="text-muted-foreground font-mono text-sm">{entry.years}</span>
        )}
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
 * About page.
 *
 * Sections (in order):
 *   1. Hero         — bio + portrait placeholder
 *   2. Experience   — editorial timeline rows
 *   3. Education    — single education entry
 *   4. Tools        — three chip groups
 *   5. My Process   — scroll-driven stacked cards (ProcessStack)
 *
 * Server component — ProcessStack is the only client island.
 * Mobile-first: all base styles target 375px, sm:/md: are additive.
 */
export default function AboutPage() {
  const { hero, experience, education, tools, process } = aboutContent;

  return (
    <main id="main-content">
      <PersonJsonLd />

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <Section spacing="heroInternalCompact">
        <Container>
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-16">
            {/* Text column */}
            <div className="flex flex-col gap-6 md:flex-1">
              <SectionKicker>About</SectionKicker>

              <h1
                className="font-display font-semibold tracking-tight text-balance"
                style={{ fontSize: "var(--text-display-sm)", lineHeight: 1.1 }}
              >
                Product Design Engineer.
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
             * Portrait card — 3D tilt effect on desktop, static on mobile.
             * Loaded client-side only (ssr: false) so Motion hooks don't run
             * during server-side rendering or static markup tests.
             * TODO(portrait): pass imageSrc="/about/portrait.jpg" to
             * AboutPortraitCard when the photo asset is available.
             */}
            <div className="w-full md:w-72 lg:w-80">
              <AboutPortraitCardLoader />
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

      {/* ── 3. Education ────────────────────────────────────────────────── */}
      <Section>
        <Container>
          <div className="flex flex-col gap-8">
            <SectionKicker>{education.sectionTitle}</SectionKicker>
            <h2 className="sr-only">{education.sectionTitle}</h2>
            <div>
              {education.entries.map((entry) => (
                <EducationRow key={`${entry.years}-${entry.degree}`} entry={entry} />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 4. Tools & methods ──────────────────────────────────────────── */}
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

      {/* ── 5. My Process ───────────────────────────────────────────────── */}
      <Section>
        <Container>
          {/*
           * Header + cards are co-located inside ProcessStack so the header
           * can fade out when the last card reaches its pin position.
           */}
          <ProcessStack
            sectionTitle={process.sectionTitle}
            intro={process.intro}
            stages={process.stages}
          />
        </Container>
      </Section>
    </main>
  );
}
