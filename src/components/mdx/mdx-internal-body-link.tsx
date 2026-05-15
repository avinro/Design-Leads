import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import {
  siteUnderlineBarClassName,
  SITE_LINK_COLOR_MOTION,
} from "@/components/site/site-link-underline";
import { cn } from "@/lib/utils";

const mdxInternalBodyLinkClassName = cn(
  "group text-accent relative inline pb-0.5 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
  SITE_LINK_COLOR_MOTION,
  "rounded-sm hover:text-accent/90",
);

/** Server-safe MDX `<Link>` with persistent underline + hover emphasis (matches site prose pattern). */
export function MdxInternalBodyLink({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link {...props} className={cn(mdxInternalBodyLinkClassName, className)}>
      <span className="relative inline pb-0.5">
        {children}
        <span
          aria-hidden
          className={siteUnderlineBarClassName({ active: true, mode: "proseAccent" })}
        />
      </span>
    </Link>
  );
}
