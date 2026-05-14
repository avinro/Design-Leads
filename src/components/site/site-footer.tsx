import Image from "next/image";
import Link from "next/link";

import { homeContent } from "@/lib/content/home";

/*
 * SiteFooter — curtain footer.
 *
 * Positioning strategy:
 *   The footer uses position: fixed; bottom: 0; z-0 so it is always "behind"
 *   the page content. The curtain wrapper in (site)/layout.tsx sits at z-10
 *   with the same reveal height, which means:
 *     - While the user scrolls through page content, the wrapper covers the footer.
 *     - At the very bottom of the page, the wrapper slides above the footer,
 *       revealing it underneath — the "lifting curtain" effect.
 *
 *   The reveal height is 100dvh - 72px: a scrolled header sits 8px from the
 *   top and is 56px tall, then the footer starts 8px below its bottom edge.
 *
 *   pointer-events-none on the root prevents the hidden footer from intercepting
 *   clicks while it is behind the content wrapper. pointer-events-auto is restored
 *   inside the interactive container.
 *
 * Typography:
 *   The closing CTA heading uses letter-spacing: 0.8em (confirmed by design spec).
 *   text-wrap: balance + max-w-3xl prevent extreme wrapping on small viewports.
 *   font-weight is reduced to medium to counteract the visual weight added by
 *   ultra-wide tracking at display sizes.
 *
 * CircularText removed per design spec (replaced by plain Avinro text link).
 *
 * pb-[var(--space-cta-bar)] md:pb-0 reserves space on mobile so the last
 * content item is not hidden behind the fixed MobileCtaBar.
 */

const footerLinks = [
  { label: "Work", href: "/work" },
  { label: "Case studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { finalCta } = homeContent;

  return (
    <footer
      data-curtain-footer
      className="border-background/10 bg-foreground text-background pointer-events-none fixed inset-x-0 bottom-0 z-0 flex h-[calc(100dvh-72px)] flex-col border-t"
    >
      {/* Interactive inner container — restores pointer events */}
      <div className="pointer-events-auto mx-auto flex h-full w-full max-w-7xl flex-col justify-between gap-12 px-4 py-12 pb-6 sm:px-6 lg:px-8">
        {/* Closing CTA */}
        <section
          aria-labelledby="footer-cta-title"
          className="flex flex-1 flex-col justify-center gap-8 py-12"
        >
          <h3
            id="footer-cta-title"
            className="font-display text-3xl font-semibold text-balance sm:text-4xl md:text-[length:var(--text-display-md)]"
            style={{
              letterSpacing: "-0.03em",
              lineHeight: "0.9",
            }}
          >
            {finalCta.heading}
          </h3>

          <Link
            href={finalCta.linkHref}
            data-cta-label={finalCta.linkLabel}
            data-cta-href={finalCta.linkHref}
            data-cta-position="footer_link"
            className="focus-visible:ring-background focus-visible:ring-offset-foreground font-display inline-flex w-fit items-center gap-2 border-b-2 border-current pb-0.5 text-2xl font-semibold tracking-tight transition-opacity duration-150 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-3xl"
          >
            {finalCta.linkLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        <div className="flex flex-col gap-8">
          {/* Wordmark — logo, inverted for the dark footer surface */}
          <Link
            href="/"
            aria-label="Avinro — home"
            className="focus-ring-invert w-fit rounded-sm transition-opacity hover:opacity-70"
          >
            <Image src="/logo.png" alt="" width={62} height={12} className="h-3 w-auto invert" />
          </Link>

          {/* Nav + copyright row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Footer navigation" className="flex gap-5">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="focus-ring-invert text-background/70 hover:text-background rounded-sm font-mono text-xs tracking-wider uppercase transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="text-background/70 font-mono text-xs">&copy; {year} Avinro</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
