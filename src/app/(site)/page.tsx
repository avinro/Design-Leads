import type { Metadata } from "next";

import { SITE_URL, SITE_NAME, OWNER_JOB_TITLE } from "@/lib/seo/site";
import { SITE_OG_IMAGE, SITE_TWITTER_CARD } from "@/lib/seo/social";
import { PersonJsonLd } from "@/lib/seo/json-ld";
import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { getPublishedWorks } from "@/lib/content/works";
import { testimonials } from "@/lib/content/testimonials";
import { HomeHero } from "@/components/site/home-hero";
import { WorkDivider } from "@/components/site/work-divider";
import { FlowingWorkMenu } from "@/components/site/flowing-work-menu";
import type { SelectedWorkItem } from "@/components/site/flowing-work-menu";
import { AboutCursorImages } from "@/components/site/about-cursor-images";
import { TestimonialsCarousel } from "@/components/site/testimonials-carousel";

const HOME_TITLE = `${SITE_NAME} — ${OWNER_JOB_TITLE}`;
const HOME_DESCRIPTION =
  "Product designer crafting thoughtful UX systems, brand identities, and digital products.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: SITE_TWITTER_CARD,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [SITE_OG_IMAGE.url],
  },
};

/*
 * Home page — public portfolio landing.
 *
 * Sections:
 *   1. HomeHero            — headline, sub, secondary CTA + CircularText protagonist
 *   2. WorkDivider (top)   — slim h4-scale marquee, scrolls left
 *   3. FlowingWorkMenu     — unified featured works (case studies + visual works)
 *                            each row shows a kind badge (Work / Case study)
 *   3b. WorkDivider (bot)  — same marquee, scrolls right (bookends work section)
 *   4. AboutCursorImages   — bio with cursor-trail images (desktop) / scroll parallax (mobile)
 *   5. TestimonialsCarousel — infinite marquee (rAF transform), hover slowdown
 *
 * Footer lives in (site)/layout.tsx as a curtain behind the content wrapper.
 *
 * Featured items from both case studies and works are merged into a single
 * list sorted by featuredOrder (when set) falling back to order. Each item
 * carries a `kind` discriminator so FlowingWorkMenu routes to the right path.
 */
export default function Home() {
  const featured: SelectedWorkItem[] = [
    ...getPublishedCaseStudies()
      .filter((c) => c.frontmatter.featured)
      .map((c) => ({
        kind: "case-study" as const,
        slug: c.frontmatter.slug,
        title: c.frontmatter.title,
        coverImage: c.frontmatter.coverImage,
        order: c.frontmatter.order,
      })),
    ...getPublishedWorks()
      .filter((w) => w.frontmatter.featured)
      .map((w) => ({
        kind: "work" as const,
        slug: w.frontmatter.slug,
        title: w.frontmatter.title,
        coverImage: w.frontmatter.coverImage,
        resultImage: w.frontmatter.resultImage,
        order: w.frontmatter.featuredOrder ?? w.frontmatter.order,
      })),
  ].sort((a, b) => a.order - b.order);

  return (
    <main id="main-content">
      <PersonJsonLd />
      <HomeHero />
      <WorkDivider direction="left" />
      <FlowingWorkMenu items={featured} />
      <WorkDivider direction="right" />
      <AboutCursorImages />
      <TestimonialsCarousel testimonials={testimonials} />
    </main>
  );
}
