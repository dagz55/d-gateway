import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix lockfile warning by setting the correct root
  outputFileTracingRoot: process.cwd(),
  
  // Allow cross-origin requests from localhost during development
  allowedDevOrigins: ['localhost'],
  
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
