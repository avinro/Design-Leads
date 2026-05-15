import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Contact page removed — CTA modal now lives on every page.
      { source: "/contact", destination: "/", permanent: true },
      // Case studies moved from /work/[slug] to /case-studies/[slug].
      // Per-slug redirects instead of a wildcard so the new /work/[slug]
      // route (visual explorations) does not get caught by the redirect.
      {
        source: "/work/hello-dojo",
        destination: "/case-studies/hello-dojo",
        permanent: true,
      },
      {
        source: "/work/uma",
        destination: "/case-studies/uma",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
