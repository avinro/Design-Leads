"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";
import type { CaseStudy } from "@/lib/content/case-studies";

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SelectedWorksStackProps {
  cases: CaseStudy[];
}

// ---------------------------------------------------------------------------
// Card content component
// ---------------------------------------------------------------------------

interface StackCardProps {
  cs: CaseStudy;
  index: number;
  isFirst: boolean;
}

function StackCard({ cs, index, isFirst }: StackCardProps) {
  const { frontmatter } = cs;
  const num = String(index + 1).padStart(2, "0");
  const tagLine = frontmatter.tags.join(" · ");

  return (
    <article
      data-stack-card
      data-index={index}
      className="absolute inset-0 overflow-hidden"
      aria-label={`Project ${num}: ${frontmatter.title}`}
    >
      {/* Cover image background */}
      <div className="absolute inset-0">
        <Image
          src={frontmatter.coverImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority={isFirst}
          loading={isFirst ? undefined : "lazy"}
          aria-hidden="true"
        />
        {/* Dark scrim — maintains text legibility over any cover image */}
        <div className="bg-foreground/60 absolute inset-0" aria-hidden="true" />
      </div>

      {/* Card content */}
      <Link
        href={`/work/${frontmatter.slug}`}
        className="focus-ring-invert absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-16"
        data-cta-label={`View ${frontmatter.title}`}
        data-cta-href={`/work/${frontmatter.slug}`}
        data-cta-position="stack_card"
      >
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Index + tags row */}
          <div className="flex items-center gap-4">
            <span className="text-background/60 font-mono text-sm tabular-nums sm:text-base">
              {num}
            </span>
            <span className="text-background/60 font-mono text-xs sm:text-sm">{tagLine}</span>
          </div>

          {/* Title */}
          <h2
            className="font-display text-background leading-tight font-semibold tracking-tight text-balance"
            style={{ fontSize: "var(--text-display-sm)" }}
          >
            {frontmatter.title}
          </h2>

          {/* Summary */}
          <p className="text-background/80 max-w-2xl text-base leading-relaxed sm:text-lg">
            {frontmatter.summary}
          </p>

          {/* Gradient swatch + CTA row */}
          <div className="flex items-center gap-6">
            <div
              aria-hidden="true"
              className={cn(
                "h-[3px] w-24 rounded-full bg-gradient-to-r opacity-80",
                frontmatter.gradient,
              )}
            />
            <span className="text-background inline-flex items-center gap-2 font-mono text-sm tracking-wider uppercase transition-all duration-200 group-hover:gap-3">
              View case{" "}
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Static fallback — shown when prefers-reduced-motion is set
// ---------------------------------------------------------------------------

function StaticFallback({ cases }: SelectedWorksStackProps) {
  return (
    <section aria-label="Selected work" className="bg-background">
      <div className="divide-border/40 flex flex-col divide-y">
        {cases.map((cs, i) => (
          <Link
            key={cs.frontmatter.slug}
            href={`/work/${cs.frontmatter.slug}`}
            className="focus-ring group hover:bg-muted/30 flex flex-col gap-4 px-4 py-8 transition-colors sm:px-6 lg:px-8"
          >
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-mono text-sm tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                {cs.frontmatter.tags.join(" · ")}
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {cs.frontmatter.title}
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              {cs.frontmatter.summary}
            </p>
            <div
              aria-hidden="true"
              className={cn(
                "h-[3px] w-24 rounded-full bg-gradient-to-r opacity-70",
                cs.frontmatter.gradient,
              )}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SelectedWorksStack({ cases }: SelectedWorksStackProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotionRef = useRef(false);

  const initScrollTrigger = useCallback(() => {
    const section = sectionRef.current;
    if (!section || reducedMotionRef.current || cases.length < 2) return;

    const cards = section.querySelectorAll<HTMLElement>("[data-stack-card]");
    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        if (i === 0) return; // First card is always visible at start

        // Each card enters from below, revealing over the previous card.
        // start/end use functions so they recalculate on resize/refresh.
        ScrollTrigger.create({
          trigger: section,
          start: () =>
            section.getBoundingClientRect().top + window.scrollY + i * window.innerHeight,
          end: () =>
            section.getBoundingClientRect().top + window.scrollY + (i + 1) * window.innerHeight,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;

            // Incoming card: slides up from 100% to 0%
            gsap.set(card, { yPercent: (1 - progress) * 100 });

            // Outgoing card (previous): scales down and moves slightly up
            const prevCard = cards[i - 1] as HTMLElement | undefined;
            if (prevCard) {
              gsap.set(prevCard, {
                scale: 1 - progress * 0.05,
                y: -progress * 8,
                opacity: 1 - progress * 0.4,
                // Only remove pointer events when card is behind another
                pointerEvents: progress > 0.5 ? "none" : "auto",
              });
            }
          },
        });

        // Set initial off-screen position for non-first cards
        gsap.set(card, { yPercent: 100 });
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, [cases.length]);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotionRef.current) return;

    const cleanup = initScrollTrigger();
    return cleanup;
  }, [initScrollTrigger]);

  // Render static fallback for reduced-motion (SSR-safe: starts as animated,
  // but useEffect detects and re-renders via state if needed; for now the GSAP
  // init simply skips and shows cards normally stacked — still readable.)
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return <StaticFallback cases={cases} />;
  }

  return (
    <section
      ref={sectionRef}
      data-slot="selected-works-stack"
      aria-label="Selected work"
      className="bg-background relative"
      style={{ height: `calc(${String(cases.length)} * 100dvh)` }}
    >
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {cases.map((cs, i) => (
          <StackCard key={cs.frontmatter.slug} cs={cs} index={i} isFirst={i === 0} />
        ))}
      </div>
    </section>
  );
}
