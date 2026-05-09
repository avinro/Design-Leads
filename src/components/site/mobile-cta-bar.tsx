"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * MobileCtaBar — bottom-fixed primary CTA for mobile viewports.
 *
 * Only rendered below the md breakpoint (md:hidden). On md+ the primary CTA
 * lives in SiteHeader so there is always exactly one primary CTA visible.
 *
 * Footer convivencia:
 *   The curtain footer (position: fixed, z-0) is revealed when the user
 *   scrolls to the bottom. An IntersectionObserver on [data-curtain-footer]
 *   hides this bar (translate-y-full) when the footer is >= 50% visible,
 *   preventing the bar from covering the footer CTA.
 *
 * Safe-area: pb-[env(safe-area-inset-bottom)] ensures the button sits above
 * the home indicator / gesture bar on notched devices.
 *
 * The button height is set to min-h-[44px] to satisfy the >=44px touch target
 * requirement.
 */
export function MobileCtaBar() {
  const { primaryCta } = homeContent;
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const target = document.querySelector("[data-curtain-footer]");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.intersectionRatio >= 0.5);
      },
      { threshold: 0.5 },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      aria-label="Primary call to action"
      className={cn(
        "border-border/40 bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t px-4 pt-3 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-transform duration-300 md:hidden",
        footerVisible && "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <Button asChild className="min-h-[44px] w-full">
        <Link
          href={primaryCta.href}
          data-cta-label={primaryCta.label}
          data-cta-href={primaryCta.href}
          data-cta-position="mobile_bar"
        >
          {primaryCta.label}
        </Link>
      </Button>
      {/* Bottom padding below button so the bar doesn't clip content */}
      <div className="h-3" aria-hidden="true" />
    </div>
  );
}
