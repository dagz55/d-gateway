import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from common development origins
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '192.168.1.160', // Your local network IP
  ],
  
  // Fix lockfile warning by setting the correct root
  outputFileTracingRoot: '/Users/robertsuarez/zignals/zignal-login',
  
  // Font optimization is enabled by default in Next.js 15
  
  // Configure font optimization and Server Actions
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    // Configure Server Actions body size limit for file uploads
    serverActions: {
      bodySizeLimit: '6mb', // Allow 6MB to accommodate 5MB files plus form data
    },
  },
  // Workaround for sporadic ENOENT on Webpack persistent cache in dev
  // Disables filesystem cache during `next dev` to improve stability
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }
    return config
  },
};

export default nextConfig;
