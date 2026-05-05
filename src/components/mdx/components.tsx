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
 */

import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";
import { MermaidDiagram } from "./mermaid-diagram";

// ---------------------------------------------------------------------------
// Heading components
// ---------------------------------------------------------------------------

function H2({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn(
        "font-display mt-12 mb-4 text-2xl font-semibold tracking-tight sm:text-3xl",
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
        "font-display mt-8 mb-3 text-xl font-semibold tracking-tight sm:text-2xl",
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
      className={cn("text-foreground/90 mb-5 text-base leading-relaxed sm:text-lg", className)}
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
    <Link
      href={href}
      className={cn(
        "text-accent decoration-accent/40 hover:decoration-accent focus-visible:ring-ring rounded-sm underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
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
  // Injected by remark-mermaid plugin — resolved here so next-mdx-remote
  // can find the component without a runtime import inside the MDX body.
  MermaidDiagram,
};
