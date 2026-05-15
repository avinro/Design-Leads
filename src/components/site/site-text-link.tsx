"use client";

import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";

import { siteUnderlineBarClassName } from "@/components/site/site-link-underline";
import { cn } from "@/lib/utils";

const siteTextLinkVariants = cva(
  "group relative rounded-sm pb-0.5 transition-colors duration-200 ease-out motion-reduce:transition-none",
  {
    variants: {
      variant: {
        navDesktop:
          "focus-ring font-mono text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground",
        navMobile:
          "focus-ring flex min-h-11 w-full flex-col items-center justify-center rounded-md pb-1 text-center font-display text-3xl font-semibold tracking-tight text-foreground/90 hover:opacity-60 aria-[current=page]:text-foreground aria-[current=page]:opacity-100 aria-[current=page]:hover:opacity-100 motion-reduce:hover:opacity-100",
        inlineMono: "focus-ring font-mono text-sm text-muted-foreground hover:text-foreground",
        footerNav:
          "focus-ring-invert font-mono text-xs tracking-wider uppercase text-background/70 hover:text-background aria-[current=page]:text-background",
      },
    },
    defaultVariants: {
      variant: "inlineMono",
    },
  },
);

export type SiteTextLinkProps = ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof siteTextLinkVariants> & {
    /** When true, underline stays visible and `aria-current="page"` is set. */
    active?: boolean;
  };

export function SiteTextLink({
  href,
  variant = "inlineMono",
  active = false,
  className,
  children,
  ...props
}: SiteTextLinkProps) {
  const underlineMode = "reveal";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(siteTextLinkVariants({ variant }), className)}
      {...props}
    >
      <span
        className={cn(
          "relative",
          variant === "inlineMono"
            ? "inline-flex flex-wrap items-center gap-x-1.5 gap-y-0"
            : "inline-block",
        )}
      >
        {children}
        <span aria-hidden className={siteUnderlineBarClassName({ active, mode: underlineMode })} />
      </span>
    </Link>
  );
}
