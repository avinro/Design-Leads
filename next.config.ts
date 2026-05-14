import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy /owner/invite no longer exists — the invite action moved to
      // /owner/clients/[accountId]/members/new which requires an accountId.
      // We redirect to the owner dashboard as the closest sensible destination.
      {
        source: "/owner/invite",
        destination: "/owner/dashboard",
        permanent: true,
      },
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
