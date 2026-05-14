/**
 * Related content helper for case study pages.
 *
 * Builds a normalised list of up to MAX_ITEMS related items by mixing
 * published case studies (prioritised) and published works (secondary).
 * The current page's slug is excluded regardless of content kind.
 *
 * Ordering is deterministic:
 *   1. Other case studies, sorted ascending by `order`.
 *   2. Works, sorted ascending by `featuredOrder ?? order`.
 *
 * Never imported by client components — this module uses Node.js `fs` APIs
 * transitively via the content layer helpers.
 */

import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { getPublishedWorks } from "@/lib/content/works";

const MAX_ITEMS = 6;

export type RelatedItemKind = "case-study" | "work";

export interface RelatedItem {
  kind: RelatedItemKind;
  slug: string;
  title: string;
  coverImage: string;
  /** Short label shown above the title — "Case study" or "Work". */
  eyebrow: string;
  href: string;
  order: number;
}

/**
 * Returns up to MAX_ITEMS related items for a given case study slug.
 * Returns an empty array when no related content is available.
 */
export function getRelatedItems(currentSlug: string): RelatedItem[] {
  const caseStudies = getPublishedCaseStudies()
    .filter((cs) => cs.frontmatter.slug !== currentSlug)
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order)
    .map<RelatedItem>((cs) => ({
      kind: "case-study",
      slug: cs.frontmatter.slug,
      title: cs.frontmatter.title,
      coverImage: cs.frontmatter.coverImage,
      eyebrow: "Case study",
      href: `/case-studies/${cs.frontmatter.slug}`,
      order: cs.frontmatter.order,
    }));

  const works = getPublishedWorks()
    .sort((a, b) => {
      const aOrder = a.frontmatter.featuredOrder ?? a.frontmatter.order;
      const bOrder = b.frontmatter.featuredOrder ?? b.frontmatter.order;
      return aOrder - bOrder;
    })
    .map<RelatedItem>((w) => ({
      kind: "work",
      slug: w.frontmatter.slug,
      title: w.frontmatter.title,
      coverImage: w.frontmatter.coverImage,
      eyebrow: "Work",
      href: `/work/${w.frontmatter.slug}`,
      order: w.frontmatter.featuredOrder ?? w.frontmatter.order,
    }));

  // Case studies fill the list first; works fill any remaining slots.
  return [...caseStudies, ...works].slice(0, MAX_ITEMS);
}
