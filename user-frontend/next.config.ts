import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/dashboard',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
