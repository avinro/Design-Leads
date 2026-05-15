/**
 * Restricted MDX component map for work (visual explorations) pages.
 *
 * Intentionally omits case-study-specific primitives so authors cannot
 * accidentally add narrative complexity to the visual-first format:
 *   - No Stats / KPI blocks
 *   - No FlowChain / FlowSplit / StateGrid / PrincipleGrid / BranchTree
 *   - No MermaidDiagram
 *   - No BeforeAfter / Bar
 *
 * What is allowed: prose typography including structured headings (h2–h4),
 * blockquotes, dividers, links, inline code, simple images, the
 * <Figure> component for contextual screen placement, and
 * <WorkMetadataGrid> / <WorkMetadataCard> for overview metadata rows.
 * The frontmatter gallery is still available for works that prefer a
 * visual-only format with no inline images.
 */

import Image from "next/image";
import { MdxInternalBodyLink } from "@/components/mdx/mdx-internal-body-link";
import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";
import { WorkMetadataCard, WorkMetadataGrid } from "@/components/work/work-metadata";

function H2({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn(
        "font-display text-foreground mt-12 mb-4 text-2xl font-semibold tracking-tight sm:text-3xl",
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
        "font-display text-foreground mt-8 mb-3 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function H4({ className, ...props }: ComponentPropsWithoutRef<"h4">) {
  return (
    <h4
      className={cn(
        "text-foreground mt-6 mb-2 text-base font-semibold tracking-tight sm:text-lg",
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
        "border-accent/60 text-foreground/70 my-6 border-l-2 pl-5 text-base leading-relaxed italic sm:text-lg",
        className,
      )}
      {...props}
    />
  );
}

function Hr({ className, ...props }: ComponentPropsWithoutRef<"hr">) {
  return <hr className={cn("border-border/40 my-10", className)} {...props} />;
}

function P({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn("text-foreground/90 mb-5 text-base leading-relaxed sm:text-lg", className)}
      {...props}
    />
  );
}

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

function Code({ className, ...props }: ComponentPropsWithoutRef<"code">) {
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

function Strong({ className, ...props }: ComponentPropsWithoutRef<"strong">) {
  return <strong className={cn("font-semibold", className)} {...props} />;
}

function Em({ className, ...props }: ComponentPropsWithoutRef<"em">) {
  return <em className={cn("italic", className)} {...props} />;
}

interface InlineFigureProps {
  src: string;
  alt: string;
  caption?: string;
  /** Aspect ratio of the image container. Defaults to landscape (16/9). */
  aspect?: "portrait" | "square" | "landscape" | "wide";
  className?: string;
  priority?: boolean;
}

const FIGURE_ASPECT_RATIOS = {
  portrait: "4/5",
  square: "1/1",
  landscape: "16/9",
  wide: "21/9",
} as const;

function InlineFigure({
  src,
  alt,
  caption,
  aspect = "landscape",
  className,
  priority = false,
}: InlineFigureProps) {
  return (
    <figure className={cn("my-8 w-full", className)}>
      <div
        className="bg-muted relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: FIGURE_ASPECT_RATIOS[aspect] }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 800px"
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function Img({ src, alt = "", width, height }: ComponentPropsWithoutRef<"img">) {
  if (typeof src !== "string" || !src) return null;
  return (
    <span className="my-4 block">
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

export const workMdxComponents: MDXComponents = {
  h2: H2,
  h3: H3,
  h4: H4,
  blockquote: Blockquote,
  hr: Hr,
  p: P,
  a: A,
  ul: Ul,
  ol: Ol,
  li: Li,
  code: Code,
  strong: Strong,
  em: Em,
  img: Img,
  // JSX component — use as <Figure src="..." alt="..." aspect="landscape" /> in MDX
  Figure: InlineFigure,
  // Project metadata grid — <WorkMetadataGrid><WorkMetadataCard kind="type">…</WorkMetadataCard></WorkMetadataGrid>
  WorkMetadataGrid,
  WorkMetadataCard,
};
