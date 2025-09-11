import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from common development origins
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '192.168.1.160', // Your local network IP
  ],
  
  // Fix lockfile warning by setting the correct root
  outputFileTracingRoot: '/Users/robertsuarez/big4trading/member-dashboard',
  
  // Font optimization is enabled by default in Next.js 15
  
  // Configure font optimization
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
};

export default nextConfig;
