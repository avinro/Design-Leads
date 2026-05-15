import type { LucideIcon } from "lucide-react";
import { Building2, Calendar, Hexagon, LayoutGrid, Layers, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fixed palette + icon per metadata row. Keys are stable so colors never
 * change between renders or projects.
 */
export type WorkMetadataKind = "type" | "industry" | "year" | "platform" | "status" | "role";

const METADATA_LABEL: Record<WorkMetadataKind, string> = {
  type: "Type",
  industry: "Industry",
  year: "Year",
  platform: "Platform",
  status: "Status",
  role: "Role",
};

const METADATA_ICON: Record<WorkMetadataKind, LucideIcon> = {
  type: LayoutGrid,
  industry: Building2,
  year: Calendar,
  platform: Hexagon,
  status: Zap,
  role: Layers,
};

/** Muted accent tints: visible on `bg-muted/20` without competing with body copy. */
const METADATA_ICON_TONE: Record<WorkMetadataKind, string> = {
  type: "text-sky-600 dark:text-sky-400/95",
  industry: "text-violet-600 dark:text-violet-400/95",
  year: "text-amber-700 dark:text-amber-500/95",
  platform: "text-emerald-700 dark:text-emerald-400/95",
  status: "text-orange-600 dark:text-orange-400/95",
  role: "text-rose-600 dark:text-rose-400/95",
};

export function WorkMetadataGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}

export interface WorkMetadataCardProps {
  kind: WorkMetadataKind;
  children: ReactNode;
  className?: string;
}

export function WorkMetadataCard({ kind, children, className }: WorkMetadataCardProps) {
  const Icon = METADATA_ICON[kind];
  const label = METADATA_LABEL[kind];
  const iconTone = METADATA_ICON_TONE[kind];

  return (
    <div
      className={cn(
        "metadata-card border-border/40 bg-muted/20 flex flex-col gap-2 rounded-lg border p-4",
        className,
      )}
    >
      <div className="metadata-header flex min-h-[1.125rem] items-center gap-2">
        <Icon
          aria-hidden
          className={cn("metadata-icon size-4 shrink-0", iconTone)}
          strokeWidth={1.75}
        />
        <span className="metadata-label text-muted-foreground font-mono text-xs leading-none tracking-widest uppercase">
          {label}
        </span>
      </div>
      <p className="metadata-value font-display text-foreground text-sm leading-snug font-semibold">
        {children}
      </p>
    </div>
  );
}
