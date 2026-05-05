/**
 * Tests for the case-studies content layer.
 *
 * Uses vitest with Node.js — no jsdom needed since the module only uses fs
 * and performs pure data transformations.
 *
 * Covers:
 *   - All three MDX files are readable and pass zod validation
 *   - getAllCaseStudies returns results sorted by `order`
 *   - getPublishedCaseStudies excludes drafts
 *   - getCaseStudyBySlug resolves known slugs and returns undefined for unknown
 *   - getCaseStudySlugs includes all slugs (including drafts)
 *   - readingTime is a non-empty string with "read" in it
 *   - frontmatter shape matches expected fields
 */

import { describe, it, expect } from "vitest";
import {
  getAllCaseStudies,
  getPublishedCaseStudies,
  getCaseStudyBySlug,
  getCaseStudySlugs,
} from "./case-studies";

describe("case-studies content layer", () => {
  it("loads all three case study files without throwing", () => {
    const all = getAllCaseStudies();
    expect(all).toHaveLength(3);
  });

  it("returns case studies sorted by order ascending", () => {
    const all = getAllCaseStudies();
    const orders = all.map((cs) => cs.frontmatter.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("getPublishedCaseStudies excludes draft entries", () => {
    const published = getPublishedCaseStudies();
    const all = getAllCaseStudies();
    const drafts = all.filter((cs) => cs.frontmatter.draft);
    expect(published).toHaveLength(all.length - drafts.length);
    expect(published.every((cs) => !cs.frontmatter.draft)).toBe(true);
  });

  it("getCaseStudyBySlug resolves 'uma'", () => {
    const cs = getCaseStudyBySlug("uma");
    expect(cs).toBeDefined();
    expect(cs?.frontmatter.title).toBe("UMA");
  });

  it("getCaseStudyBySlug resolves 'hello-dojo'", () => {
    const cs = getCaseStudyBySlug("hello-dojo");
    expect(cs).toBeDefined();
    expect(cs?.frontmatter.title).toBe("Hello Dojo");
  });

  it("getCaseStudyBySlug returns undefined for unknown slug", () => {
    expect(getCaseStudyBySlug("not-a-real-slug")).toBeUndefined();
  });

  it("getCaseStudySlugs includes all slugs", () => {
    const slugs = getCaseStudySlugs();
    expect(slugs).toContain("uma");
    expect(slugs).toContain("hello-dojo");
    expect(slugs).toContain("project-3");
  });

  it("getCaseStudySlugs includes draft slugs for static params", () => {
    const slugs = getCaseStudySlugs();
    expect(slugs).toContain("project-3");
  });

  it("every case study has a non-empty readingTime text", () => {
    const all = getAllCaseStudies();
    all.forEach((cs) => {
      expect(cs.readingTime.text).toBeTruthy();
      expect(cs.readingTime.text.toLowerCase()).toContain("read");
    });
  });

  it("every case study has required frontmatter fields", () => {
    const all = getAllCaseStudies();
    all.forEach((cs) => {
      const fm = cs.frontmatter;
      expect(fm.title).toBeTruthy();
      expect(fm.slug).toBeTruthy();
      expect(fm.client).toBeTruthy();
      expect(fm.role).toBeTruthy();
      expect(fm.year).toBeGreaterThan(2000);
      expect(fm.coverage.length).toBeGreaterThan(0);
      expect(fm.outcome).toBeTruthy();
      expect(fm.coverImage).toBeTruthy();
      expect(fm.order).toBeGreaterThanOrEqual(1);
      expect(fm.summary).toBeTruthy();
      expect(fm.tags.length).toBeGreaterThan(0);
      expect(fm.gradient).toBeTruthy();
    });
  });

  it("project-3 is marked as draft", () => {
    const cs = getCaseStudyBySlug("project-3");
    expect(cs?.frontmatter.draft).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // sections field — optional per-section background images
  // ---------------------------------------------------------------------------

  it("uma has a sections array with at least one entry", () => {
    const cs = getCaseStudyBySlug("uma");
    expect(cs?.frontmatter.sections).toBeDefined();
    expect(cs?.frontmatter.sections?.length).toBeGreaterThan(0);
  });

  it("hello-dojo has a sections array with at least one entry", () => {
    const cs = getCaseStudyBySlug("hello-dojo");
    expect(cs?.frontmatter.sections).toBeDefined();
    expect(cs?.frontmatter.sections?.length).toBeGreaterThan(0);
  });

  it("project-3 has no sections (optional field, falls back to coverImage)", () => {
    const cs = getCaseStudyBySlug("project-3");
    expect(cs?.frontmatter.sections).toBeUndefined();
  });

  it("each section entry has a non-empty id and image", () => {
    const cs = getCaseStudyBySlug("uma");
    cs?.frontmatter.sections?.forEach((section) => {
      expect(section.id.length).toBeGreaterThan(0);
      expect(section.image.length).toBeGreaterThan(0);
    });
  });

  it("uma sections ids align with the expected rehype-slug heading ids", () => {
    const cs = getCaseStudyBySlug("uma");
    const ids = cs?.frontmatter.sections?.map((s) => s.id) ?? [];
    const expected = [
      "problem-statement",
      "my-role-and-constraints",
      "process",
      "key-decisions-and-trade-offs",
      "results-and-impact",
      "learnings",
    ];
    expect(ids).toEqual(expected);
  });
});
