import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Consistent page-level heading block used across all client portal routes.
 *
 * Renders an optional uppercase eyebrow, a bold title, an optional subtitle,
 * and an optional action slot (e.g. a button or badge) aligned right on md+.
 *
 * Mobile-first: eyebrow + title + subtitle stack vertically; action moves to
 * the right at sm+ via flex-row.
 */
export function PageHeader({ eyebrow, title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between", className)}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-foreground text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
      </div>
      {action && <div className="mt-3 shrink-0 sm:mt-0">{action}</div>}
    </div>
  );
}
