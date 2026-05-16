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
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/events";
import { loadCalendlyScript } from "@/lib/calendly/load";

/** Specific 30-min event for inline embed (Calendly requires event type, not profile URL). */
const CALENDLY_PAGE_URL = "https://calendly.com/avinroart/30min";

/**
 * Inline embed URL with appearance + UX params (hex without #).
 * Hides event type dropdown and GDPR banner for cleaner inline experience.
 */
function calendlyInlineEmbedUrl(): string {
  const q = new URLSearchParams({
    background_color: "ffffff",
    text_color: "18181b",
    primary_color: "2563eb",
    hide_event_type_details: "1",
    hide_gdpr_banner: "1",
  });
  return `${CALENDLY_PAGE_URL}?${q}`;
}

const LOADING_HINT_DELAY_MS = 8_000;
/**
 * Max time to wait for Calendly to signal ready after initInlineWidget().
 * If no signal arrives in this window, we transition to "failed".
 */
const IFRAME_READY_TIMEOUT_MS = 15_000;

// Omit removes MessageEvent.data (typed as `any`) so our override wins.
type CalendlyMessageEvent = Omit<MessageEvent, "data"> & { data: { event: string } };

/**
 * Type predicate — narrows MessageEvent to one that carries a Calendly event string.
 * Reads e.data through `unknown` to satisfy strict no-unsafe-member-access rules.
 */
function isCalendlyEvent(e: MessageEvent): e is CalendlyMessageEvent {
  if (e.origin !== "https://calendly.com") return false;
  const data: unknown = e.data;
  if (typeof data !== "object" || data === null || !("event" in data)) return false;
  // Use Record<string, unknown> — broader than TS's automatic narrowing — to access .event.
  const record = data as Record<string, unknown>;
  return typeof record.event === "string" && record.event.startsWith("calendly.");
}

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
  // Detection strategy (in order of priority):
  //   1. postMessage "calendly.event_type_viewed" — fired when the widget finishes rendering
  //   2. MutationObserver + iframe "load" event — fallback if postMessage is blocked
  //   3. IFRAME_READY_TIMEOUT_MS hard cutoff — prevents infinite loading state
  useEffect(() => {
    if (!open) return;

    // Capture at effect time so the cleanup closure uses the same node reference.
    const container = containerRef.current;

    let cancelled = false;
    let ready = false;
    let iframeReadyTimer: ReturnType<typeof setTimeout> | null = null;
    let observer: MutationObserver | null = null;

    const hintTimer = setTimeout(() => {
      if (!cancelled) setShowHint(true);
    }, LOADING_HINT_DELAY_MS);

    function cleanup() {
      if (iframeReadyTimer) clearTimeout(iframeReadyTimer);
      window.removeEventListener("message", onMessage);
      observer?.disconnect();
    }

    function markReady() {
      if (ready || cancelled) return;
      ready = true;
      cleanup();
      setStatus("loaded");
    }

    function onMessage(e: MessageEvent) {
      if (!isCalendlyEvent(e)) return;
      // event_type_viewed fires when the booking calendar is fully rendered.
      // profile_page_viewed is the equivalent on profile-level embeds.
      const { event } = e.data;
      if (event === "calendly.event_type_viewed" || event === "calendly.profile_page_viewed") {
        markReady();
      }
    }

    loadCalendlyScript()
      .then(() => {
        if (cancelled) return;
        clearTimeout(hintTimer);

        // Wait for the sheet's open animation (duration-300) so Calendly measures
        // the container at its final layout dimensions.
        setTimeout(() => {
          if (cancelled) return;
          const el = containerRef.current;
          if (!el || !window.Calendly) {
            setStatus("failed");
            return;
          }

          window.Calendly.initInlineWidget({
            url: calendlyInlineEmbedUrl(),
            parentElement: el,
          });

          // Hard cutoff: if no ready signal arrives within IFRAME_READY_TIMEOUT_MS,
          // transition to failed so the user is never stuck on an infinite loader.
          iframeReadyTimer = setTimeout(() => {
            if (!cancelled && !ready) {
              cleanup();
              setStatus("failed");
            }
          }, IFRAME_READY_TIMEOUT_MS);

          // Primary detection: Calendly fires postMessage when booking UI renders.
          window.addEventListener("message", onMessage);

          // Secondary detection: observe the container for the iframe Calendly injects,
          // then wait for that iframe's own load event + 800 ms for React to paint.
          observer = new MutationObserver(() => {
            const iframe = el.querySelector<HTMLIFrameElement>("iframe");
            if (!iframe || iframe.dataset.monitored) return;
            iframe.dataset.monitored = "1";
            iframe.addEventListener(
              "load",
              () => {
                setTimeout(markReady, 800);
              },
              { once: true },
            );
          });
          observer.observe(el, { childList: true, subtree: true });
        }, 350);
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
      cleanup();
      if (container) container.innerHTML = "";
    };
  }, [open]);

  const isVisible = status === "loaded";
  const isFailed = status === "failed";
  const isLoading = status === "idle" || status === "loading";

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
        <span
          id="calendly-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {isLoading && "Loading scheduling widget"}
          {isVisible && "Scheduling widget ready"}
          {isFailed && "Couldn't load the scheduler — use the alternatives below"}
        </span>

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
        <div
          className="border-border bg-card relative mx-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border"
          aria-busy={isLoading}
          aria-describedby="calendly-status"
        >
          {/* Calendly widget container — always in DOM so the iframe persists.
              Fades in only after the widget signals it has fully rendered. */}
          <div
            ref={containerRef}
            className={cn(
              "bg-card min-h-[360px] w-full flex-1 transition-opacity duration-500 motion-reduce:transition-none",
              isVisible ? "opacity-100" : "opacity-0",
            )}
            style={{ minWidth: 320 }}
            aria-label="Calendly scheduler"
            aria-hidden={!isVisible}
          />

          {/* Loading skeleton — calendar-shaped so users know what's coming.
              Fades out when Calendly signals ready or when an error is shown. */}
          <div
            aria-hidden="true"
            className={cn(
              "bg-background absolute inset-0 flex flex-col overflow-hidden rounded-xl transition-opacity duration-500 motion-reduce:transition-none",
              isLoading ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <div className="flex flex-1 flex-col gap-3 p-5">
              {/* Month navigation */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28 rounded" />
                <div className="flex gap-2">
                  <Skeleton className="size-7 rounded-full" />
                  <Skeleton className="size-7 rounded-full" />
                </div>
              </div>

              {/* Day-of-week labels */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full rounded-sm" />
                ))}
              </div>

              {/* Date grid — rounded-full mimics Calendly's circular day buttons.
                  Weekend columns (0, 6 mod 7) are dimmed to suggest disabled dates. */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={cn(
                      "h-8 w-full rounded-full",
                      i % 7 === 0 || i % 7 === 6 ? "opacity-25" : "",
                    )}
                  />
                ))}
              </div>

              {/* Timezone hint row */}
              <div className="flex items-center justify-center gap-2">
                <Skeleton className="size-3 rounded-full" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>

            {/* Status text — lives below the calendar area */}
            <div className="pb-5 text-center">
              {showHint ? (
                <p className="text-muted-foreground text-xs">
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
              ) : (
                <p className="text-muted-foreground text-sm">Loading your scheduler…</p>
              )}
            </div>
          </div>

          {/* Failed state — fades in when load detection times out or errors. */}
          <div
            className={cn(
              "bg-background absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl px-6 text-center transition-opacity duration-300 motion-reduce:transition-none",
              isFailed ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
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
