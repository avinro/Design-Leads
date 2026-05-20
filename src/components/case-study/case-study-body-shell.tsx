import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CaseStudyBodyShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Full-width horizontal shell for case study pages (hero h1, article grid).
 * Spans the viewport with standard gutters; inner content is capped at 1080px.
 */
export function CaseStudyBodyShell({ children, className }: CaseStudyBodyShellProps) {
  return (
    <div
      data-slot="case-study-body-shell"
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        "lg:w-[min(100vw,1920px)] lg:max-w-[1920px] lg:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
