import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { getPublishedCaseStudiesForSitemap } from "@/lib/content/case-studies";

/**
 * Native App Router sitemap — no external dependency needed.
 *
 * Includes:
 *   - Static public pages: /, /work, /about, /contact
 *   - One entry per published (non-draft) case study with real fs mtime.
 *
 * Drafts are intentionally excluded — they carry robots:noindex so including
 * them in the sitemap would send contradictory signals to search engines.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: buildDate,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: buildDate,
      changeFrequency: "yearly",
      priority: 0.7,
    },
  ];

  const caseStudyEntries: MetadataRoute.Sitemap = getPublishedCaseStudiesForSitemap().map(
    ({ slug, lastModified }) => ({
      url: `${SITE_URL}/work/${slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    }),
  );

  return [...staticPages, ...caseStudyEntries];
}
