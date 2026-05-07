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
 *
 * Publication contract (enforced only on non-draft entries):
 *   - At least 5 <Figure blocks distributed across the body
 *   - Required section headings present: Problem statement, Process, Results and impact
 *   - Non-empty coverImage
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
  // Publication contract — enforced only on non-draft studies
  // ---------------------------------------------------------------------------

  it("each published study has at least 5 Figure blocks in the body", () => {
    const published = getPublishedCaseStudies();
    published.forEach((cs) => {
      const figureCount = (cs.content.match(/<Figure\b/g) ?? []).length;
      expect(
        figureCount,
        `${cs.frontmatter.slug}: expected >= 5 <Figure> blocks, found ${String(figureCount)}`,
      ).toBeGreaterThanOrEqual(5);
    });
  });

  it("each published study contains the required section headings", () => {
    const requiredHeadings = ["## Problem statement", "## Process", "## Results and impact"];
    const published = getPublishedCaseStudies();
    published.forEach((cs) => {
      requiredHeadings.forEach((heading) => {
        expect(
          cs.content,
          `${cs.frontmatter.slug}: missing required heading "${heading}"`,
        ).toContain(heading);
      });
    });
  });

  it("each published study has a non-empty coverImage", () => {
    const published = getPublishedCaseStudies();
    published.forEach((cs) => {
      expect(
        cs.frontmatter.coverImage,
        `${cs.frontmatter.slug}: coverImage must not be empty`,
      ).toBeTruthy();
    });
  });
});
