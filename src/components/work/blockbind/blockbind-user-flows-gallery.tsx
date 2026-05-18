"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { renderAllUserFlowConnectors } from "./blockbind-user-flow-connectors";
import { blockbindUserFlowDiagrams } from "./blockbind-user-flow-diagrams";
import styles from "./blockbind-user-flows.module.css";

const FLOWS = [
  { num: "01", title: "Onboarding & Auth", id: "f1", wide: true },
  { num: "02", title: "Home / Wallet Dashboard", id: "f2", wide: false },
  { num: "03", title: "Main Navigation", id: "f3", wide: false },
  { num: "04", title: "Receive Flow", id: "f4", wide: true },
  { num: "05", title: "Buy Flow", id: "f5", wide: true },
  { num: "06", title: "Send Flow", id: "f6", wide: true },
  { num: "07", title: "Swap Flow", id: "f7", wide: true },
  { num: "08", title: "NFTs / Tokens Flow", id: "f8", wide: false },
  { num: "09", title: "Activity Flow", id: "f9", wide: false },
  { num: "10", title: "Settings Flow", id: "f10", wide: true },
  { num: "11", title: "Global Fallback States", id: "f11", wide: true },
] as const;

/** Embla scroll easing factor — default is 25; higher yields a slower slide change (not literal ms). */
const EMBLA_SCROLL_DURATION = 25;

/** CSS height transition for the viewport (ms). */
const VIEWPORT_HEIGHT_MS = 420;

function scheduleConnectorPaint(root: HTMLElement | null, portalRoot: HTMLElement | null) {
  const paint = () => {
    if (root) renderAllUserFlowConnectors(root);
    if (portalRoot) renderAllUserFlowConnectors(portalRoot);
  };
  paint();
  requestAnimationFrame(paint);
  setTimeout(paint, 100);
  setTimeout(paint, 400);
}

/**
 * BlockBind — interactive user-flow carousel (JS + SVG connectors) with fullscreen dialog.
 */
export function BlockbindUserFlowsGallery() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    duration: EMBLA_SCROLL_DURATION,
  });
  const [index, setIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSlide, setDialogSlide] = useState<number | null>(null);

  const [viewportHeightPx, setViewportHeightPx] = useState<number | null>(null);
  const [viewportHeightTransition, setViewportHeightTransition] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const portalRootRef = useRef<HTMLDivElement | null>(null);
  const emblaViewportRef = useRef<HTMLDivElement | null>(null);
  const slideHeightsRef = useRef<number[]>([]);

  const refreshConnectors = useCallback(() => {
    scheduleConnectorPaint(wrapRef.current, portalRootRef.current);
  }, []);

  const setEmblaViewportNode = useCallback(
    (node: HTMLDivElement | null) => {
      emblaViewportRef.current = node;
      emblaRef(node);
    },
    [emblaRef],
  );

  const measureActiveSlideHeightPx = useCallback(() => {
    const api = emblaApi;
    if (!api) return null;
    const slides = api.slideNodes();
    if (!slides.length) return null;
    const i = api.selectedScrollSnap();
    const slideEl = slides[i] as HTMLElement | undefined;
    if (!slideEl) return null;

    const inFs = dialogOpen && dialogSlide === i;
    const natural = slideEl.offsetHeight;
    const h = inFs ? Math.max(slideHeightsRef.current[i] ?? 0, natural) : natural;

    if (!inFs && h > 0) {
      slideHeightsRef.current[i] = h;
    }

    return Math.max(1, Math.ceil(h));
  }, [emblaApi, dialogOpen, dialogSlide]);

  const applyViewportHeightFromMeasure = useCallback(() => {
    const next = measureActiveSlideHeightPx();
    if (next === null) return;
    setViewportHeightPx((prev) => (prev === next ? prev : next));
  }, [measureActiveSlideHeightPx]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setViewportHeightTransition(true);
    });
    return () => {
      cancelAnimationFrame(id);
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => {
      requestAnimationFrame(() => {
        applyViewportHeightFromMeasure();
        refreshConnectors();
      });
    };
    const onSelect = () => {
      setIndex(emblaApi.selectedScrollSnap());
      sync();
    };
    const onSettle = () => {
      sync();
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("settle", onSettle);
    onSelect();
    onSettle();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi, applyViewportHeightFromMeasure, refreshConnectors]);

  useLayoutEffect(() => {
    refreshConnectors();
    const root = wrapRef.current;
    const portal = portalRootRef.current;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (wrapRef.current) renderAllUserFlowConnectors(wrapRef.current);
        if (portalRootRef.current) renderAllUserFlowConnectors(portalRootRef.current);
        applyViewportHeightFromMeasure();
      });
    });
    if (root) ro.observe(root);
    if (portal) ro.observe(portal);
    window.addEventListener("resize", refreshConnectors);
    window.addEventListener("resize", applyViewportHeightFromMeasure);
    requestAnimationFrame(() => {
      applyViewportHeightFromMeasure();
    });
    const postPaintT1 = window.setTimeout(() => {
      applyViewportHeightFromMeasure();
    }, 110);
    const postPaintT2 = window.setTimeout(() => {
      applyViewportHeightFromMeasure();
    }, 410);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", refreshConnectors);
      window.removeEventListener("resize", applyViewportHeightFromMeasure);
      window.clearTimeout(postPaintT1);
      window.clearTimeout(postPaintT2);
    };
  }, [refreshConnectors, applyViewportHeightFromMeasure, dialogOpen, dialogSlide, index]);

  useEffect(() => {
    const vp = emblaViewportRef.current;
    if (!vp || viewportHeightPx === null) return;

    const onTransitionEnd = (ev: TransitionEvent) => {
      if (ev.target !== vp || ev.propertyName !== "height") return;
      refreshConnectors();
    };

    vp.addEventListener("transitionend", onTransitionEnd);
    const fallback = window.setTimeout(() => {
      refreshConnectors();
    }, VIEWPORT_HEIGHT_MS + 80);

    return () => {
      vp.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(fallback);
    };
  }, [viewportHeightPx, refreshConnectors]);

  const openDialog = (i: number) => {
    const api = emblaApi;
    if (api) {
      const slide = api.slideNodes()[i] as HTMLElement | undefined;
      if (slide) {
        slideHeightsRef.current[i] = Math.ceil(slide.offsetHeight);
      }
    }
    setDialogSlide(i);
    setDialogOpen(true);
  };

  const flowCount = FLOWS.length;

  return (
    <figure className="my-8 w-full min-w-0" data-slot="blockbind-user-flows">
      <div
        ref={wrapRef}
        className={cn(
          styles.root,
          "border-border/50 bg-muted/20 w-full min-w-0 rounded-xl border p-2 sm:p-3",
        )}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            Flow {String(index + 1).padStart(2, "0")} / {String(flowCount).padStart(2, "0")}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="border-border/60 bg-background/80 text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40"
              onClick={() => {
                emblaApi?.scrollPrev();
              }}
              disabled={!emblaApi?.canScrollPrev()}
              aria-label="Previous flow"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              className="border-border/60 bg-background/80 text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40"
              onClick={() => {
                emblaApi?.scrollNext();
              }}
              disabled={!emblaApi?.canScrollNext()}
              aria-label="Next flow"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div
          ref={setEmblaViewportNode}
          className={cn(
            "border-border/40 bg-background/60 overflow-hidden rounded-lg border",
            viewportHeightTransition &&
              "motion-safe:transition-[height] motion-safe:duration-[420ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          )}
          style={
            viewportHeightPx !== null ? { height: `${String(viewportHeightPx)}px` } : undefined
          }
        >
          {/* items-start: each slide keeps its intrinsic height; default stretch would equalize all slides to the tallest diagram and break per-slide height measurement. */}
          <div className="flex touch-pan-y items-start">
            {FLOWS.map((flow, i) => {
              const inFullscreen = dialogOpen && dialogSlide === i;
              return (
                <div
                  key={flow.id}
                  className="w-full min-w-0 shrink-0 grow-0 basis-full self-start px-0.5 sm:px-1"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${flow.num} ${flow.title}`}
                  aria-hidden={inFullscreen}
                >
                  <div className="border-border/30 mb-3 flex flex-wrap items-baseline gap-2 border-b py-1">
                    <span className="text-muted-foreground font-mono text-[11px] tracking-[0.12em]">
                      {flow.num}
                    </span>
                    <h3 className="font-display text-foreground text-lg font-semibold tracking-tight sm:text-xl">
                      {flow.title}
                    </h3>
                    <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase sm:ml-auto">
                      #{flow.id}
                      {flow.wide ? " · wide" : ""}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="group border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50 focus-visible:ring-ring relative mb-[12px] h-auto min-h-0 w-full max-w-full cursor-zoom-in rounded-lg border text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    onClick={() => {
                      openDialog(i);
                    }}
                    aria-label={`Open ${flow.title} fullscreen`}
                  >
                    <span className="text-muted-foreground group-hover:text-foreground bg-background/90 pointer-events-none absolute top-1 right-1 z-10 inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 font-mono text-[10px] tracking-wide uppercase shadow-sm">
                      <Expand className="h-3 w-3" aria-hidden />
                      Fullscreen
                    </span>
                    <div
                      data-blockbind-flow-host
                      className={cn(
                        "flex w-full min-w-0 justify-center overflow-x-auto py-1.5 sm:py-2",
                        flow.wide ? "px-0 sm:px-0.5" : "px-0.5",
                      )}
                    >
                      {!inFullscreen ? blockbindUserFlowDiagrams[i] : null}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <DialogPrimitive.Root
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setDialogSlide(null);
            requestAnimationFrame(() => {
              applyViewportHeightFromMeasure();
            });
          }
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className={cn(
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm",
            )}
          />
          <DialogPrimitive.Content
            className={cn(
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-background fixed inset-0 z-[61] flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col border-0 p-0 shadow-none duration-200 outline-none sm:rounded-none",
            )}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <DialogPrimitive.Title className="sr-only">
              {dialogSlide !== null
                ? `${FLOWS[dialogSlide].title} (${FLOWS[dialogSlide].id})`
                : "User flow"}
            </DialogPrimitive.Title>
            <div className="border-border/40 flex items-center justify-between gap-3 border-b px-2 py-1.5 sm:px-3">
              <div className="min-w-0">
                {dialogSlide !== null ? (
                  <>
                    <p className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
                      {FLOWS[dialogSlide].num} · {FLOWS[dialogSlide].id}
                    </p>
                    <p className="font-display text-foreground truncate text-lg font-semibold sm:text-xl">
                      {FLOWS[dialogSlide].title}
                    </p>
                  </>
                ) : null}
              </div>
              <DialogPrimitive.Close
                type="button"
                className="border-border/60 bg-muted/60 text-foreground hover:bg-muted focus-visible:ring-ring inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                aria-label="Close fullscreen"
              >
                <X className="h-4 w-4" aria-hidden />
                Close
              </DialogPrimitive.Close>
            </div>
            <div
              ref={portalRootRef}
              className={cn(styles.root, "min-h-0 flex-1 overflow-auto px-2 py-3 sm:px-4")}
            >
              {dialogOpen && dialogSlide !== null ? blockbindUserFlowDiagrams[dialogSlide] : null}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </figure>
  );
}
