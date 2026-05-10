/**
 * Centralised SEO constants for avinro.com.
 *
 * Keep SITE_URL as the stable production canonical base — never derive
 * canonical URLs or sitemap entries from preview deployment env vars,
 * as that would pollute search-engine indexes with ephemeral URLs.
 */

export const SITE_URL = "https://avinro.com";
export const SITE_NAME = "Avinro";
export const OWNER_NAME = "Ary (Avinro)";
export const OWNER_JOB_TITLE = "Product Design Engineer";

/**
 * Social profile URLs.
 * TODO(PRO-20): replace placeholder values with real profile URLs.
 * These are intentionally NOT emitted into JSON-LD sameAs until the real
 * URLs are provided — placeholder strings would be invalid schema.org data.
 */
export const SOCIAL_LINKS = {
  github: "https://github.com/avinro",
  behance: "https://behance.net/avinro",
  x: "https://x.com/avinro",
  linkedin: "https://linkedin.com/in/avinro",
  instagram: "https://instagram.com/avinro",
  // dribbble: "https://dribbble.com/avinro",  // TODO(PRO-20): add when ready
} as const;
