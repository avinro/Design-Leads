import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

/**
 * Reusable empty state for client portal routes.
 *
 * Used by placeholder pages today (Projects, Files, Comments, Settings) and
 * by future "no items yet" states once features ship. Accepts an optional icon,
 * title, description, and up to two action slots.
 *
 * Mobile-first: all content is centered vertically/horizontally within the
 * parent flex container that each route wraps it with.
 */
export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-4 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="text-muted-foreground/50 bg-muted flex size-14 items-center justify-center rounded-full">
          {icon}
        </div>
      )}

      <div className="max-w-xs space-y-1">
        <p className="text-foreground text-base font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        )}
      </div>

      {(primaryAction ?? secondaryAction) && (
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
