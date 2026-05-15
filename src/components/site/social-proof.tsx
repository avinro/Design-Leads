import { homeContent } from "@/lib/content/home";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

/*
 * SocialProof — testimonial section.
 *
 * Design intent (PRO-13 visual refinement):
 *   The testimonial quote is the entire visual — large, typographically
 *   expressive, no borders or call-out boxes. The large decorative opening
 *   quotation mark is aria-hidden (purely visual ornament).
 *
 *   Logo row: demoted to small muted rectangles below the attribution,
 *   clearly decorative (aria-hidden) — the accessible social proof is the
 *   text of the quote and its attribution, not logo shapes.
 *
 *   Section kicker (e.g. "Testimonials") is mono above the quote, not a bold heading.
 */
export function SocialProof() {
  const { socialProof } = homeContent;

  return (
    <Section>
      <Container>
        <div className="flex flex-col gap-8">
          {/* Section kicker */}
          <p className="text-muted-foreground w-full text-center font-mono text-xs tracking-[0.15em] uppercase">
            {socialProof.sectionTitle}
          </p>

          {/* Quote block */}
          <figure className="flex flex-col gap-6">
            {/* Decorative opening quotation mark */}
            <span
              aria-hidden="true"
              className="font-display text-muted-foreground/30 text-6xl leading-none select-none sm:text-7xl"
            >
              &ldquo;
            </span>

            {/* The testimonial quote is the visual centrepiece */}
            <blockquote>
              <p
                className="font-display text-foreground leading-tight font-semibold tracking-tight text-balance"
                style={{ fontSize: "var(--text-display-sm)" }}
              >
                {socialProof.testimonial.quote}
              </p>
            </blockquote>

            {/* Attribution */}
            <figcaption className="flex flex-col gap-0.5">
              <span className="text-foreground text-sm font-medium">
                {socialProof.testimonial.author}
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                {socialProof.testimonial.role}
              </span>
            </figcaption>
          </figure>

          {/* Decorative logo placeholders — purely visual, no a11y meaning */}
          <ul aria-hidden="true" className="flex flex-wrap gap-3">
            {Array.from({ length: socialProof.logoCount }).map((_, i) => (
              <li key={i} className="bg-muted/60 h-6 w-18 rounded-sm opacity-60 sm:h-7 sm:w-22" />
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
