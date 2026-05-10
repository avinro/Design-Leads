import type { Metadata } from "next";
import { ArrowUpRightIcon } from "lucide-react";
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
// Contact aside — social links shown beside the form
// ---------------------------------------------------------------------------

function ContactAside() {
  const { aside } = contactContent;

  return (
    <aside aria-label="Find me online" className="flex flex-col gap-4 pt-1">
      <p className="text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase">
        {aside.sectionLabel}
      </p>
      <ul className="flex flex-col gap-2.5" role="list">
        {aside.socials.map((social) =>
          social.comingSoon ? (
            <li key={social.label} className="flex items-center gap-2">
              <span className="text-muted-foreground/50 text-sm font-medium select-none">
                {social.label}
              </span>
              <span className="bg-muted text-muted-foreground/60 rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wide uppercase">
                Soon
              </span>
            </li>
          ) : (
            <li key={social.label}>
              <Link
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group text-foreground hover:text-muted-foreground inline-flex items-center gap-1 rounded-sm text-sm font-medium transition-colors"
              >
                {social.label}
                <ArrowUpRightIcon
                  className="size-3 opacity-40 transition-opacity group-hover:opacity-70"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ),
        )}
      </ul>
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
      <Section spacing="heroInternalCompact">
        <Container>
          {/*
           * Three-item grid.
           *
           * Mobile  (<md): single column — copy → form → aside (socials last).
           * Desktop (md+): two columns — col 1: copy + aside below; col 2: form
           *   spanning both rows via md:row-span-2 so the aside aligns naturally
           *   under the copy in col 1 without any explicit placement needed.
           */}
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-start md:gap-x-16 md:gap-y-8 lg:gap-x-24">
            {/* 1 — Hero copy (mobile: row 1 · desktop: col 1 row 1) */}
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

            {/* 2 — Form (mobile: row 2 · desktop: col 2 rows 1–2) */}
            <div className="md:row-span-2">
              <ContactForm />
            </div>

            {/* 3 — Aside / socials (mobile: row 3 · desktop: col 1 row 2) */}
            <ContactAside />
          </div>
        </Container>
      </Section>
    </main>
  );
}
