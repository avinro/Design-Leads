import { homeContent } from "@/lib/content/home";
import { SiteTextLink } from "@/components/site/site-text-link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

/*
 * AboutTeaser — short bio with a link to the full /about page.
 *
 * Design intent (PRO-13 visual refinement):
 *   The generic "About" heading label is removed — the bio opens immediately
 *   with a typographically expressive first sentence styled as a display
 *   heading. The rest of the content follows in body weight.
 *
 *   The "More about me" link is styled in mono to maintain the editorial
 *   system: mono = navigation/meta text, display = content headlines.
 *
 *   Container width="narrow" (max-w-prose) keeps the reading measure
 *   comfortable on wide viewports.
 */
export function AboutTeaser() {
  const { aboutTeaser } = homeContent;

  return (
    <Section>
      <Container width="narrow">
        <div className="max-w3xl mx-auto flex flex-col items-center gap-5 text-center">
          {/* Bio — centred, acts as the section heading */}
          <p className="font-display text-foreground text-2xl leading-snug font-semibold tracking-tight sm:text-3xl">
            {aboutTeaser.bio}
          </p>

          {/* Mono link — meta/navigation register */}
          <SiteTextLink href={aboutTeaser.linkHref} variant="inlineMono">
            {aboutTeaser.linkLabel}
            <span aria-hidden="true" className="transition-transform duration-150">
              →
            </span>
          </SiteTextLink>
        </div>
      </Container>
    </Section>
  );
}
