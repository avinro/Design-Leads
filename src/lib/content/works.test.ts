/**
 * Tests for the works content layer.
 *
 * Uses vitest with Node.js — no jsdom needed since the module only uses fs
 * and performs pure data transformations.
 *
 * Covers:
 *   - domain-plug.mdx is readable and passes zod validation.
 *   - getAllWorks returns results sorted by `order`.
 *   - getPublishedWorks excludes drafts.
 *   - getWorkBySlug resolves known slugs and returns undefined for unknown.
 *   - getWorkSlugs includes all slugs (including drafts).
 *   - readingTime is computed.
 *   - Frontmatter shape matches expected fields.
 *
 * Publication contract (enforced only on non-draft entries):
 *   - Non-empty coverImage.
 *   - summary max 180 chars (enforced by zod, verified here as documentation).
 *   - gallery is an array (may be empty).
 */

import { describe, it, expect } from "vitest";
import { getAllWorks, getPublishedWorks, getWorkBySlug, getWorkSlugs } from "./works";

describe("works content layer", () => {
  it("loads all work files without throwing", () => {
    const all = getAllWorks();
    expect(all).toHaveLength(1);
  });

  it("returns works sorted by order ascending", () => {
    const all = getAllWorks();
    const orders = all.map((w) => w.frontmatter.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("getPublishedWorks excludes draft entries", () => {
    const published = getPublishedWorks();
    const all = getAllWorks();
    const drafts = all.filter((w) => w.frontmatter.draft);
    expect(published).toHaveLength(all.length - drafts.length);
    expect(published.every((w) => !w.frontmatter.draft)).toBe(true);
  });

  it("getWorkBySlug resolves 'domain-plug'", () => {
    const work = getWorkBySlug("domain-plug");
    expect(work).toBeDefined();
    expect(work?.frontmatter.title).toBe("DomainPlug");
  });

  it("getWorkBySlug returns undefined for unknown slug", () => {
    expect(getWorkBySlug("not-a-real-slug")).toBeUndefined();
  });

  it("getWorkSlugs includes all slugs", () => {
    const slugs = getWorkSlugs();
    expect(slugs).toContain("domain-plug");
  });

  it("every work has a non-empty readingTime text", () => {
    const all = getAllWorks();
    all.forEach((w) => {
      expect(w.readingTime.text).toBeTruthy();
    });
  });

  it("every work has required frontmatter fields", () => {
    const all = getAllWorks();
    all.forEach((w) => {
      const fm = w.frontmatter;
      expect(fm.title).toBeTruthy();
      expect(fm.slug).toBeTruthy();
      expect(fm.category).toBeTruthy();
      expect(fm.summary).toBeTruthy();
      expect(fm.summary.length).toBeLessThanOrEqual(180);
      expect(fm.coverImage).toBeTruthy();
      expect(fm.year).toBeGreaterThan(2000);
      expect(fm.order).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(fm.gallery)).toBe(true);
    });
  });

  it("featured works have featuredOrder or fall back to order", () => {
    const featured = getPublishedWorks().filter((w) => w.frontmatter.featured);
    featured.forEach((w) => {
      // Either featuredOrder is set and is a number, or order acts as fallback
      const effectiveOrder = w.frontmatter.featuredOrder ?? w.frontmatter.order;
      expect(typeof effectiveOrder).toBe("number");
    });
  });

  // ---------------------------------------------------------------------------
  // Publication contract — enforced on all published entries
  // ---------------------------------------------------------------------------

  it("each published work has a non-empty coverImage", () => {
    const published = getPublishedWorks();
    published.forEach((w) => {
      expect(
        w.frontmatter.coverImage,
        `${w.frontmatter.slug}: coverImage must not be empty`,
      ).toBeTruthy();
    });
  });

  it("domain-plug is not featured (correct for home exclusion)", () => {
    const work = getWorkBySlug("domain-plug");
    expect(work?.frontmatter.featured).toBe(false);
  });

  it("each published work has a gallery array", () => {
    const published = getPublishedWorks();
    published.forEach((w) => {
      expect(Array.isArray(w.frontmatter.gallery)).toBe(true);
    });
  });
});
