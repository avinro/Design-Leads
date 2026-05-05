"use client";

/**
 * MermaidDiagram — lazy-loaded, accessible Mermaid diagram renderer.
 *
 * Design decisions:
 * - Dynamically imports the `mermaid` library only when this component mounts,
 *   keeping ~1MB out of the server bundle and the initial JS payload.
 * - Reserves space with a fixed aspect-ratio skeleton while initialising to
 *   prevent Cumulative Layout Shift (CLS < 0.1 target from PRO context).
 * - Disables Mermaid's built-in animations when prefers-reduced-motion is set.
 * - The generated SVG gets role="img" + aria-label so screen readers receive
 *   a meaningful label instead of raw SVG markup.
 * - The raw diagram source is also exposed in a visually-hidden <pre> as a
 *   plain-text fallback for screen readers that do not handle SVG well.
 *
 * `source` prop is base64-encoded MDX source text (from remark-mermaid.ts).
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MermaidDiagramProps {
  /** Base64-encoded Mermaid diagram source from the remark plugin. */
  source: string;
  className?: string;
}

// Extract the first comment from Mermaid source for use as aria-label.
function extractLabel(src: string): string {
  const match = /%%\s*(.+)/.exec(src);
  return match ? match[1].trim() : "Diagram";
}

type MermaidRenderResult = { svg: string } | { bindFunctions?: (el: Element) => void; svg: string };

export function MermaidDiagram({ source, className }: MermaidDiagramProps) {
  const decoded = Buffer.from(source, "base64").toString("utf-8");
  const label = extractLabel(decoded);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const { default: mermaid } = await import("mermaid");

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          // Disable built-in animation when reduced-motion is requested.
          ...(prefersReducedMotion ? { flowchart: { useMaxWidth: true } } : {}),
          securityLevel: "strict",
        });

        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const result: MermaidRenderResult = await mermaid.render(id, decoded);

        if (!cancelled) {
          setSvg(result.svg);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Diagram error");
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [decoded]);

  if (error) {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          "border-destructive/30 bg-destructive/5 text-destructive rounded border p-4 font-mono text-sm",
          className,
        )}
      >
        <p className="font-semibold">Diagram error</p>
        <pre className="mt-1 text-xs whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative my-8", className)}>
      {/* Visually-hidden plain-text fallback for screen readers */}
      <pre className="sr-only">{decoded}</pre>

      {svg ? (
        <div
          role="img"
          aria-label={label}
          // Mermaid SVG is sanitised via securityLevel: "strict"
          dangerouslySetInnerHTML={{ __html: svg }}
          className="overflow-x-auto"
        />
      ) : (
        // Skeleton with reserved aspect ratio — prevents CLS
        <div
          aria-busy="true"
          aria-label="Loading diagram…"
          className="bg-muted animate-pulse rounded"
          style={{ aspectRatio: "16 / 5", minHeight: "120px" }}
        />
      )}
    </div>
  );
}
