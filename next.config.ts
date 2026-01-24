import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Webflow Cloud deployment - site mounts at /customsite (production only)
  ...(isProduction && {
    basePath: "/customsite",
    assetPrefix: "/customsite",
  }),

  // Standalone output for Cloudflare/Webflow Cloud deployment
  output: "standalone",

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets-global.website-files.com",
      },
      {
        protocol: "https",
        hostname: "images.weserv.nl",
      },
    ],
  },
};

export default nextConfig;
