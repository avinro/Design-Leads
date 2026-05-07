import type { Metadata } from "next";

import { SITE_URL, SITE_NAME, OWNER_JOB_TITLE } from "@/lib/seo/site";
import { PersonJsonLd } from "@/lib/seo/json-ld";
import { HomeHero } from "@/components/site/home-hero";
import { WorkDivider } from "@/components/site/work-divider";
import { SelectedWork } from "@/components/site/selected-work";
import { SocialProof } from "@/components/site/social-proof";
import { AboutTeaser } from "@/components/site/about-teaser";

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
 *   1. HomeHero     — headline, sub, secondary CTA + CircularText protagonist
 *   2. WorkDivider  — CurvedLoop chapter break
 *   3. SelectedWork — 3 case study editorial rows
 *   4. AboutTeaser  — short bio + link to /about (centred, below work)
 *   5. SocialProof  — testimonial + decorative logo row
 *
 * The closing CTA lives inside SiteFooter so the page has one cohesive
 * full-screen closing section rather than a separate CTA block plus footer.
 *
 * The <main> id="main-content" is the target for the skip link rendered in
 * SiteHeader, allowing keyboard users to bypass navigation directly.
 */
export default function Home() {
  return (
    <main id="main-content">
      <PersonJsonLd />
      <HomeHero />
      <WorkDivider />
      <SelectedWork />
      <AboutTeaser />
      <SocialProof />
    </main>
  );
}
