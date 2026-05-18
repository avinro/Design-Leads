import type { Metadata } from "next";
import { Google_Sans_Flex, Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { AnalyticsClickDelegator } from "@/components/analytics/click-delegator";
import { INTRO_BLOCK_FIRST_PAINT_SCRIPT } from "@/lib/intro/block-first-paint";
import { SITE_URL, SITE_NAME, OWNER_JOB_TITLE } from "@/lib/seo/site";
import { SITE_OG_IMAGE, SITE_TWITTER_CARD } from "@/lib/seo/social";

/* Display/headings font */
const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
  axes: ["ROND", "opsz"],
  display: "optional",
  adjustFontFallback: false,
});

/*
 * Manrope — variable humanist sans for body/UI copy (OFL).
 * Loaded as a variable weight so a single file covers 200–800.
 * display: 'optional' keeps the same loading strategy as display headings — avoids any
 * CLS from font swap on body copy. Next.js auto-generates size-adjust metrics
 * for Manrope so fallback fidelity is high, but 'optional' is cleaner for CLS.
 */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "optional",
});

/*
 * Geist Mono — kept for code blocks, data IDs, and timestamps.
 * Avoids an extra font download for body copy since Manrope covers it.
 */
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const DEFAULT_DESCRIPTION =
  "Product designer crafting thoughtful UX systems, brand identities, and digital products.";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${OWNER_JOB_TITLE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: SITE_TWITTER_CARD,
    images: [SITE_OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*
   * Font CSS variables live on <html> so Tailwind's @theme inline
   * and any component using var(--font-*) inherit them correctly.
   * min-h-dvh avoids the iOS 100vh toolbar overlap (skill: viewport-units).
   */
  return (
    <html
      lang="en"
      className={`${googleSansFlex.variable} ${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
         * Synchronous first-paint guard for the session intro (see SiteIntroGate).
         * Must run before body paint; pairs with .avinro-intro-pending in globals.css.
         */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_BLOCK_FIRST_PAINT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        {/*
         * PostHogProvider captures App Router pageviews via usePathname +
         * useSearchParams (wrapped in Suspense to prevent layout blocking).
         * AnalyticsClickDelegator is a single document-level click listener
         * that translates data-cta-* and data-work-card-* attributes into
         * typed analytics events without converting server components to client.
         * Both are async — no render-blocking impact on LCP.
         *
         * SiteHeader, SiteFooter, and MobileCtaBar are now scoped to the
         * (site) route group layout so that authenticated portal and outreach
         * areas can render their own chrome without inheriting marketing nav.
         */}
        <PostHogProvider />
        <AnalyticsClickDelegator />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
