import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

import type { CaseStudy } from "@/lib/content/case-studies";

interface WorkSlideProps {
  case_: CaseStudy;
  /** 0-based position in the list — used for image priority and display number. */
  index: number;
  /** Whether this slide is currently intersecting the viewport mid-point. */
  isActive: boolean;
  ref?: React.Ref<HTMLElement>;
}

/*
 * WorkSlide — a single full-viewport slide in the /work snap-scroll listing.
 *
 * Layout (bottom-up stack):
 *   1. Background image  (fill, object-cover, aria-hidden)
 *   2. Dark scrim        (bg-black/60, aria-hidden) — guarantees ≥4.5:1 contrast
 *   3. Foreground text   (relative z-10, pinned to bottom of slide)
 *
 * The foreground fades in when the slide becomes active (isActive = true).
 * motion respects prefers-reduced-motion automatically via its global setting.
 *
 * pb-[var(--space-cta-bar)] reserves space above the MobileCtaBar on mobile
 * so the CTA link is never obscured. md:pb-16 restores normal desktop spacing.
 */
export function WorkSlide({ case_, index, isActive, ref }: WorkSlideProps) {
  const { frontmatter } = case_;
  const num = String(index + 1).padStart(2, "0");

  return (
    <section
      ref={ref}
      data-slot="work-slide"
      aria-label={frontmatter.title}
      className="relative h-dvh [scroll-snap-align:start] overflow-hidden"
    >
      {/* Background image */}
      <Image
        src={frontmatter.coverImage}
        alt=""
        fill
        priority={index === 0}
        loading={index === 0 ? "eager" : "lazy"}
        sizes="100vw"
        className="object-cover"
        aria-hidden="true"
      />

      {/* Dark scrim — fixed opacity so contrast is deterministic (≥4.5:1) */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/60" />

      {/* Foreground content — pinned to slide bottom */}
      <motion.div
        className="relative z-10 flex h-full flex-col justify-center px-4 pt-14 pb-[var(--space-cta-bar)] sm:px-6 md:pb-0 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mx-auto w-full max-w-7xl">
          {/* Index number */}
          <p className="font-mono text-xs text-zinc-400" aria-hidden="true">
            {num}
          </p>

          {/* Project title — h2 because the page h1 is sr-only in /work/page.tsx */}
          <h2 className="font-display mt-2 text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
            {frontmatter.title}
          </h2>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Project tags">
            {frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs tracking-wide text-zinc-100 uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* One-line summary */}
          <p className="mt-4 max-w-lg text-base leading-relaxed text-zinc-300 sm:text-lg">
            {frontmatter.summary}
          </p>

          {/* CTA link — navigates to the full case study */}
          <Link
            href={`/work/${frontmatter.slug}`}
            aria-label={`View case study: ${frontmatter.title}`}
            className="mt-8 inline-flex min-h-[44px] items-center gap-2 font-mono text-sm text-zinc-50 transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            View case study
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
