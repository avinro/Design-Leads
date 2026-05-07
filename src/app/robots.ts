import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

/**
 * robots.txt via the native App Router handler.
 *
 * Allows all crawlers on the public portfolio while blocking:
 *   /admin    — future private back-office (PRO-20 AC)
 *   /outreach — Phase 2 private backoffice (PRO-20 AC)
 *   /dev      — dev-only component playground (returns 404 in production)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/outreach", "/dev"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
