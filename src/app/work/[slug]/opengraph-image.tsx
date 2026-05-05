import { ImageResponse } from "next/og";
import { getCaseStudyBySlug, getCaseStudySlugs } from "@/lib/content/case-studies";

/*
 * Per-slug Open Graph image for case study pages.
 *
 * Renders title, client, year, and an accent rule following the same visual
 * language as the global opengraph-image.tsx handler so all OG images feel
 * like a coherent system.
 *
 * runtime = "nodejs" uses Fluid Compute (recommended over Edge per Vercel
 * platform guidance). System fonts only to match the existing global handler.
 */

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export default async function CaseStudyOGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);

  const title = cs?.frontmatter.title ?? "Case Study";
  const client = cs?.frontmatter.client ?? "";
  const year = cs?.frontmatter.year != null ? String(cs.frontmatter.year) : "";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        height: "100%",
        padding: "80px",
        background: "#09090B", // zinc-950
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Wordmark */}
      <span
        style={{
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "0.1em",
          color: "#71717A", // zinc-500
          textTransform: "uppercase",
          marginBottom: 40,
        }}
      >
        avinro.com · Case Study
      </span>

      {/* Case study title */}
      <span
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: "#FAFAFA",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          marginBottom: 24,
          maxWidth: 900,
        }}
      >
        {title}
      </span>

      {/* Client · Year */}
      {(client || year) && (
        <span
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: "#71717A",
          }}
        >
          {[client, year].filter(Boolean).join(" · ")}
        </span>
      )}

      {/* Accent rule */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          width: 48,
          height: 4,
          background: "#2563EB", // blue-600 accent
          borderRadius: 2,
        }}
      />
    </div>,
    { ...size },
  );
}
