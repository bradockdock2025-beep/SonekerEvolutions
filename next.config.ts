import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',    // YouTube primary thumbnail CDN
      },
      {
        protocol: 'https',
        hostname: '*.ytimg.com',    // YouTube thumbnail CDN variants
      },
    ],
  },
};

export default nextConfig;
