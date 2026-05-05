import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Design Leads",
    template: "%s | Design Leads",
  },
  description:
    "Strategic design leadership — brand identity, UX systems, and client portals.",
  metadataBase: new URL("https://avinro.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*
   * Font variables live on <html> so @theme inline can resolve
   * the Geist variable class names injected by next/font.
   * The body only carries layout and colour utilities.
   */
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
