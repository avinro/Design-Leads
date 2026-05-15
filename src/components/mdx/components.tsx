/**
 * MDX component map for case study pages.
 *
 * Maps HTML element names to styled React components so the MDX body renders
 * with the site's design tokens and mobile-first layout. All components are
 * server-compatible (no hooks, no 'use client') except MermaidDiagram, which
 * is injected here so next-mdx-remote can resolve the JSX element produced by
 * the remark-mermaid plugin.
 *
 * Heading hierarchy contract:
 *   h1 — NOT mapped here; the page template owns h1 (frontmatter title).
 *        If an author accidentally uses # in MDX, they get an unstyled <h1>
 *        which visually signals the mistake without breaking the build.
 *   h2 — section headings (## in MDX)
 *   h3 — sub-section headings (### in MDX)
 *
 * Named editorial primitives (also exported for use in page templates):
 *   Figure      — image or placeholder frame with optional caption
 *   Stats       — responsive grid of large display stat blocks
 *   BeforeAfter — two-up before/after comparison card
 *   Bar         — single horizontal proportion bar
 */

import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";
import { MdxInternalBodyLink } from "./mdx-internal-body-link";
import { MermaidDiagram } from "./mermaid-diagram";
import {
  FlowChain,
  FlowItem,
  FlowSplit,
  FlowColumn,
  StateGrid,
  StateItem,
  PrincipleGrid,
  PrincipleItem,
  BranchTree,
  Branch,
} from "./flow-primitives";

// ---------------------------------------------------------------------------
// Heading components
// ---------------------------------------------------------------------------

function H2({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn(
        // scroll-mt-24 offsets the sticky nav so anchor links land in view.
        "font-display mt-12 mb-4 scroll-mt-24 text-2xl font-semibold tracking-tight sm:text-3xl",
        className,
      )}
      {...props}
    />
  );
}

function H3({ className, ...props }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn(
        // scroll-mt-24 offsets the sticky nav so anchor links land in view.
        "font-display mt-8 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight sm:text-2xl",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Body text
// ---------------------------------------------------------------------------

function P({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn(
        // Paragraphs fill the full content column width and wrap naturally.
        "text-foreground/90 mb-5 text-base leading-relaxed sm:text-lg lg:leading-loose",
        className,
      )}
      {...props}
    />
  );
}

function Blockquote({ className, ...props }: ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      className={cn(
        "border-accent/60 text-muted-foreground my-6 border-l-4 pl-5 text-lg italic",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

function Ul({ className, ...props }: ComponentPropsWithoutRef<"ul">) {
  return (
    <ul
      className={cn(
        "text-foreground/90 mb-5 ml-5 list-disc space-y-1.5 text-base sm:text-lg",
        className,
      )}
      {...props}
    />
  );
}

function Ol({ className, ...props }: ComponentPropsWithoutRef<"ol">) {
  return (
    <ol
      className={cn(
        "text-foreground/90 mb-5 ml-5 list-decimal space-y-1.5 text-base sm:text-lg",
        className,
      )}
      {...props}
    />
  );
}

function Li({ className, ...props }: ComponentPropsWithoutRef<"li">) {
  return <li className={cn("leading-relaxed", className)} {...props} />;
}

// ---------------------------------------------------------------------------
// Links — internal use next/link; external links get rel="noreferrer"
// ---------------------------------------------------------------------------

function A({ href = "", className, children, ...props }: ComponentPropsWithoutRef<"a">) {
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(
          "text-accent decoration-accent/40 hover:decoration-accent focus-visible:ring-ring rounded-sm underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <MdxInternalBodyLink href={href} className={className} {...props}>
      {children}
    </MdxInternalBodyLink>
  );
}

// ---------------------------------------------------------------------------
// Inline code and code blocks
// ---------------------------------------------------------------------------

function Code({ className, ...props }: ComponentPropsWithoutRef<"code">) {
  // rehype-pretty-code adds data-language to <code> inside <pre>.
  // Inline <code> (no parent <pre>) gets the muted pill style.
  return (
    <code
      className={cn(
        "bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]",
        className,
      )}
      {...props}
    />
  );
}

function Pre({ className, ...props }: ComponentPropsWithoutRef<"pre">) {
  return (
    <pre
      className={cn(
        "border-border/40 my-6 overflow-x-auto rounded-lg border p-4 text-sm leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Table — wrapped in a scrollable container for mobile
// ---------------------------------------------------------------------------

function Table({ className, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="my-6 w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

function Th({ className, ...props }: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      className={cn(
        "border-border bg-muted/50 border px-4 py-2.5 text-left font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function Td({ className, ...props }: ComponentPropsWithoutRef<"td">) {
  return (
    <td
      className={cn("border-border border px-4 py-2.5 leading-relaxed tabular-nums", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Images — proxied through next/image for optimisation
// ---------------------------------------------------------------------------

function Img({ src, alt = "", width, height }: ComponentPropsWithoutRef<"img">) {
  // Only render via next/image when src is a plain string path.
  // Blob src values are not supported by next/image and should not appear in MDX.
  if (typeof src !== "string" || !src) return null;

  return (
    <span className="my-6 block">
      <Image
        src={src}
        alt={alt}
        width={typeof width === "string" ? parseInt(width, 10) : (width ?? 1200)}
        height={typeof height === "string" ? parseInt(height, 10) : (height ?? 630)}
        className="rounded-lg"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 800px"
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Horizontal rule
// ---------------------------------------------------------------------------

function Hr({ className, ...props }: ComponentPropsWithoutRef<"hr">) {
  return <hr className={cn("border-border/40 my-10", className)} {...props} />;
}

// ---------------------------------------------------------------------------
// Figure — real image (next/image) or designed placeholder when src is absent
// ---------------------------------------------------------------------------

interface FigureProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  placeholderLabel?: string;
  priority?: boolean;
  className?: string;
}

export function Figure({
  src,
  alt = "",
  width = 1600,
  height = 900,
  caption,
  placeholderLabel,
  priority = false,
  className,
}: FigureProps) {
  return (
    <figure className={cn("my-8", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1024px"
          className="w-full rounded-xl object-cover"
        />
      ) : (
        // Placeholder frame — rendered when no src is available yet.
        // Maintains aspect ratio so the layout doesn't collapse.
        <div
          className="bg-muted/60 border-border/40 flex aspect-video w-full items-center justify-center rounded-xl border border-dashed"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground/40"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            {placeholderLabel && (
              <span className="text-muted-foreground/50 font-mono text-xs tracking-wide uppercase">
                {placeholderLabel}
              </span>
            )}
          </div>
        </div>
      )}
      {caption && (
        <figcaption className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Stats — responsive grid of large display stat blocks
//
// Usage:
//   <Stats data={[
//     { value: "214", label: "Components audited" },
//     { delta: { from: "2 days", to: "4 hours" }, label: "QA time", sentiment: "positive" },
//   ]} />
//
// Each item must have either `value` or `delta`.
// ---------------------------------------------------------------------------

export interface StatItem {
  value?: string;
  label: string;
  sublabel?: string;
  delta?: { from: string; to: string };
  sentiment?: "positive" | "neutral" | "negative";
}

interface StatsProps {
  data?: StatItem[];
  className?: string;
}

export function Stats({ data, className }: StatsProps) {
  // Guard: data can be undefined when Stats is called from MDX without props.
  if (!data?.length) return null;

  return (
    <dl
      className={cn(
        "border-border/40 my-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {data.map((item, i) => (
        <div
          key={i}
          className="bg-muted/30 hover:bg-muted/50 flex flex-col justify-between gap-1 px-5 py-5 transition-colors sm:px-6"
        >
          {item.delta ? (
            <dd className="flex items-baseline gap-1.5">
              {/*
               * delta.from: text-muted-foreground (no opacity) — muted-foreground/60
               * failed WCAG AA contrast on bg-muted/30 at this font size.
               */}
              <span className="font-display text-muted-foreground text-xl font-semibold tabular-nums sm:text-2xl">
                {item.delta.from}
              </span>
              <span className="text-muted-foreground/40 text-sm" aria-hidden="true">
                →
              </span>
              <span
                className={cn(
                  "font-display text-xl font-semibold tabular-nums sm:text-2xl",
                  // emerald-600 (not 500) provides sufficient contrast on bg-muted/30
                  item.sentiment === "positive" && "text-emerald-600 dark:text-emerald-400",
                  item.sentiment === "negative" && "text-destructive",
                  (!item.sentiment || item.sentiment === "neutral") && "text-foreground",
                )}
              >
                {item.delta.to}
              </span>
            </dd>
          ) : (
            <dd
              className={cn(
                "font-display text-3xl font-semibold tabular-nums sm:text-4xl",
                // emerald-600 (not 500) — emerald-500 failed WCAG AA on bg-muted/30
                item.sentiment === "positive" && "text-emerald-600 dark:text-emerald-400",
                item.sentiment === "negative" && "text-destructive",
                (!item.sentiment || item.sentiment === "neutral") && "text-foreground",
              )}
            >
              {item.value}
            </dd>
          )}
          <dt className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            {item.label}
          </dt>
          {item.sublabel && (
            // text-muted-foreground (no opacity) — muted-foreground/60 failed WCAG AA
            // at text-xs on bg-muted/30.
            <span className="text-muted-foreground text-xs leading-snug">{item.sublabel}</span>
          )}
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------
// BeforeAfter — two-up comparison with semantic sentiment colouring
//
// Usage:
//   <BeforeAfter
//     label="Design QA time per sprint"
//     from="2 days"
//     to="4 hours"
//     sentiment="positive"
//   />
// ---------------------------------------------------------------------------

interface BeforeAfterProps {
  label: string;
  // Renamed from `from`/`to` — those are ES module keywords that cause
  // MDX compile errors when used as JSX attribute names in .mdx files.
  before: string;
  after: string;
  sentiment?: "positive" | "neutral" | "negative";
  className?: string;
}

export function BeforeAfter({
  label,
  before,
  after,
  sentiment = "neutral",
  className,
}: BeforeAfterProps) {
  const afterColorClass =
    sentiment === "positive"
      ? "text-emerald-500 dark:text-emerald-400"
      : sentiment === "negative"
        ? "text-destructive"
        : "text-foreground";

  return (
    <div
      // role="figure" gives the div an explicit ARIA role so aria-label is permitted.
      // ARIA 1.2 prohibits aria-label on elements with implicit role="generic" (plain div).
      role="figure"
      aria-label={`${label}: changed from ${before} to ${after}`}
      className={cn("border-border/40 my-8 overflow-hidden rounded-xl border", className)}
    >
      <p className="text-muted-foreground border-border/40 border-b px-5 py-3 font-mono text-xs tracking-widest uppercase sm:px-6">
        {label}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr]">
        {/* Before */}
        <div className="bg-muted/20 flex flex-col gap-1 px-5 py-6 sm:px-6">
          {/*
           * "Before" label: aria-hidden because the parent aria-label already
           * describes the full before→after transition. The /50 opacity would
           * also fail WCAG 1.4.3 contrast on bg-muted/20 at this font size.
           */}
          <span
            aria-hidden="true"
            className="text-muted-foreground/50 font-mono text-xs tracking-widest uppercase"
          >
            Before
          </span>
          <span className="font-display text-muted-foreground text-3xl font-semibold tabular-nums sm:text-4xl">
            {before}
          </span>
        </div>

        {/* Arrow divider */}
        <div className="bg-muted/20 sm:border-border/40 flex items-center justify-center px-3 sm:border-x">
          <span className="text-muted-foreground/30 text-2xl" aria-hidden="true">
            →
          </span>
        </div>

        {/* After */}
        <div className="flex flex-col gap-1 px-5 py-6 sm:px-6">
          {/* "After" label: aria-hidden for same reason as "Before" above. */}
          <span
            aria-hidden="true"
            className="text-muted-foreground/50 font-mono text-xs tracking-widest uppercase"
          >
            After
          </span>
          <span
            className={cn(
              "font-display text-3xl font-semibold tabular-nums sm:text-4xl",
              afterColorClass,
            )}
          >
            {after}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bar — horizontal proportion bar with label and optional caption
//
// Usage:
//   <Bar value={78} label="UI surface area covered by system components" />
// ---------------------------------------------------------------------------

interface BarProps {
  value: number;
  label: string;
  caption?: string;
  className?: string;
}

export function Bar({ value, label, caption, className }: BarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("my-8", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-foreground/80 text-sm leading-snug sm:text-base">{label}</span>
        <span className="font-display text-foreground shrink-0 text-xl font-semibold tabular-nums sm:text-2xl">
          {clamped}%
        </span>
      </div>
      {/*
       * The bar track is decorative — the percentage and label are already
       * conveyed by the visible text above. aria-hidden removes it from the
       * a11y tree so assistive tech skips the visual-only fill element.
       */}
      <div className="bg-muted/60 h-2.5 w-full overflow-hidden rounded-full" aria-hidden="true">
        <div
          className="bg-accent h-full rounded-full transition-none"
          style={{ width: `${String(clamped)}%` }}
        />
      </div>
      {caption && <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{caption}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported MDX component map
// ---------------------------------------------------------------------------

export const mdxComponents: MDXComponents = {
  h2: H2,
  h3: H3,
  p: P,
  blockquote: Blockquote,
  ul: Ul,
  ol: Ol,
  li: Li,
  a: A,
  code: Code,
  pre: Pre,
  table: Table,
  th: Th,
  td: Td,
  img: Img,
  hr: Hr,
  // Named editorial primitives — exported above and registered here so
  // MDX authors can use them without manual imports in each MDX file.
  Figure,
  Stats,
  BeforeAfter,
  Bar,
  // Flow diagram primitives — visual replacements for narrative diagrams.
  // See src/components/mdx/flow-primitives.tsx for full API and tone system.
  // Wrapper components:
  FlowChain,
  FlowSplit,
  StateGrid,
  PrincipleGrid,
  BranchTree,
  // Leaf / child components (nested inside wrappers in MDX):
  FlowItem,
  FlowColumn,
  StateItem,
  PrincipleItem,
  Branch,
  // Injected by remark-mermaid plugin — resolved here so next-mdx-remote
  // can find the component without a runtime import inside the MDX body.
  MermaidDiagram,
};
