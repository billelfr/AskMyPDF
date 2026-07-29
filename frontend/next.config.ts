import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://askmypdf-g2xi.onrender.com/:path*',
      },
    ];
  },
};

export default nextConfig;
