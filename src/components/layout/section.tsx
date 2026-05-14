import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Section — vertical-rhythm primitive for portfolio pages.
 *
 * Applies semantic vertical padding from the spacing scale defined in
 * src/app/globals.css (--space-hero / --space-section / --space-card).
 * Hero and section tokens use clamp() so spacing scales fluidly with
 * the viewport without media queries.
 *
 * Spacing variants:
 *   hero          full-bleed top sections (64 → 96 px padding-block)
 *   heroInternal  internal page headers — fixed 160px top (accounts for
 *                 the sticky nav height ~56px + intentional breathing room)
 *                 with the same bottom as `hero`. Use on the first section
 *                 of every internal route (about, contact, privacy, work/[slug]).
 *                 Excludes home (custom centering) and /work listing (snap-scroll).
 *   heroInternalCompact
 *                 same internal header rhythm, but with 30% less top padding
 *                 on mobile before returning to heroInternal spacing at md+.
 *   section       default page sections   (48 → 80 px padding-block)
 *   card          compact embedded blocks (24 px padding-block)
 *   none          no vertical padding (consumer controls spacing)
 *
 * Use the `as` prop to render semantic landmarks ("section", "header",
 * "main", "article"). Defaults to "section" so the element is a real
 * landmark for screen readers.
 *
 * className wins over variant styles via cn() so consumers can override
 * any default without copying the variant logic.
 */
const sectionVariants = cva("", {
  variants: {
    spacing: {
      hero: "py-(--space-hero)",
      heroInternal: "pt-[7rem] pb-(--space-hero)",
      heroInternalCompact: "pt-[7rem] pb-(--space-hero) md:pt-[10rem]",
      section: "py-(--space-section)",
      card: "py-(--space-card)",
      none: "",
    },
  },
  defaultVariants: {
    spacing: "section",
  },
});

type SectionElement = "section" | "header" | "main" | "article" | "div";

type SectionProps = Omit<React.HTMLAttributes<HTMLElement>, "as"> &
  VariantProps<typeof sectionVariants> & {
    as?: SectionElement;
  };

function Section({ className, spacing = "section", as: Tag = "section", ...props }: SectionProps) {
  /*
   * Cast Tag to a generic element-creator so TypeScript stops trying
   * to widen the ref type to a single concrete HTMLElement subclass.
   * This mirrors how shadcn/radix-ui slot patterns sidestep the same
   * polymorphism limitation without pulling in an external as-prop lib.
   */
  const Component = Tag as React.ElementType;
  return (
    <Component
      data-slot="section"
      data-spacing={spacing}
      className={cn(sectionVariants({ spacing }), className)}
      {...props}
    />
  );
}

export { Section, sectionVariants };
export type { SectionProps, SectionElement };
