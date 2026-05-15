import { cn } from "@/lib/utils";

/** Shared motion tokens for underline micro-interactions (150–300ms band). */
export const SITE_LINK_UNDERLINE_MOTION =
  "transition-transform duration-200 ease-out motion-reduce:transition-none";

export const SITE_LINK_COLOR_MOTION =
  "transition-colors duration-200 ease-out motion-reduce:transition-none";

/**
 * Absolute underline bar (child of a `relative` + `group` link).
 * `reveal`: hidden until hover or when `active`.
 * `proseAccent`: always full width; line opacity reinforces on hover (MDX body links).
 */
export function siteUnderlineBarClassName(opts: {
  active: boolean;
  mode: "reveal" | "proseAccent";
}): string {
  const base = cn(
    "pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left",
    opts.mode === "proseAccent"
      ? cn(
          "scale-x-100 bg-current opacity-60 motion-reduce:transition-none",
          "transition-[opacity,transform] duration-200 ease-out group-hover:opacity-100",
        )
      : cn(
          "bg-current",
          SITE_LINK_UNDERLINE_MOTION,
          opts.active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        ),
  );
  return base;
}
