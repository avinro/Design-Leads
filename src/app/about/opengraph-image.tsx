import { ImageResponse } from "next/og";

/*
 * Open Graph image for the /about page.
 *
 * Mirrors the visual language of the root opengraph-image.tsx handler:
 * same zinc-950 background, same type scale and weight, same blue-600 accent
 * rule — with About-specific copy so crawlers and social previews clearly
 * identify the page as the portfolio owner's About section.
 *
 * runtime = "nodejs" (Fluid Compute, recommended for new projects).
 * System fonts only, matching the global OG handler.
 */
export const runtime = "nodejs";
export const alt = "Avinro — Lead Product Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function AboutOGImage() {
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
        background: "#09090B", // zinc-950 — matches --background dark
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Wordmark with page context */}
      <span
        style={{
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "0.1em",
          color: "#A1A1AA", // zinc-400
          textTransform: "uppercase",
          marginBottom: 40,
        }}
      >
        avinro.com · About
      </span>

      {/* Primary headline */}
      <span
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: "#FAFAFA", // zinc-50
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          marginBottom: 24,
        }}
      >
        Lead Product Designer
      </span>

      {/* Supporting line */}
      <span
        style={{
          fontSize: 28,
          fontWeight: 400,
          color: "#71717A", // zinc-500
          maxWidth: 700,
          lineHeight: 1.4,
        }}
      >
        Strategy · Design · Execution
      </span>

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
