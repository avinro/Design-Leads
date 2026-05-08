"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { homeContent } from "@/lib/content/home";

/*
 * SiteFooter — full-screen closing section.
 *
 * Design intent (rotation rebrand):
 *   The final CTA now lives inside the footer instead of as a separate
 *   FinalCta section. This makes the page end with one cohesive closing
 *   section: big question + supporting text-link, then wordmark/nav/copyright.
 *
 *   The wordmark is replaced with a small, very slowly spinning CircularText
 *   that says "AVINRO * AVINRO *". It wraps a home <Link> so it stays a
 *   clickable anchor, and carries aria-label="Avinro — home" so screen
 *   readers announce it correctly regardless of what the letters are doing.
 *
 *   This is the cadence echo — same motion language as the hero protagonist,
 *   but --motion-spin-slow (30 s) instead of medium (20 s). The slower spin
 *   signals distance from the entry point without breaking the vocabulary.
 *
 * pb-[var(--space-cta-bar)] reserves space on mobile so the last content
 * item is not hidden behind the fixed MobileCtaBar. md:pb-0 removes the
 * extra padding on desktop where MobileCtaBar is hidden.
 */

const CircularText = dynamic(
  () => import("@/components/motion/circular-text").then((m) => m.CircularText),
  {
    ssr: false,
    loading: () => <div className="h-[88px] w-[88px] shrink-0" aria-hidden="true" />,
  },
);

const footerLinks = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { finalCta } = homeContent;

  return (
    <footer className="border-background/10 bg-foreground text-background flex min-h-screen flex-col border-t pb-[var(--space-cta-bar)] md:pb-0">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between gap-12 px-4 py-12 sm:px-6 lg:px-8">
        {/* Closing CTA — secondary text-link, not a persistent primary button */}
        <section
          aria-labelledby="footer-cta-title"
          className="flex flex-1 flex-col justify-center gap-8 py-12"
        >
          <h2
            id="footer-cta-title"
            className="font-display leading-tight font-semibold tracking-tight text-balance"
            style={{ fontSize: "var(--text-display-md)" }}
          >
            {finalCta.heading}
          </h2>

          <Link
            href={finalCta.linkHref}
            data-cta-label={finalCta.linkLabel}
            data-cta-href={finalCta.linkHref}
            data-cta-position="footer_link"
            className="font-display focus-visible:ring-background focus-visible:ring-offset-foreground inline-flex w-fit items-center gap-2 border-b-2 border-current pb-0.5 text-2xl font-semibold tracking-tight transition-opacity duration-150 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-3xl"
          >
            {finalCta.linkLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        <div className="flex flex-col gap-8">
          {/* Wordmark echo — small CircularText linking home */}
          <Link
            href="/"
            aria-label="Avinro — home"
            className="focus-visible:ring-background focus-visible:ring-offset-foreground w-fit rounded-full transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <CircularText
              text="AVINRO * AVINRO * "
              size={88}
              spinDuration={30}
              onHover="speedUp"
              aria-label="Avinro"
              className="text-background/60"
            />
          </Link>

          {/* Nav + copyright row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Footer navigation" className="flex gap-5">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-background/70 hover:text-background font-mono text-xs tracking-wider uppercase transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="mailto:hello@avinro.com"
                className="text-background/70 hover:text-background font-mono text-xs tracking-wider uppercase transition-colors"
              >
                Email
              </a>
            </nav>

            <p className="text-background/70 font-mono text-xs">&copy; {year} Avinro</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
