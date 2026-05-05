import Link from "next/link";

import { cn } from "@/lib/utils";
import type { WorkCase } from "@/lib/content/home";

/*
 * WorkCard — editorial numbered row for the Selected Work section.
 *
 * Design intent (PRO-13 visual refinement):
 *   Layout:
 *     [01]  Title                            tags · as · text  →
 *           Summary line
 *           ▬▬▬▬▬▬▬▬▬▬  gradient swatch bar (1.5px, full-width)
 *
 *   The gradient swatch replaces the 16:9 thumbnail card. It is purely
 *   decorative (aria-hidden) — a thin color accent that identifies the
 *   project visually without needing real photography.
 *
 *   Hover: the entire row and arrow translate-x slightly; the number
 *   stays anchored. This is a CSS-only micro-interaction (no JS).
 *
 * Accessibility:
 *   - data-slot="work-card" for test targeting.
 *   - The entire row is a single Link — one focus stop per project.
 *   - Gradient swatch carries aria-hidden="true".
 *   - min-h-[44px] on the title row satisfies the >=44px touch target rule
 *     from ui-ux-pro-max §2, even after the card thumbnail is removed.
 */

interface WorkCardProps {
  case_: WorkCase;
  /** Display index for the editorial number (1-based) */
  index: number;
  className?: string;
}

export function WorkCard({ case_, index, className }: WorkCardProps) {
  const num = String(index).padStart(2, "0");
  const tagLine = case_.tags.join(" · ");

  return (
    <Link
      href={`/work/${case_.slug}`}
      data-slot="work-card"
      className={cn(
        "group border-border/40 first:border-border/40 hover:border-border/80 focus-visible:ring-ring flex flex-col gap-4 border-b py-8 transition-colors duration-200 first:border-t focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      {/* Top row: number — title — tags — arrow */}
      <div className="flex items-start gap-5 sm:gap-8">
        {/* Index number — stays fixed while content translates */}
        <span className="text-muted-foreground shrink-0 font-mono text-base tabular-nums sm:text-lg">
          {num}
        </span>

        {/* Title + tags + arrow — translates right on hover */}
        <div className="flex min-h-[44px] flex-1 flex-col justify-center gap-1 transition-transform duration-200 group-hover:translate-x-1 sm:flex-row sm:items-center sm:gap-0">
          <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            {case_.title}
          </h3>

          {/* Tags — pushed to the right on desktop */}
          <span className="text-muted-foreground text-sm sm:mr-6 sm:ml-auto">{tagLine}</span>
        </div>

        {/* Arrow — amplifies the translate on hover */}
        <span
          aria-hidden="true"
          className="text-muted-foreground mt-1 shrink-0 transition-transform duration-200 group-hover:translate-x-2"
        >
          →
        </span>
      </div>

      {/* Summary */}
      <p className="text-muted-foreground pl-0 text-sm leading-relaxed sm:pl-[calc(1rem+2rem)]">
        {case_.summary}
      </p>

      {/* Gradient swatch — decorative color bar replacing the thumbnail */}
      <div
        aria-hidden="true"
        className={cn(
          "h-[3px] w-full rounded-full bg-gradient-to-r opacity-70 transition-opacity duration-200 group-hover:opacity-100",
          case_.gradient,
        )}
      />
    </Link>
  );
}
