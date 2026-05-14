/**
 * Works content layer — visual explorations, concepts, and UI-led project work.
 *
 * Reads MDX files from content/works/ at build time, validates frontmatter
 * with zod (hard build failure on invalid files), and exposes typed query helpers.
 *
 * Intentionally simpler than case-studies.ts: no TOC extraction, no KPI schema.
 * Gallery items are defined in frontmatter (not MDX body) to enforce the
 * visual-first format at the data layer.
 *
 * Never imported by client components — this module uses Node.js `fs` APIs
 * which are not available in the browser bundle.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Frontmatter schema
// ---------------------------------------------------------------------------

const GalleryItemSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
  /** Explicit aspect override per image — defaults to portrait (4:5). */
  aspect: z.enum(["portrait", "square", "landscape", "wide"]).optional(),
});

export type GalleryItem = z.infer<typeof GalleryItemSchema>;

const WorkFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  year: z.number().int().min(2000).max(2100),
  category: z.enum([
    "UI exploration",
    "Concept",
    "Visual system",
    "Mobile UI",
    "Branding",
    "Microinteraction",
  ]),
  /** One-liner shown under the thumbnail — mandatory for visual discovery. */
  summary: z.string().min(1).max(180),
  coverImage: z.string().min(1),
  hoverImage: z.string().min(1).optional(),
  /** Cover aspect ratio — 4:5 portrait by default. */
  coverAspect: z.enum(["portrait", "square", "landscape"]).default("portrait"),
  /** Gallery images rendered from frontmatter, not MDX, to enforce visual-first. */
  gallery: z.array(GalleryItemSchema).max(20).default([]),
  tools: z.array(z.string()).max(8).default([]),
  client: z.string().optional(),
  externalLink: z.url().optional(),
  tags: z.array(z.string()).max(6).default([]),
  /** Sort order within the /work listing page. */
  order: z.number().int(),
  /**
   * Optional override for home "Selected work" sort order.
   * When absent, falls back to `order`.
   */
  featuredOrder: z.number().int().optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export type WorkFrontmatter = z.infer<typeof WorkFrontmatterSchema>;

// ---------------------------------------------------------------------------
// Full work shape
// ---------------------------------------------------------------------------

export interface Work {
  frontmatter: WorkFrontmatter;
  /** Raw MDX body (without frontmatter). Short intro prose, no primitives. */
  content: string;
  /** Words-per-minute estimated read time (used for meta, not displayed on page). */
  readingTime: {
    text: string;
    minutes: number;
    words: number;
  };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const CONTENT_DIR = path.join(process.cwd(), "content", "works");

function readAllWorkFiles(): Work[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    const result = WorkFrontmatterSchema.safeParse(data);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`Invalid frontmatter in content/works/${file}:\n${issues}`);
    }

    const rt = readingTime(content);

    return {
      frontmatter: result.data,
      content,
      readingTime: {
        text: rt.text,
        minutes: rt.minutes,
        words: rt.words,
      },
    };
  });
}

// Memoized at module level — only evaluated once per server process / build.
let _cache: Work[] | null = null;

function getAll(): Work[] {
  _cache ??= readAllWorkFiles().sort((a, b) => a.frontmatter.order - b.frontmatter.order);
  return _cache;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** All works, including drafts, sorted by `order`. */
export function getAllWorks(): Work[] {
  return getAll();
}

/**
 * Published (non-draft) works sorted by `order`.
 * Use for public listings: home SelectedWork and /work page.
 */
export function getPublishedWorks(): Work[] {
  return getAll().filter((w) => !w.frontmatter.draft);
}

/** Slug-keyed lookup. Returns `undefined` for unknown slugs. */
export function getWorkBySlug(slug: string): Work | undefined {
  return getAll().find((w) => w.frontmatter.slug === slug);
}

/**
 * All slugs (including drafts) for use in `generateStaticParams`.
 * Draft pages are still built but carry `robots: noindex,nofollow`.
 */
export function getWorkSlugs(): string[] {
  return getAll().map((w) => w.frontmatter.slug);
}

// ---------------------------------------------------------------------------
// Sitemap-specific helpers
// ---------------------------------------------------------------------------

export interface WorkSitemapEntry {
  slug: string;
  lastModified: Date;
}

/**
 * Published works with real file-system mtimes for sitemap entries.
 * Drafts are excluded (they carry noindex and must not appear in the sitemap).
 */
export function getPublishedWorksForSitemap(): WorkSitemapEntry[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const { data } = matter(raw);
      const result = WorkFrontmatterSchema.safeParse(data);
      if (!result.success || result.data.draft) return null;
      const mtime = fs.statSync(path.join(CONTENT_DIR, file)).mtime;
      return { slug: result.data.slug, lastModified: mtime };
    })
    .filter((entry): entry is WorkSitemapEntry => entry !== null);
}
