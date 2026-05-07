import type { Metadata } from "next";
import { Google_Sans_Flex, Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCtaBar } from "@/components/site/mobile-cta-bar";
import { SITE_URL, SITE_NAME, OWNER_JOB_TITLE } from "@/lib/seo/site";

/*
 * Google Sans Flex — variable display/heading font (OFL).
 * Expose the ROND (roundness) axis in addition to weight so headings
 * can leverage optical roundness in Phase 1 if needed.
 */
const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["ROND"],
  // Next.js does not have fallback metrics for Google Sans Flex yet;
  // disabling fallback generation avoids a build warning while the
  // variable font itself loads via <link> as normal.
  adjustFontFallback: false,
});

/*
 * Manrope — variable humanist sans for body/UI copy (OFL).
 * Loaded as a variable weight so a single file covers 200–800.
 */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

/*
 * Geist Mono — kept for code blocks, data IDs, and timestamps.
 * Avoids an extra font download for body copy since Manrope covers it.
 */
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${OWNER_JOB_TITLE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Product designer crafting thoughtful UX systems, brand identities, and digital products.",
  metadataBase: new URL(SITE_URL),
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
      <body className="flex min-h-dvh flex-col">
        {/* SiteHeader and MobileCtaBar are global chrome shared across all pages.
         * Placing them in the root layout means /work/[slug] and future pages
         * inherit navigation and the persistent primary CTA without duplication. */}
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <MobileCtaBar />
        <Toaster />
      </body>
    </html>
  );
}
