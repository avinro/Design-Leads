"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import VariableProximity from "@/components/motion/variable-proximity";

/*
 * CircularText is a client component driven by motion. Lazy-loaded so the
 * critical text path (headline, subheadline, CTA) renders first.
 * The loading fallback is an invisible circle placeholder that reserves
 * the correct layout footprint.
 */
const CircularText = dynamic(
  () => import("@/components/motion/circular-text").then((m) => m.CircularText),
  {
    ssr: false,
    loading: () => (
      <div aria-hidden="true" className="rounded-full" style={{ width: 220, height: 220 }} />
    ),
  },
);

/*
 * HomeHero — rotation rebrand protagonist section.
 *
 * Layout:
 *   The hero is a single-column full-viewport section. The CircularText
 *   is absolutely positioned but aligned to the *editorial grid* — a ghost
 *   strip mirrors Container's `max-w-7xl` + horizontal gutters so `right-0`
 *   pins the circle to the inner right edge of the wide column (not the
 *   viewport). Hidden below md so small screens stay uncluttered.
 *
 *   Section stays `relative`; the ghost strip uses `absolute inset-0` so
 *   vertical placement (top-24 / lg:top-28) is stable under the sticky header.
 *
 * CTA rule: outline variant only here. Primary CTA lives in SiteHeader (md+)
 * and MobileCtaBar (<md) — never duplicated in-page.
 *
 * Motion guardrail: CircularText calls useReducedMotion() internally.
 * When the user prefers reduced motion, letters are static and hover
 * handlers are disabled — layout and content are unchanged.
 */
export function HomeHero() {
  const { hero } = homeContent;
  const headlineRef = useRef<HTMLHeadingElement>(null);

  return (
    <Section
      as="header"
      spacing="hero"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-32"
    >
      {/*
       * Ghost grid strip — same max-width + gutters as Container width="wide"
       * so CircularText aligns to the inner right edge of the editorial column.
       */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
        <div className="relative h-full w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Desktop — aligned to inner right edge of editorial column */}
          <div className="animate-in fade-in fill-mode-both pointer-events-auto absolute top-24 right-0 z-10 hidden delay-700 duration-1000 md:block lg:top-28">
            <CircularText
              text={hero.circularText}
              spinDuration={20}
              onHover="slowDown"
              size={180}
              fontSize="1rem"
              aria-label="Strategy and execution · Product design"
              className="text-foreground/60"
            />
          </div>
        </div>
      </div>

      {/* Mobile — 24px from right edge, lower in the viewport */}
      <div className="animate-in fade-in fill-mode-both pointer-events-auto absolute top-[10vh] right-6 z-10 delay-700 duration-1000 md:hidden">
        <CircularText
          text={hero.circularText}
          spinDuration={20}
          onHover="slowDown"
          size={120}
          fontSize="0.65rem"
          aria-hidden="true"
          className="text-foreground/60"
        />
      </div>

      <Container width="wide">
        <div className="flex flex-col gap-8 sm:gap-10">
          {/* Primary headline — VariableProximity thickens letters near cursor */}
          <h1
            ref={headlineRef}
            className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700"
            style={{
              // Local clamp: tighter min (3.25rem) for mobile without touching
              // the global --text-display-lg token used by other sections.
              // At 375px: ~52px; at 1280px: capped at 9rem (144px).
              fontSize: "clamp(3.25rem, 14vw, 9rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.05em",
            }}
          >
            <VariableProximity
              label={hero.headline}
              containerRef={headlineRef}
              fromFontVariationSettings="'wght' 500, 'opsz' 14"
              toFontVariationSettings="'wght' 900, 'opsz' 40"
              radius={140}
              falloff="gaussian"
              className="font-display font-semibold text-balance"
              style={{ display: "block" }}
            />
          </h1>

          {/* Subheadline */}
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-muted-foreground max-w-xl text-base leading-snug delay-150 duration-700 sm:text-xl md:text-2xl">
            {hero.subheadline}
          </p>

          {/* Secondary in-page CTA */}
          <div className="animate-in fade-in fill-mode-both delay-300 duration-700">
            <Button asChild variant="outline" size="lg">
              <Link
                href={hero.secondaryCtaHref}
                data-cta-label={hero.secondaryCta}
                data-cta-href={hero.secondaryCtaHref}
                data-cta-position="hero_secondary"
              >
                {hero.secondaryCta}
              </Link>
            </Button>
          </div>
        </div>
      </Container>
      {/* Scroll indicator — bounces to invite the first scroll gesture */}
      <div
        aria-hidden="true"
        className="animate-in fade-in fill-mode-both pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 delay-1000 duration-1000"
      >
        <ArrowDown
          strokeWidth={1.5}
          className="text-foreground/40 h-5 w-5 animate-bounce motion-reduce:animate-none"
        />
      </div>
    </Section>
  );
}
