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
    ];
  },
};

export default nextConfig;
