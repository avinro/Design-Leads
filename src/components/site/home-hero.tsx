"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

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
      <div aria-hidden="true" className="rounded-full" style={{ width: 280, height: 280 }} />
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

  return (
    <Section
      as="header"
      spacing="hero"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden"
    >
      {/*
       * Ghost grid strip — same max-width + gutters as Container width="wide"
       * so CircularText aligns to the inner right edge of the editorial column.
       */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
        <div className="relative h-full w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in fill-mode-both pointer-events-auto absolute top-24 right-0 z-10 hidden delay-700 duration-1000 md:block lg:top-28">
            <CircularText
              text={hero.circularText}
              spinDuration={20}
              onHover="slowDown"
              size={280}
              fontSize="1rem"
              aria-label="Strategy and execution · Product design"
              className="text-foreground/60"
            />
          </div>
        </div>
      </div>

      <Container width="wide">
        <div className="flex flex-col gap-8 sm:gap-10">
          {/* Primary headline */}
          <h1
            className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both font-display font-semibold text-balance duration-700"
            style={{
              fontSize: "var(--text-display-lg)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            {hero.headline}
          </h1>

          {/* Subheadline */}
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-muted-foreground max-w-xl text-xl leading-snug delay-150 duration-700 sm:text-2xl">
            {hero.subheadline}
          </p>

          {/* Secondary in-page CTA */}
          <div className="animate-in fade-in fill-mode-both delay-300 duration-700">
            <Button asChild variant="outline" size="lg">
              <Link href={hero.secondaryCtaHref}>{hero.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
