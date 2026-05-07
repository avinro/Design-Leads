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
