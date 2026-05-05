/**
 * Centralized MDX compile options used by next-mdx-remote/rsc.
 *
 * Plugin chain:
 *   remark: remark-gfm (tables, strikethrough, task lists, autolinks)
 *           remark-mermaid-to-component (rewrites ```mermaid fences to JSX)
 *   rehype: rehype-pretty-code (syntax highlighting, github-light/dark dual theme)
 *           rehype-slug (id="" on headings)
 *           rehype-autolink-headings (anchor per heading)
 */

import type { CompileOptions } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import { remarkMermaidToComponent } from "./remark-mermaid";

// ---------------------------------------------------------------------------
// rehype-pretty-code theme
// github-light / github-dark are validated for ≥4.5:1 contrast against the
// project's --background tokens (oklch(0.985 0 0) light, oklch(0.109 0 0) dark).
// ---------------------------------------------------------------------------
const prettyCodeOptions: PrettyCodeOptions = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  // Keep <pre> data-language attribute for CSS targeting.
  keepBackground: false,
};

// ---------------------------------------------------------------------------
// rehype-autolink-headings config
// behavior: "append" — adds a visually-hidden anchor after heading text.
// The anchor is revealed on :focus-visible via CSS in the MDX stylesheet.
// aria-label is set by the `ariaLabel` property of each heading element.
// ---------------------------------------------------------------------------
const autolinkOptions = {
  behavior: "append" as const,
  properties: {
    // Tailwind classes applied to every generated anchor:
    //   sr-only hides it visually; focus-visible:not-sr-only reveals it.
    //   min-h-[44px] min-w-[44px] satisfies the ≥44px touch target rule.
    className: [
      "ml-2",
      "opacity-0",
      "transition-opacity",
      "focus-visible:opacity-100",
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
      "focus-visible:ring-offset-2",
      "rounded-sm",
      "inline-flex",
      "items-center",
      "justify-center",
      "min-h-[44px]",
      "min-w-[44px]",
      "text-muted-foreground",
      "hover:text-foreground",
      "no-underline",
    ],
    "aria-label": "Link to this section",
  },
  content: {
    type: "element",
    tagName: "span",
    properties: { "aria-hidden": "true" },
    children: [{ type: "text", value: "#" }],
  },
};

// ---------------------------------------------------------------------------
// Exported MDX compile options
// ---------------------------------------------------------------------------

// Typed explicitly so next-mdx-remote/rsc receives correctly-shaped Pluggable[].
// The per-entry cast satisfies TS when options objects are passed alongside plugins.
import type { Pluggable } from "unified";

const compileMdxOptions: CompileOptions = {
  remarkPlugins: [remarkGfm, remarkMermaidToComponent],
  rehypePlugins: [
    [rehypePrettyCode, prettyCodeOptions] as Pluggable,
    rehypeSlug as Pluggable,
    [rehypeAutolinkHeadings, autolinkOptions] as Pluggable,
  ],
};

export const mdxOptions = {
  mdxOptions: compileMdxOptions,
};
