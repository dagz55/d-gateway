import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix lockfile warning by setting the correct project root
  // This resolves conflicts when multiple lockfiles are detected
  outputFileTracingRoot: path.resolve(__dirname),
  
  // Allow cross-origin requests from localhost and network IP during development
  allowedDevOrigins: ['localhost', '192.168.1.160'],
  
  // Configure font optimization and Server Actions
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    // Configure Server Actions body size limit for file uploads
    serverActions: {
      bodySizeLimit: '6mb', // Allow 6MB to accommodate 5MB files plus form data
    },
  },
  
  // Configure headers to prevent REQUEST_HEADER_TOO_LARGE errors
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Configure webpack to handle Supabase Edge Runtime warnings and cache issues
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = false
    }
    
    // Handle Node.js APIs in Edge Runtime for Supabase
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
};

export default nextConfig;
