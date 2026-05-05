import Link from "next/link";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

/*
 * HomeHero — above-the-fold section.
 *
 * Design intent (PRO-13 visual refinement):
 *   - Section fills the full viewport height (min-h-screen) with the content
 *     centred vertically — gives the headline room to breathe as a standalone
 *     typographic moment before the user scrolls into the work.
 *   - Type is the entire visual. --text-display-lg scales from 4rem to 9rem
 *     via clamp so the headline fills the viewport at any width.
 *   - Kicker (mono, small, tracked) anchors the editorial tone above the h1.
 *   - Entrance stagger: kicker → headline → sub → CTA row. Total ~600ms via
 *     tw-animate-css CSS-only utilities which respect prefers-reduced-motion.
 *   - Line-height 1.2 and tracking -0.04em give the headline tight, printed
 *     magazine character — Google Sans Flex supports these optical extremes.
 *
 * CTA rule: only outline/link variants here. Primary CTA lives in SiteHeader
 * (md+) and MobileCtaBar (<md) — never duplicated in-page content.
 */
export function HomeHero() {
  const { hero } = homeContent;

  return (
    <Section as="header" spacing="hero" className="flex min-h-screen flex-col justify-center">
      <Container width="wide">
        <div className="flex flex-col gap-8 sm:gap-12">
          {/* Kicker — editorial mono label */}
          <p className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase duration-500">
            {hero.kicker}
          </p>

          {/* Primary headline — display type protagonist */}
          <h1
            className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both font-display font-semibold text-balance delay-100 duration-700"
            style={{
              fontSize: "var(--text-display-lg)",
              lineHeight: 1.2,
              letterSpacing: "-0.04em",
            }}
          >
            {hero.headline}
          </h1>

          {/* Subheadline */}
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-muted-foreground max-w-2xl text-xl leading-snug delay-200 duration-700 sm:text-2xl">
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
