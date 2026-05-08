import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    let DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3001';
    let ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3002';
    
    // Ensure protocol exists
    if (DASHBOARD_URL && !DASHBOARD_URL.startsWith('http')) DASHBOARD_URL = `https://${DASHBOARD_URL}`;
    if (ADMIN_URL && !ADMIN_URL.startsWith('http')) ADMIN_URL = `https://${ADMIN_URL}`;

    // Clean trailing slashes
    DASHBOARD_URL = DASHBOARD_URL.replace(/\/$/, '');
    ADMIN_URL = ADMIN_URL.replace(/\/$/, '');
    
    // Remove /dashboard or /admin suffix if the user accidentally included it in the ENV var
    // since the rewrites add it back
    DASHBOARD_URL = DASHBOARD_URL.replace(/\/dashboard$/, '');
    ADMIN_URL = ADMIN_URL.replace(/\/admin$/, '');

    console.log('Proxy Configuration:', { DASHBOARD_URL, ADMIN_URL });
    
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
