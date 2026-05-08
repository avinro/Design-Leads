import Link from "next/link";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";

/*
 * MobileCtaBar — bottom-fixed primary CTA for mobile viewports.
 *
 * Only rendered below the md breakpoint (md:hidden).  On md+ the primary CTA
 * lives in SiteHeader so there is always exactly one primary CTA visible.
 *
 * Safe-area: pb-[env(safe-area-inset-bottom)] ensures the button sits above
 * the home indicator / gesture bar on notched devices.
 *
 * The button height is set to min-h-[44px] to satisfy the >=44px touch target
 * requirement from ui-ux-pro-max §2.
 *
 * No JavaScript or scroll listeners — the bar is always visible on mobile,
 * which avoids the "appears / disappears" jank and simplifies a11y.
 */
export function MobileCtaBar() {
  const { primaryCta } = homeContent;

  return (
    <div
      aria-label="Primary call to action"
      className="border-border/40 bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t px-4 pt-3 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
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
