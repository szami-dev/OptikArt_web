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
module.exports = {
  allowedDevOrigins: ['26.34.221.136'],
};




export default nextConfig;


