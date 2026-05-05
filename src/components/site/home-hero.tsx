import dynamic from "next/dynamic";
import Link from "next/link";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

/*
 * CircularText is a client component with a continuous rAF-style rotation
 * driven by motion. We lazy-load it so the server-rendered HTML (headline,
 * subheadline, CTA) is non-blocking. The fallback preserves layout space.
 */
const CircularText = dynamic(
  () => import("@/components/motion/circular-text").then((m) => m.CircularText),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="bg-muted/20 shrink-0 rounded-full"
        style={{ width: 320, height: 320 }}
      />
    ),
  },
);

/*
 * HomeHero — rotation rebrand protagonist section.
 *
 * Layout:
 *   Mobile  — single column: copy above, CircularText below the CTA.
 *   lg+     — two columns: copy left (flex-1), CircularText right (fixed size,
 *             slightly offset down for visual tension against the headline).
 *
 * CircularText carries the positioning signal "STRATEGY * EXECUTION * SHIPPED"
 * that the removed kicker used to deliver as plain text. The spinning element
 * draws the eye, but the headline still reads first because it is higher in
 * the DOM and larger in visual weight.
 *
 * CTA rule: outline variant only here. Primary CTA lives in SiteHeader (md+)
 * and MobileCtaBar (<md) — never duplicated in-page.
 *
 * Motion guardrail: CircularText calls useReducedMotion() internally.
 * When the user prefers reduced motion the circle is rendered statically
 * (letters positioned, no rotation, hover handlers disabled).
 */
export function HomeHero() {
  const { hero } = homeContent;

  return (
    <Section as="header" spacing="hero" className="flex min-h-screen flex-col justify-center">
      <Container width="wide">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* ── Copy column ────────────────────────────────────────────── */}
          <div className="flex flex-1 flex-col gap-8 sm:gap-10">
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

          {/* ── CircularText column ─────────────────────────────────────
           * Hidden on sm and below — the hero already has strong typographic
           * weight; showing a full-size circle on a 375px viewport would push
           * the CTA below the fold.
           * On md (768px) the circle appears at a smaller size, centred.
           * On lg+ it sits at the right with a slight downward offset.
           */}
          <div className="animate-in fade-in fill-mode-both hidden delay-500 duration-1000 md:flex md:justify-center lg:block lg:shrink-0 lg:translate-y-6">
            <CircularText
              text={hero.circularText}
              spinDuration={20}
              onHover="slowDown"
              size={320}
              aria-label="Strategy · Execution · Shipped"
              className="text-foreground/80"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
