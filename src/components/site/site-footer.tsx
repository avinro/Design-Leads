"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { homeContent } from "@/lib/content/home";
import { SOCIAL_LINKS } from "@/lib/seo/site";
import { CalendlyModal } from "@/components/site/calendly-modal";
import { BehanceIcon } from "@/components/site/icons/behance-icon";
import { GithubIcon } from "@/components/site/icons/github-icon";
import { LinkedinIcon } from "@/components/site/icons/linkedin-icon";
import { siteUnderlineBarClassName } from "@/components/site/site-link-underline";
import { SiteTextLink } from "@/components/site/site-text-link";
import { isNavSectionActive } from "@/lib/navigation/nav-active";

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
 */

const footerLinks = [
  { label: "Work", href: "/work" },
  { label: "Case studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
] as const;

const socialLinks = [
  { label: "GitHub", href: SOCIAL_LINKS.github, Icon: GithubIcon },
  { label: "LinkedIn", href: SOCIAL_LINKS.linkedin, Icon: LinkedinIcon },
] as const;

export function SiteFooter() {
  const pathname = usePathname();
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

          <CalendlyModal ctaPosition="footer_link">
            <button
              type="button"
              data-cta-label={finalCta.linkLabel}
              data-cta-href={finalCta.linkHref}
              data-cta-position="footer_link"
              className="focus-ring-invert group focus-visible:ring-background focus-visible:ring-offset-foreground font-display hover:text-background/90 inline-flex w-fit cursor-pointer text-2xl font-semibold tracking-tight transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none sm:text-3xl"
            >
              <span className="relative inline-flex items-center gap-2 pb-0.5">
                {finalCta.linkLabel}
                <span aria-hidden="true">→</span>
                <span
                  aria-hidden
                  className={siteUnderlineBarClassName({ active: false, mode: "reveal" })}
                />
              </span>
            </button>
          </CalendlyModal>
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

          {/* Nav + social + copyright row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Footer navigation" className="flex gap-5">
              {footerLinks.map((link) => {
                const active = isNavSectionActive(pathname, link.href);
                return (
                  <SiteTextLink
                    key={link.href}
                    href={link.href}
                    variant="footerNav"
                    active={active}
                  >
                    {link.label}
                  </SiteTextLink>
                );
              })}
            </nav>

            {/* Social icons */}
            <div className="flex items-center gap-4" aria-label="Social links">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  data-cta-position="footer_social"
                  className="focus-ring-invert text-background/70 hover:text-background rounded-sm transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <a
                href={SOCIAL_LINKS.behance}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Behance"
                data-cta-position="footer_social"
                className="focus-ring-invert text-background/70 hover:text-background rounded-sm transition-colors"
              >
                <BehanceIcon className="h-4 w-4" />
              </a>
            </div>

            <p className="text-background/70 font-mono text-xs">&copy; {year} Avinro</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
