"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/*
 * Thin wrapper around Sonner that:
 *   — wires our CSS tokens into Sonner's inline-style slots
 *   — uses theme="system" so Sonner auto-detects prefers-color-scheme
 *     without requiring next-themes ThemeProvider (added in a later issue).
 *   — swaps in Lucide icons for visual consistency with the design system.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[var(--success)]" />,
        info: <InfoIcon className="size-4 text-[var(--info)]" />,
        warning: <TriangleAlertIcon className="size-4 text-[var(--warning)]" />,
        error: <OctagonXIcon className="size-4 text-[var(--destructive)]" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          // All toast types share the same neutral surface so text contrast
          // is always driven by --popover-foreground (~21:1 on --popover).
          // Sonner's built-in colored text fails WCAG AA: success 4.2:1,
          // error 4.35:1, warning 3.05:1 — overriding fixes all three.
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--popover)",
          "--success-text": "var(--popover-foreground)",
          "--success-border": "var(--border)",
          "--error-bg": "var(--popover)",
          "--error-text": "var(--popover-foreground)",
          "--error-border": "var(--border)",
          "--warning-bg": "var(--popover)",
          "--warning-text": "var(--popover-foreground)",
          "--warning-border": "var(--border)",
          "--info-bg": "var(--popover)",
          "--info-text": "var(--popover-foreground)",
          "--info-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          // Override description color with our design token so it always
          // resolves from the .dark class, not from Sonner's prefers-color-scheme
          // detection. Without this, when OS dark ≠ site theme, Sonner injects
          // hsl(0,0%,91%) = near-white on a white --popover background.
          description: "!text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
