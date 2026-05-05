import { ImageResponse } from "next/og";

/*
 * Open Graph image for the home page — generated at request time via
 * Next.js's opengraph-image.tsx convention (no binary assets committed).
 *
 * runtime = "nodejs" uses Fluid Compute (recommended over Edge for new
 * projects per the Vercel platform guidance).
 *
 * Fonts: system fonts only to avoid network cost in the OG handler.
 * Swap for custom fonts in a future content issue once the real copy is set.
 *
 * Dimensions: 1200×630 — standard OG / Twitter summary_large_image size.
 */
export const runtime = "nodejs";
export const alt = "Avinro — Product Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
      {/* Wordmark */}
      <span
        style={{
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: "0.05em",
          color: "#A1A1AA", // zinc-400
          textTransform: "uppercase",
          marginBottom: 32,
        }}
      >
        avinro.com
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
        Product Designer
      </span>

      {/* Tagline */}
      <span
        style={{
          fontSize: 28,
          fontWeight: 400,
          color: "#71717A", // zinc-500
          maxWidth: 700,
          lineHeight: 1.4,
        }}
      >
        UX systems · Brand identity · Client portals
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
