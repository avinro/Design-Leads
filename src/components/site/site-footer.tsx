import dynamic from "next/dynamic";
import Link from "next/link";

/*
 * SiteFooter — minimal global footer.
 *
 * Design intent (rotation rebrand):
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
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/40 flex min-h-screen flex-col border-t pb-[var(--space-cta-bar)] md:pb-0">
      <div className="mx-auto mt-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Wordmark echo — small CircularText linking home */}
        <Link
          href="/"
          aria-label="Avinro — home"
          className="focus-visible:ring-ring w-fit rounded-full transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <CircularText
            text="AVINRO * AVINRO * "
            size={88}
            spinDuration={30}
            onHover="speedUp"
            aria-label="Avinro"
            className="text-foreground/60"
          />
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
