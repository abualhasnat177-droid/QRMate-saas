import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/QRMate-saas',
  assetPrefix: '/QRMate-saas',
  images: {
    unoptimized: true,
  },
  /* Static exports do not support rewrites. 
     To make login/signup work, these should be absolute URLs to your hosted user-frontend.
  async rewrites() {
    return [
      {
        source: '/login',
        destination: 'http://localhost:3001/dashboard/login',
      },
      {
        source: '/signup',
        destination: 'http://localhost:3001/dashboard/signup',
      },
      {
        source: '/dashboard/:path*',
        destination: 'http://localhost:3001/dashboard/:path*',
      },
      {
        source: '/admin/:path*',
        destination: 'http://localhost:3002/admin/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:3001/dashboard/api/auth/:path*',
      },
    ];
  },
  */
};

export default nextConfig;
