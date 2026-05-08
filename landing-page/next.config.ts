import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3001';
    const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3002';
    
    return [
      {
        source: '/login',
        destination: `${DASHBOARD_URL}/dashboard/login`,
      },
      {
        source: '/signup',
        destination: `${DASHBOARD_URL}/dashboard/signup`,
      },
      {
        source: '/dashboard/:path*',
        destination: `${DASHBOARD_URL}/dashboard/:path*`,
      },
      {
        source: '/admin/:path*',
        destination: `${ADMIN_URL}/admin/:path*`,
      },
      {
        source: '/api/auth/:path*',
        destination: `${DASHBOARD_URL}/dashboard/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
