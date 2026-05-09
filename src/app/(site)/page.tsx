import type { Metadata } from "next";

import { SITE_URL, SITE_NAME, OWNER_JOB_TITLE } from "@/lib/seo/site";
import { PersonJsonLd } from "@/lib/seo/json-ld";
import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { testimonials } from "@/lib/content/testimonials";
import { HomeHero } from "@/components/site/home-hero";
import { WorkDivider } from "@/components/site/work-divider";
import { FlowingWorkMenu } from "@/components/site/flowing-work-menu";
import { AboutCursorImages } from "@/components/site/about-cursor-images";
import { TestimonialsCarousel } from "@/components/site/testimonials-carousel";

/*
 * Home page metadata — Open Graph and Twitter cards are wired to the
 * dynamic opengraph-image.tsx handler in this directory so they update
 * automatically whenever the handler changes.
 */
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
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: HOME_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

/*
 * Home page — public portfolio landing.
 *
 * Sections:
 *   1. HomeHero            — headline, sub, secondary CTA + CircularText protagonist
 *   2. WorkDivider (top)   — slim h4-scale marquee, scrolls left
 *   3. FlowingWorkMenu     — full-bleed rows with GSAP marquee hover overlay
 *   3b. WorkDivider (bot)  — same marquee, scrolls right (bookends work section)
 *   4. AboutCursorImages   — bio with cursor-trail images (desktop) / scroll parallax (mobile)
 *   5. TestimonialsCarousel — Embla carousel with peek slides, no autoplay
 *
 * Footer lives in (site)/layout.tsx as a curtain behind the content wrapper.
 *
 * Case studies are fetched server-side and passed as props to the client
 * SelectedWorksStack component to keep the content layer server-only.
 */
export default function Home() {
  const cases = getPublishedCaseStudies();

  return (
    <main id="main-content">
      <PersonJsonLd />
      <HomeHero />
      <WorkDivider direction="left" />
      <FlowingWorkMenu cases={cases} />
      <WorkDivider direction="right" />
      <AboutCursorImages />
      <TestimonialsCarousel testimonials={testimonials} />
    </main>
  );
}
