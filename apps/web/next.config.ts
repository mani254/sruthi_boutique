import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@shruthi-boutique/database", "@shruthi-boutique/types"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
