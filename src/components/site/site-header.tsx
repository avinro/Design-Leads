"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { CalendlyModal } from "@/components/site/calendly-modal";
import { SiteTextLink } from "@/components/site/site-text-link";
import { isNavSectionActive } from "@/lib/navigation/nav-active";

import { cn } from "@/lib/utils";

/*
 * SiteHeader — global navigation with scroll-driven pill morph + expanding mobile menu.
 *
 * Positioning:
 *   `fixed inset-x-0 top-0` — no space reserved in the layout flow.
 *   Raises to z-50 when the mobile menu is open to sit above MobileCtaBar (z-40).
 *
 * Morph states (mobile menu closed):
 *   At top  (scrollY ≤ 40): full-width bar, translucent.
 *   Scrolled (scrollY > 40): centered pill, max 72rem, 8px from top.
 *
 * Mobile menu:
 *   The glass container itself expands from h-14 → calc(100dvh − 16px) via a CSS
 *   height transition. `overflow-hidden` clips the mobile content while closed.
 *   No portal, no Dialog — the expanded section is always in the DOM but hidden
 *   behind the height clip. Links use tabIndex={-1} + aria-hidden when closed.
 *
 * Hamburger icon:
 *   Three absolute-positioned spans. Lines 1 & 3 translate to center and rotate
 *   ±45° to form an X; line 2 shrinks and fades.
 *
 * Keyboard / accessibility:
 *   Esc closes the menu.
 *   Viewport reaching md breakpoint closes the menu.
 *   Button carries aria-expanded + aria-controls; panel carries aria-hidden.
 *   Skip link is always the first focusable element.
 */

const navLinks = [
  { label: "Work", href: "/work" },
  { label: "Case studies", href: "/case-studies" },
  { label: "About", href: "/about" },
] as const;

const SCROLL_THRESHOLD = 40;

export function SiteHeader() {
  const { primaryCta } = homeContent;
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // When already on /, clicking the logo scrolls to top instead of navigating.
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMenuOpen) setIsMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Scroll-driven pill morph
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > SCROLL_THRESHOLD;
      if (next === isScrolledRef.current) return;
      isScrolledRef.current = next;
      setIsScrolled(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  // Close when viewport reaches the md breakpoint (≥768px)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onResize = () => {
      if (mq.matches) setIsMenuOpen(false);
    };
    mq.addEventListener("change", onResize);
    return () => {
      mq.removeEventListener("change", onResize);
    };
  }, []);

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className={cn("fixed inset-x-0 top-0", isMenuOpen ? "z-50" : "z-40")}>
      {/* Skip link — visually hidden until focused by keyboard */}
      <a
        href="#main-content"
        className="focus-ring bg-primary text-primary-foreground absolute top-4 left-4 z-50 -translate-y-16 rounded-md px-4 py-2 text-sm font-medium transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      {/* Scrim — dark blurred overlay behind the expanded menu, above page content */}
      <div
        aria-hidden="true"
        className={cn(
          "bg-foreground/40 fixed inset-0 backdrop-blur-sm",
          "transition-opacity duration-300 ease-in-out motion-reduce:transition-none md:hidden",
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Glass container — expands to full screen on mobile when menu is open.
          data-glass-surface is only applied when the glass effect is active so the
          prefers-reduced-transparency rule in globals.css does not override the
          transparent at-rest state. */}
      <div
        data-glass-surface={isScrolled || isMenuOpen ? "" : undefined}
        className={cn(
          "flex flex-col overflow-hidden",
          "border-border/50",
          "transition-[height,width,max-width,margin,border-radius,padding,background-color] duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:transition-none",
          isMenuOpen
            ? [
                "mx-2 mt-2 h-[calc(100dvh-16px)] rounded-2xl border px-6",
                "bg-background supports-[backdrop-filter]:bg-background/92",
                "supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150",
              ]
            : isScrolled
              ? [
                  "mx-auto mt-2 h-14 w-[calc(100%-16px)] max-w-[50rem] rounded-[28px] border px-5 sm:px-6",
                  "bg-background supports-[backdrop-filter]:bg-background/65",
                  "supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150",
                  "md:supports-[backdrop-filter]:backdrop-blur-xl",
                ]
              : "mx-auto mt-0 h-14 w-full max-w-7xl rounded-none border-transparent bg-transparent px-4 sm:px-6 lg:px-8",
        )}
      >
        {/* ── Top row — always visible ─────────────────────────────────── */}
        <div className="flex h-14 shrink-0 items-center justify-between">
          {/* Wordmark — Link falls through on same-route (/) and when
              handleLogoClick calls e.preventDefault() to scroll-to-top */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="focus-ring rounded-sm transition-opacity hover:opacity-70"
            aria-label="Avinro — home"
          >
            <Image src="/logo.png" alt="" width={144} height={28} priority className="h-5 w-auto" />
          </Link>

          {/* Desktop nav + CTA — hidden below md */}
          <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const active = isNavSectionActive(pathname, link.href);
              return (
                <SiteTextLink key={link.href} href={link.href} variant="navDesktop" active={active}>
                  {link.label}
                </SiteTextLink>
              );
            })}
            <CalendlyModal ctaPosition="header">
              <Button
                size="default"
                className="font-mono text-xs tracking-wider uppercase"
                data-cta-label={primaryCta.label}
                data-cta-href={primaryCta.href}
                data-cta-position="header"
              >
                {primaryCta.label}
              </Button>
            </CalendlyModal>
          </nav>

          {/* Hamburger / close button — mobile only */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen((v) => !v);
            }}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="focus-ring relative flex h-[44px] w-[44px] items-center justify-center rounded-md md:hidden"
          >
            {/* Three lines that morph into an X */}
            <span className="relative block h-[14px] w-5" aria-hidden="true">
              {/* Line 1 — top → first diagonal */}
              <span
                className={cn(
                  "absolute left-0 h-0.5 w-full origin-center rounded-sm bg-current",
                  "transition-all duration-300 ease-in-out motion-reduce:transition-none",
                  isMenuOpen ? "top-[6px] rotate-45" : "top-0 rotate-0",
                )}
              />
              {/* Line 2 — middle → disappears */}
              <span
                className={cn(
                  "absolute top-[6px] left-0 h-0.5 w-full rounded-sm bg-current",
                  "transition-all duration-300 ease-in-out motion-reduce:transition-none",
                  isMenuOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100",
                )}
              />
              {/* Line 3 — bottom → second diagonal */}
              <span
                className={cn(
                  "absolute left-0 h-0.5 w-full origin-center rounded-sm bg-current",
                  "transition-all duration-300 ease-in-out motion-reduce:transition-none",
                  isMenuOpen ? "top-[6px] -rotate-45" : "top-[12px] rotate-0",
                )}
              />
            </span>
          </button>
        </div>

        {/* ── Mobile expanded content — clipped by overflow-hidden when closed ── */}
        <div
          id="mobile-nav-panel"
          className="flex flex-1 flex-col pb-4 md:hidden"
          aria-hidden={!isMenuOpen}
        >
          {/* Nav links — centered, staggered entrance from bottom */}
          <nav
            aria-label="Mobile navigation"
            className="flex flex-1 flex-col items-center justify-center gap-8 text-center"
          >
            {navLinks.map((link, i) => {
              const active = isNavSectionActive(pathname, link.href);
              return (
                <SiteTextLink
                  key={link.href}
                  href={link.href}
                  variant="navMobile"
                  active={active}
                  tabIndex={isMenuOpen ? undefined : -1}
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    // Animate in after container expands; opacity-0 while hidden
                    isMenuOpen
                      ? "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-300"
                      : "pointer-events-none opacity-0",
                  )}
                  style={isMenuOpen ? { animationDelay: `${String(280 + i * 60)}ms` } : undefined}
                >
                  {link.label}
                </SiteTextLink>
              );
            })}
          </nav>

          {/* Primary CTA — follows links with staggered entrance */}
          <div
            className={cn(
              "mt-auto shrink-0",
              isMenuOpen
                ? "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-300"
                : "opacity-0",
            )}
            style={isMenuOpen ? { animationDelay: `${String(280 + 3 * 60)}ms` } : undefined}
          >
            <CalendlyModal ctaPosition="mobile_overlay">
              <Button
                size="lg"
                className="min-h-[44px] w-full"
                tabIndex={isMenuOpen ? undefined : -1}
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                data-cta-label={primaryCta.label}
                data-cta-href={primaryCta.href}
                data-cta-position="mobile_overlay"
              >
                {primaryCta.label}
              </Button>
            </CalendlyModal>
          </div>
        </div>
      </div>
    </header>
  );
}
