"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { SidebarMenuButton } from "@/components/ui/sidebar";

type NavLinkVariant = "sidebar" | "bottom";

interface OwnerNavLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  variant?: NavLinkVariant;
}

/**
 * Active-aware navigation link for the owner workspace.
 *
 * Rendered in two variants:
 * - "sidebar": wraps shadcn SidebarMenuButton with tooltip for icon-rail mode.
 * - "bottom": renders a full touch-target bottom tab link.
 *
 * Uses `usePathname` to determine whether the route is active. Applies
 * `aria-current="page"` and `data-active` for both semantic accessibility
 * and CSS-driven active styling.
 *
 * Touch targets meet the 44×44px minimum (min-h-11 min-w-11).
 * Transitions are gated with motion-safe: to respect prefers-reduced-motion.
 */
export function OwnerNavLink({ href, label, icon, variant = "bottom" }: OwnerNavLinkProps) {
  const pathname = usePathname();

  // Match exact path or sub-paths (e.g. /owner/clients/abc matches /owner/clients)
  const isActive = pathname === href || pathname.startsWith(href + "/");

  if (variant === "sidebar") {
    return (
      <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
        <Link href={href} aria-current={isActive ? "page" : undefined}>
          {icon}
          <span data-nav-label="">{label}</span>
        </Link>
      </SidebarMenuButton>
    );
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      data-active={isActive}
      className={cn(
        "flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2",
        "touch-manipulation",
        "motion-safe:transition-colors motion-safe:duration-200",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        isActive ? "text-accent" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      <span className="text-[11px] leading-none font-medium">{label}</span>
    </Link>
  );
}
