/**
 * Case studies content layer.
 *
 * Reads MDX files from content/case-studies/ at build time, validates
 * frontmatter with zod (hard build failure on invalid files), computes
 * reading time server-side, and exposes typed query helpers.
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

/**
 * Schema for a single KPI item in frontmatter.
 * Each item must have either `value` (plain stat) or `delta` (before/after).
 */
const KpiSchema = z
  .object({
    value: z.string().min(1).optional(),
    label: z.string().min(1),
    sublabel: z.string().optional(),
    delta: z.object({ from: z.string().min(1), to: z.string().min(1) }).optional(),
    sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  })
  .refine((k) => k.value !== undefined || k.delta !== undefined, {
    message: "kpi must have either `value` or `delta`",
  });

export type KpiItem = z.infer<typeof KpiSchema>;

const CaseStudyFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  client: z.string().min(1),
  role: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  coverage: z.array(z.string()).min(1),
  outcome: z.string().min(1),
  coverImage: z.string().min(1),
  order: z.number().int().min(1),
  // Listing layer extensions
  summary: z.string().min(1),
  tags: z.array(z.string()).min(1),
  gradient: z.string().min(1),
  draft: z.boolean().optional().default(false),
  // Optional outcome KPIs — rendered as a top-of-page stat strip and
  // available to MDX body via the <Stats /> primitive.
  kpis: z.array(KpiSchema).max(6).optional(),
});

export type CaseStudyFrontmatter = z.infer<typeof CaseStudyFrontmatterSchema>;

// ---------------------------------------------------------------------------
// Full case study shape
// ---------------------------------------------------------------------------

export interface CaseStudy {
  frontmatter: CaseStudyFrontmatter;
  /** Raw MDX body (without frontmatter). */
  content: string;
  /** Words-per-minute estimated read time. */
  readingTime: {
    text: string;
    minutes: number;
    words: number;
  };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const CONTENT_DIR = path.join(process.cwd(), "content", "case-studies");

function readAllCaseStudyFiles(): CaseStudy[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    // Validate with zod — throws with a descriptive message on failure,
    // which propagates as a build error rather than a silent runtime gap.
    const result = CaseStudyFrontmatterSchema.safeParse(data);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`Invalid frontmatter in content/case-studies/${file}:\n${issues}`);
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
let _cache: CaseStudy[] | null = null;

function getAll(): CaseStudy[] {
  _cache ??= readAllCaseStudyFiles().sort((a, b) => a.frontmatter.order - b.frontmatter.order);
  return _cache;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** All case studies, including drafts, sorted by `order`. */
export function getAllCaseStudies(): CaseStudy[] {
  return getAll();
}

/**
 * Published (non-draft) case studies sorted by `order`.
 * Use for public listings: home SelectedWork and /work page.
 */
export function getPublishedCaseStudies(): CaseStudy[] {
  return getAll().filter((cs) => !cs.frontmatter.draft);
}

/** Slug-keyed lookup. Returns `undefined` for unknown slugs. */
export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return getAll().find((cs) => cs.frontmatter.slug === slug);
}

/**
 * All slugs (including drafts) for use in `generateStaticParams`.
 * Draft pages are still built but carry `robots: noindex,nofollow`.
 */
export function getCaseStudySlugs(): string[] {
  return getAll().map((cs) => cs.frontmatter.slug);
}

// ---------------------------------------------------------------------------
// Sitemap-specific helpers — keep the CaseStudy shape clean for page use
// ---------------------------------------------------------------------------

export interface CaseStudySitemapEntry {
  slug: string;
  lastModified: Date;
}

/**
 * Published case studies with real file-system mtimes for sitemap entries.
 * Draft case studies are excluded (they carry noindex and must not appear in
 * the sitemap).
 */
export function getPublishedCaseStudiesForSitemap(): CaseStudySitemapEntry[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const { data } = matter(raw);
      const result = CaseStudyFrontmatterSchema.safeParse(data);
      if (!result.success || result.data.draft) return null;
      const mtime = fs.statSync(path.join(CONTENT_DIR, file)).mtime;
      return { slug: result.data.slug, lastModified: mtime };
    })
    .filter((entry): entry is CaseStudySitemapEntry => entry !== null);
}
