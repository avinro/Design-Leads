import Link from "next/link";

/*
 * SiteFooter — minimal global footer.
 *
 * Design intent (PRO-13 visual refinement):
 *   The wordmark appears at the top of the footer above the nav/copyright
 *   row, giving the page a proper close (name → nav → copyright).
 *
 * pb-[var(--space-cta-bar)] reserves space on mobile so the last content
 * item is not hidden behind the fixed MobileCtaBar. md:pb-0 removes the
 * extra padding on desktop where MobileCtaBar is hidden.
 */

const footerLinks = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/40 flex min-h-screen flex-col border-t pb-[var(--space-cta-bar)] md:pb-0">
      <div className="mx-auto mt-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-display w-fit text-base font-semibold tracking-tight transition-opacity hover:opacity-70"
          aria-label="Avinro — home"
        >
          Avinro
        </Link>

        {/* Nav + copyright row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer navigation" className="flex gap-5">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground font-mono text-xs tracking-wider uppercase transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="mailto:hello@avinro.com"
              className="text-muted-foreground hover:text-foreground font-mono text-xs tracking-wider uppercase transition-colors"
            >
              Email
            </a>
          </nav>

          <p className="text-muted-foreground font-mono text-xs">&copy; {year} Avinro</p>
        </div>
      </div>
    </footer>
  );
}
