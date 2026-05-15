"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowDown, Download, User } from "lucide-react";

import { homeContent } from "@/lib/content/home";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendlyModal } from "@/components/site/calendly-modal";
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
 *   The hero is a single-column full-viewport section. The desktop CircularText
 *   is positioned relative to the real wide Container so it tracks the same
 *   max-width and gutters as the headline block. Hidden below md so small
 *   screens stay uncluttered.
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
  const [isCircleHovered, setIsCircleHovered] = useState(false);

  return (
    <Section
      as="header"
      spacing="hero"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-32"
    >
      {/* Mobile — 24px from right edge, lower in the viewport */}
      <div className="animate-in fade-in fill-mode-both pointer-events-auto absolute top-[10vh] right-6 z-10 delay-700 duration-1000 md:hidden">
        <CalendlyModal ctaPosition="hero_circle_mobile">
          <button
            type="button"
            aria-label="Let's talk — open contact modal"
            className="cursor-pointer rounded-full"
          >
            {/* Wrapper sized to match the circle so the PFP overlay can be absolutely centered */}
            <div className="relative" style={{ width: 120, height: 120 }}>
              <CircularText
                text={isCircleHovered ? hero.circularTextHover : hero.circularText}
                spinDuration={20}
                onHover="slowDown"
                size={120}
                fontSize="0.65rem"
                aria-hidden="true"
                className="text-foreground/60"
              />
              {/* PFP placeholder — 60% of 120px = 72px, static layer that doesn't rotate */}
              <div
                aria-hidden="true"
                className="bg-muted text-muted-foreground pointer-events-none absolute top-1/2 left-1/2 flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full"
                style={{ width: "60%" }}
              >
                <User className="h-1/3 w-1/3" strokeWidth={1.5} />
              </div>
            </div>
          </button>
        </CalendlyModal>
      </div>

      <Container width="wide" className="relative">
        {/* Desktop — anchored to the top-right corner of the hero Container */}
        <div className="animate-in fade-in fill-mode-both pointer-events-auto absolute top-0 right-0 z-10 hidden delay-700 duration-1000 md:block">
          <CalendlyModal ctaPosition="hero_circle_desktop">
            <button
              type="button"
              aria-label="Let's talk — open contact modal"
              className="cursor-pointer rounded-full"
              onMouseEnter={() => {
                setIsCircleHovered(true);
              }}
              onMouseLeave={() => {
                setIsCircleHovered(false);
              }}
            >
              {/* Wrapper sized to match the circle so the PFP overlay can be absolutely centered */}
              <div className="relative" style={{ width: 180, height: 180 }}>
                <CircularText
                  text={isCircleHovered ? hero.circularTextHover : hero.circularText}
                  spinDuration={20}
                  onHover="slowDown"
                  size={180}
                  fontSize="1rem"
                  aria-hidden="true"
                  className="text-foreground/60"
                />
                {/* PFP placeholder — 60% of 180px = 108px, static layer that doesn't rotate */}
                <div
                  aria-hidden="true"
                  className="bg-muted text-muted-foreground pointer-events-none absolute top-1/2 left-1/2 flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full"
                  style={{ width: "60%" }}
                >
                  <User className="h-1/3 w-1/3" strokeWidth={1.5} />
                </div>
              </div>
            </button>
          </CalendlyModal>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Open to Work badge */}
          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700">
            <Badge variant="outline" className="gap-1.5 text-xs">
              <span
                aria-hidden="true"
                className="pulse-ring inline-block h-1.5 w-1.5 rounded-full bg-green-500"
              />
              {hero.badgeText}
            </Badge>
          </div>

          {/* Primary headline — VariableProximity thickens letters near cursor */}
          <h1
            ref={headlineRef}
            className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700"
            style={{
              // Local clamp: tighter min (3.25rem) for mobile without touching
              // the global --text-display-lg token used by other sections.
              // At 375px: ~52px; at 1280px: capped at 7rem (112px).
              fontSize: "clamp(3.25rem, 14vw, 8rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
            }}
          >
            <VariableProximity
              label={hero.headline}
              containerRef={headlineRef}
              fromFontVariationSettings="'wght' 500, 'opsz' 14"
              toFontVariationSettings="'wght' 900, 'opsz' 40"
              radius={200}
              falloff="gaussian"
              className="font-display font-semibold text-balance"
              style={{
                display: "block",
                fontFamily: "var(--font-google-sans-flex), ui-sans-serif, system-ui, sans-serif",
              }}
            />
          </h1>

          {/* Subheadline */}
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-muted-foreground max-w-xl text-base leading-snug delay-150 duration-700 sm:text-xl md:text-2xl">
            {hero.subheadline}
          </p>

          {/* Hero CTAs */}
          <div className="animate-in fade-in fill-mode-both flex flex-wrap gap-3 delay-300 duration-700">
            <Button asChild variant="default" size="lg">
              <Link
                href={hero.primaryCtaHref}
                data-cta-label={hero.primaryCta}
                data-cta-href={hero.primaryCtaHref}
                data-cta-position="hero_primary"
              >
                {hero.primaryCta}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href={hero.downloadCtaHref}
                download
                data-cta-label={hero.downloadCta}
                data-cta-href={hero.downloadCtaHref}
                data-cta-position="hero_download"
              >
                <Download className="h-4 w-4" />
                {hero.downloadCta}
              </a>
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
