"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, ExternalLink } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { track } from "@/lib/analytics/events";
import { loadCalendlyScript } from "@/lib/calendly/load";

/** Public booking page (no embed styling params). */
const CALENDLY_PAGE_URL = "https://calendly.com/avinroart";

/**
 * Inline embed URL with Calendly appearance params (hex without #).
 * Keeps the iframe interior aligned with the light sheet + bg-card chrome.
 */
function calendlyInlineEmbedUrl(): string {
  const q = new URLSearchParams({
    background_color: "ffffff",
    text_color: "18181b",
    primary_color: "2563eb",
  });
  return `${CALENDLY_PAGE_URL}?${q}`;
}
const LOADING_HINT_DELAY_MS = 8_000;

type Status = "idle" | "loading" | "loaded" | "failed";

interface CalendlyModalProps {
  children: React.ReactNode;
  ctaPosition?: string;
}

export function CalendlyModal({ children, ctaPosition = "unknown" }: CalendlyModalProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [showHint, setShowHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      track({ name: "calendly_modal_open", props: { position: ctaPosition } });
      setStatus("loading");
      setShowHint(false);
    } else {
      setStatus("idle");
      setShowHint(false);
    }
    setOpen(next);
  };

  // Kick off Calendly init whenever the sheet opens.
  // The cleanup function cancels any pending state updates if the sheet closes
  // before the script finishes loading.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const host = containerRef.current;

    const hintTimer = setTimeout(() => {
      if (!cancelled) setShowHint(true);
    }, LOADING_HINT_DELAY_MS);

    loadCalendlyScript()
      .then(() => {
        if (cancelled) return;
        clearTimeout(hintTimer);

        const el = host;
        if (el && window.Calendly) {
          window.Calendly.initInlineWidget({
            url: calendlyInlineEmbedUrl(),
            parentElement: el,
          });
          setStatus("loaded");
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(hintTimer);
          setStatus("failed");
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(hintTimer);
      // Clear the Calendly iframe so the next open starts with a clean container.
      // Radix unmounts SheetContent after close animation, but clearing here is
      // defensive in case forceMount is ever added.
      if (host) host.innerHTML = "";
    };
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {/*
       * data-cta="lets-talk" is forwarded to the child button via Radix Slot,
       * enabling intent-based preloading from CalendlyPrefetch.
       */}
      <SheetTrigger asChild data-cta="lets-talk">
        {children}
      </SheetTrigger>

      <SheetContent>
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div
          className="shrink-0 px-6 pb-6"
          style={{ paddingTop: "max(env(safe-area-inset-top), 1.5rem)" }}
        >
          <SheetHeader className="mt-8 gap-1">
            <SheetTitle>Have a project in mind?</SheetTitle>
            <p className="font-display text-muted-foreground/70 text-3xl font-semibold tracking-tight">
              Let&apos;s build it.
            </p>
          </SheetHeader>
          <SheetDescription className="mt-3">
            A 30-minute intro call — pick a time that works for you.
          </SheetDescription>
        </div>

        {/* ── Calendly region ────────────────────────────────────────── */}
        <div className="border-border bg-card relative mx-4 min-h-0 flex-1 overflow-hidden rounded-xl border">
          {/* Container that Calendly injects its iframe into */}
          <div
            ref={containerRef}
            className="bg-card h-full w-full"
            aria-label="Calendly scheduler"
            aria-hidden={status !== "loaded"}
          />

          {/* Loading state */}
          {(status === "idle" || status === "loading") && (
            <div className="bg-background absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-6 w-1/2 rounded" />
              <p className="text-muted-foreground mt-2 text-sm">Loading your scheduler…</p>
              {showHint && (
                <p className="text-muted-foreground text-center text-xs">
                  Still loading.{" "}
                  <a
                    href={CALENDLY_PAGE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground focus-ring rounded-sm underline underline-offset-2 hover:no-underline"
                  >
                    Open Calendly in a new tab
                  </a>
                </p>
              )}
            </div>
          )}

          {/* Failed state */}
          {status === "failed" && (
            <div className="bg-background absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-foreground text-base font-semibold">
                Couldn&apos;t load the scheduler
              </p>
              <p className="text-muted-foreground max-w-[260px] text-sm">
                This happens sometimes. You can open it directly or send an email instead.
              </p>
              <div className="flex w-full max-w-[260px] flex-col gap-2">
                <Button asChild size="sm">
                  <a href={CALENDLY_PAGE_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    Open Calendly
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:avinroart@gmail.com?subject=Project%20inquiry">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Email instead
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div
          className="shrink-0 px-6 pt-5"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)" }}
        >
          <p className="text-muted-foreground text-sm">
            Prefer email?{" "}
            <a
              href="mailto:avinroart@gmail.com"
              className="focus-ring text-foreground inline-flex items-center gap-1 rounded-sm underline-offset-2 hover:underline"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              avinroart@gmail.com
            </a>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
