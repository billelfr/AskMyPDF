import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    console.log("🔥 NEXT REWRITE LOADED");

    return [
      {
        source: "/api/:path*",
        destination:
          "https://askmypdf-g2xi.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;