import Link from "next/link";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";

/*
 * SiteHeader — global sticky top navigation.
 *
 * Accessibility:
 *   - Skip link is the first focusable element; it becomes visible on focus
 *     so keyboard users can bypass navigation and land directly on #main-content.
 *   - <header> with role="banner" is the implicit landmark.
 *   - <nav> is labelled so screen readers can distinguish it from other landmarks.
 *
 * CTA strategy:
 *   - Primary CTA ("Book a call") is visible at md+ via the header.
 *   - On <md the header hides the CTA; MobileCtaBar provides it instead.
 *   - No hamburger placeholder is rendered — mobile nav is out of scope.
 *
 * Sticky compensation:
 *   - Uses backdrop-blur so content scrolling beneath is partially legible.
 *   - scroll-padding-top is applied globally in globals.css so anchors/focus
 *     never land under the header.
 */
const navLinks = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function SiteHeader() {
  const { primaryCta } = homeContent;

  return (
    <header className="border-border/30 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      {/* Skip link — visually hidden until focused by keyboard */}
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground absolute top-4 left-4 z-50 -translate-y-16 rounded-md px-4 py-2 text-sm font-medium transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Wordmark — sized up for editorial presence */}
        <Link
          href="/"
          className="font-display text-base font-semibold tracking-tight transition-opacity hover:opacity-70"
          aria-label="Avinro — home"
        >
          Avinro
        </Link>

        {/* Desktop nav + CTA — hidden below md */}
        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-all duration-150 hover:-translate-y-px"
            >
              {link.label}
            </Link>
          ))}

          <Button asChild size="default">
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
