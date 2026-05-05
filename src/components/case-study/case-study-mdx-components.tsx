/**
 * MDX component map for case study pages rendered over the sticky background scrim.
 *
 * All elements are styled for high contrast against a dark scrim (bg-black/65):
 * text uses zinc-50/zinc-200 instead of the default foreground tokens.
 *
 * Key difference from src/components/mdx/components.tsx:
 *   - h2 also receives data-section-id so IntersectionObserver in StickyBackground
 *     can identify which section is in view and swap the background image.
 *   - Tables, code blocks, and links use scrim-aware contrast overrides.
 *
 * The existing src/components/mdx/components.tsx is left untouched for
 * non-background MDX use cases.
 */

import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";
import { MermaidDiagram } from "@/components/mdx/mermaid-diagram";

// ---------------------------------------------------------------------------
// Heading components — h2 doubles as IntersectionObserver target
// ---------------------------------------------------------------------------

function H2({ id, className, children, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      id={id}
      // IntersectionObserver in StickyBackground queries [data-section-id]
      data-section-id={id}
      className={cn(
        "font-display mt-12 mb-4 scroll-mt-24 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

function H3({ className, ...props }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn(
        "font-display mt-8 mb-3 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl",
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
      className={cn("mb-5 text-base leading-relaxed text-zinc-200 sm:text-lg", className)}
      {...props}
    />
  );
}

function Blockquote({ className, ...props }: ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      className={cn("my-6 border-l-4 border-white/30 pl-5 text-lg text-zinc-300 italic", className)}
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
        "mb-5 ml-5 list-disc space-y-1.5 text-base text-zinc-200 sm:text-lg",
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
        "mb-5 ml-5 list-decimal space-y-1.5 text-base text-zinc-200 sm:text-lg",
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
// Links — high-contrast rings for legibility over scrim
// ---------------------------------------------------------------------------

function A({ href = "", className, children, ...props }: ComponentPropsWithoutRef<"a">) {
  const isExternal = href.startsWith("http");

  const linkClass = cn(
    "text-zinc-50 underline underline-offset-4 decoration-white/40",
    "hover:decoration-white transition-colors rounded-sm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2",
    // Minimum 44 × 44 touch target via padding compensation
    "min-h-[44px] inline-flex items-center",
    className,
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={linkClass} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClass} {...props}>
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Inline code and code blocks — dark enough to contrast over scrim
// ---------------------------------------------------------------------------

function Code({ className, ...props }: ComponentPropsWithoutRef<"code">) {
  return (
    <code
      className={cn(
        "rounded bg-black/45 px-1.5 py-0.5 font-mono text-[0.875em] text-zinc-100",
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
        "my-6 overflow-x-auto rounded-lg border border-white/10 bg-black/45 p-4 text-sm leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Table — dark-tinted, white borders to read over scrim
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
        "border border-white/15 bg-black/25 px-4 py-2.5 text-left font-semibold text-zinc-100",
        className,
      )}
      {...props}
    />
  );
}

function Td({ className, ...props }: ComponentPropsWithoutRef<"td">) {
  return (
    <td
      className={cn(
        "border border-white/15 bg-black/10 px-4 py-2.5 leading-relaxed text-zinc-200 tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Images — proxied through next/image for optimisation
// ---------------------------------------------------------------------------

function Img({ src, alt = "", width, height }: ComponentPropsWithoutRef<"img">) {
  if (typeof src !== "string" || !src) return null;

  return (
    <span className="my-6 block">
      <Image
        src={src}
        alt={alt}
        width={typeof width === "string" ? parseInt(width, 10) : (width ?? 1200)}
        height={typeof height === "string" ? parseInt(height, 10) : (height ?? 630)}
        className="rounded-lg opacity-90"
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
  return <hr className={cn("my-10 border-white/15", className)} {...props} />;
}

// ---------------------------------------------------------------------------
// Exported component map
// ---------------------------------------------------------------------------

export const caseStudyMdxComponents: MDXComponents = {
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
  MermaidDiagram,
};
