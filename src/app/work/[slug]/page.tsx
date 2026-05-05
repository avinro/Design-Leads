import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getCaseStudyBySlug,
  getCaseStudySlugs,
  getPublishedCaseStudies,
  type SectionImage,
} from "@/lib/content/case-studies";
import { mdxOptions } from "@/lib/mdx/options";
import { caseStudyMdxComponents } from "@/components/case-study/case-study-mdx-components";
import { StickyBackground } from "@/components/case-study/sticky-background";
import { Container } from "@/components/layout/container";

// ---------------------------------------------------------------------------
// Static generation
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

// ---------------------------------------------------------------------------
// Per-slug metadata (canonical, OG, Twitter, robots)
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return {};

  const { frontmatter } = cs;
  const title = `${frontmatter.title} | Avinro`;
  const description = frontmatter.outcome;
  const url = `https://avinro.com/work/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/work/${slug}`,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Avinro",
      locale: "en_US",
      type: "article",
      images: [
        {
          url: `/work/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/work/${slug}/opengraph-image`],
    },
    // Draft pages are not indexed — still built for preview purposes.
    ...(frontmatter.draft ? { robots: { index: false, follow: false } } : {}),
  };
}

// ---------------------------------------------------------------------------
// Reading time chip — light text over scrim
// ---------------------------------------------------------------------------

function ReadingTimeChip({ text }: { text: string }) {
  return <span className="font-mono text-xs text-zinc-300 tabular-nums">{text}</span>;
}

// ---------------------------------------------------------------------------
// Foreground intro (replaces the old cover-image CoverMeta)
// Rendered over the first sticky background image.
// ---------------------------------------------------------------------------

interface ForegroundIntroProps {
  title: string;
  client: string;
  role: string;
  year: number;
  coverage: string[];
  readingTimeText: string;
}

function ForegroundIntro({
  title,
  client,
  role,
  year,
  coverage,
  readingTimeText,
}: ForegroundIntroProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/work"
        className="flex min-h-[44px] w-fit items-center gap-2 font-mono text-xs tracking-widest text-zinc-400 uppercase transition-colors hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        ← Work
      </Link>

      {/* Page h1 — heading hierarchy: only one h1 per page, owned by the template */}
      <h1 className="font-display text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
        {title}
      </h1>

      {/* Metadata strip — 2-col on mobile, 4-col on sm+ */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/15 pt-6 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Client</span>
          <span className="text-sm font-medium text-zinc-100">{client}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Role</span>
          <span className="text-sm font-medium text-zinc-100">{role}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Year</span>
          <span className="text-sm font-medium text-zinc-100 tabular-nums">{year}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
            Read time
          </span>
          <ReadingTimeChip text={readingTimeText} />
        </div>
      </div>

      {/* Coverage tags / badges */}
      <div className="flex flex-wrap gap-2">
        {coverage.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs tracking-wide text-zinc-50 uppercase ring-1 ring-white/15"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Next case study CTA — styled for light-on-scrim context
// ---------------------------------------------------------------------------

interface NextCaseCTAProps {
  nextTitle: string;
  nextSlug: string;
}

function NextCaseCTA({ nextTitle, nextSlug }: NextCaseCTAProps) {
  return (
    <div className="mt-16 border-t border-white/15 pt-12">
      <p className="font-mono text-xs tracking-widest text-zinc-400 uppercase">Next case study</p>
      <Link
        href={`/work/${nextSlug}`}
        aria-label={`Next case study: ${nextTitle}`}
        className="group mt-4 flex min-h-[44px] items-center gap-3 transition-colors focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span className="font-display text-2xl font-semibold tracking-tight text-zinc-50 transition-transform group-hover:translate-x-1 sm:text-3xl">
          {nextTitle}
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-zinc-300 transition-transform group-hover:translate-x-2"
        >
          →
        </span>
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) notFound();

  const { frontmatter, content, readingTime } = cs;

  // Build sections for StickyBackground: use frontmatter.sections if present,
  // otherwise fall back to a single entry with the coverImage.
  const bgSections: SectionImage[] = frontmatter.sections ?? [
    { id: "cover", image: frontmatter.coverImage },
  ];

  // Determine the next published case study (wraps around).
  const published = getPublishedCaseStudies();
  const currentIdx = published.findIndex((p) => p.frontmatter.slug === slug);
  const nextCs =
    currentIdx !== -1 && published.length > 1
      ? published[(currentIdx + 1) % published.length]
      : null;

  return (
    <main id="main-content">
      {/*
       * Sticky background layout:
       *   1. StickyBackground occupies h-[100dvh] in document flow with sticky top-0.
       *   2. The foreground div uses -mt-[100dvh] to visually pull itself up and
       *      overlap the sticky layer, while leaving the natural scroll height intact.
       *   3. z-10 on the foreground ensures it renders above the background/scrim.
       */}
      <div className="relative">
        <StickyBackground sections={bgSections} />

        {/* Foreground — scrolls over the sticky background */}
        <div className="relative z-10 -mt-[100dvh]">
          {/* First screen: intro fills viewport, content anchored to bottom */}
          <div className="flex min-h-[100dvh] flex-col justify-end px-4 pt-20 pb-12 sm:px-6 sm:pt-28 sm:pb-16 lg:px-8">
            <Container>
              <ForegroundIntro
                title={frontmatter.title}
                client={frontmatter.client}
                role={frontmatter.role}
                year={frontmatter.year}
                coverage={frontmatter.coverage}
                readingTimeText={readingTime.text}
              />
            </Container>
          </div>

          {/* MDX body — constrained to max-w-prose for line-length compliance */}
          <div className="pb-24">
            <Container width="narrow">
              <MDXRemote
                source={content}
                components={caseStudyMdxComponents}
                options={mdxOptions}
              />

              {nextCs && (
                <NextCaseCTA
                  nextTitle={nextCs.frontmatter.title}
                  nextSlug={nextCs.frontmatter.slug}
                />
              )}
            </Container>
          </div>
        </div>
      </div>
    </main>
  );
}
