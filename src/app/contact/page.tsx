import type { Metadata } from "next";
import { MailIcon } from "lucide-react";
import Link from "next/link";

import { contactContent } from "@/lib/content/contact";
import { ContactForm } from "@/components/site/contact-form";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Avinro. Have a project in mind or a team that needs direction? Send a message.",
  alternates: {
    canonical: "/contact",
  },
};

// ---------------------------------------------------------------------------
// Section kicker — shared editorial vocabulary
// ---------------------------------------------------------------------------

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Contact aside — email + response time hint shown beside the form on md+
// ---------------------------------------------------------------------------

function ContactAside() {
  const { aside } = contactContent;

  return (
    <aside aria-label="Contact information" className="flex flex-col gap-4 pt-1">
      <div className="flex items-start gap-3">
        <MailIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <Link
            href={aside.emailHref}
            className="text-foreground hover:text-muted-foreground text-sm font-medium underline-offset-4 transition-colors hover:underline"
          >
            {aside.emailLabel}
          </Link>
          <p className="text-muted-foreground text-sm">{aside.responseTime}</p>
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/*
 * Contact page — PRO-19 / F1-8.
 *
 * Layout:
 *   Mobile  (<md): stacked — intro text, then form + aside below.
 *   Desktop (md+): two-column — intro left, form right + aside below form.
 *
 * The section uses pb-[var(--space-cta-bar)] on mobile to prevent the submit
 * button from being hidden behind the fixed MobileCtaBar. ContactForm owns
 * its own internal padding guard; the section does not add it again.
 *
 * Server component — no client JS required at this level.
 * Mobile-first: all base styles target 375px, responsive prefixes are additive.
 */
export default function ContactPage() {
  const { hero } = contactContent;

  return (
    <main id="main-content">
      <Section spacing="hero">
        <Container>
          {/*
           * Two-column on md+.
           * Left column: kicker + headline + subheading + aside.
           * Right column: form (grows to fill available space).
           */}
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
            {/* Left — copy */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <SectionKicker>{hero.kicker}</SectionKicker>

                <h1
                  className="font-display font-semibold tracking-tight text-balance"
                  style={{ fontSize: "var(--text-display-sm)", lineHeight: 1.1 }}
                >
                  {hero.heading}
                </h1>

                <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                  {hero.subheading}
                </p>
              </div>

              {/* Aside — visible on all viewports but indented below copy */}
              <ContactAside />
            </div>

            {/* Right — form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
