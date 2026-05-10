import type { Metadata } from "next";

import { privacyContent } from "@/lib/content/privacy";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: privacyContent.meta.title,
  description: privacyContent.meta.description,
  alternates: {
    canonical: "/privacy",
  },
  // Privacy page does not need OG/Twitter cards — no social sharing intent.
};

export default function PrivacyPage() {
  const { hero, sections, lastUpdated } = privacyContent;

  return (
    <main id="main-content">
      {/* Hero */}
      <Section spacing="heroInternal">
        <Container>
          <p className="text-muted-foreground mb-4 font-mono text-xs tracking-[0.15em] uppercase">
            {hero.kicker}
          </p>
          <h1 className="font-display mb-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {hero.heading}
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
            {hero.subheading}
          </p>
        </Container>
      </Section>

      {/* Content sections */}
      <Section>
        <Container>
          <div className="flex flex-col gap-12">
            {sections.map((section) => (
              <div key={section.heading} className="flex flex-col gap-4">
                <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  {section.heading}
                </h2>
                <ul className="text-muted-foreground flex flex-col gap-3 text-base leading-relaxed">
                  {section.body.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}

            <p className="text-muted-foreground border-border/40 border-t pt-8 font-mono text-xs">
              Last updated: {lastUpdated}
            </p>
          </div>
        </Container>
      </Section>
    </main>
  );
}
