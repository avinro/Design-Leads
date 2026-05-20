import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Container — horizontal layout primitive for portfolio pages.
 *
 * Responsibilities:
 *   - centers its children with mx-auto
 *   - applies a responsive max-width (width variant)
 *   - applies adaptive horizontal gutters that grow with the viewport
 *
 * Width variants follow editorial reading-measure intent:
 *   narrow   ≈ long-form prose                      (max-w-prose)
 *   default  ≈ standard portfolio sections          (max-w-6xl)
 *   wide     ≈ hero blocks, gallery grids           (max-w-7xl)
 *   caseStudy ≈ case study hero + chrome            (max-w-[1420px])
 *   full     ≈ edge-to-edge sections (no max-width)
 *
 * Gutters are not configurable on purpose — they enforce a single
 * inset rhythm across the site, satisfying ui-ux-pro-max
 * `adaptive-gutters-by-breakpoint` and `safe-area-compliance`.
 */
const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    width: {
      narrow: "max-w-prose",
      default: "max-w-6xl",
      wide: "max-w-7xl",
      caseStudy: "max-w-[1420px]",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    width: "default",
  },
});

type ContainerProps = React.ComponentProps<"div"> &
  VariantProps<typeof containerVariants> & {
    asChild?: boolean;
  };

function Container({ className, width = "default", ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      data-width={width}
      className={cn(containerVariants({ width }), className)}
      {...props}
    />
  );
}

export { Container, containerVariants };
export type { ContainerProps };
