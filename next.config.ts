import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
  scrollRestoration: true,
},
images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    qualities: [75, 50, 25, 80, 85, 90, 95],
  },
};

export default nextConfig;


