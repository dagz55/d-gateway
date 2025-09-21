/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for better performance
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {},
  // Performance and optimization features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase from default 1mb to 10mb
    },
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'], // Optimize specific packages
  },
  // Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'], // Enable modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // Cache images for 1 year
    remotePatterns: [
      {
        protocol: "https",
        hostname: "workoscdn.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      // Add other trusted domains as needed
    ],
  },
  // Compression and performance headers
  compress: true,
  poweredByHeader: false, // Remove X-Powered-By header for security and performance
  // External packages for server components
  serverExternalPackages: ['@workos-inc/node'],
  webpack: (config, options) => {
    // Only apply client-side configuration for WorkOS resolution
    if (!options.isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "crypto": "crypto-browserify",
        "http": false,
        "https": false,
        "url": "url",
        "buffer": "buffer",
        "util": "util",
      };
    }

    // Remove devtool override to use Next.js default settings
    // This prevents the performance warning in development
    // config.devtool =
    //   process.env.NODE_ENV === "production" ? "hidden-source-map" : "eval-source-map";
    if (process.env.NODE_ENV === "production") {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    config.plugins = config.plugins || [];
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];

    const fileLoaderRule = config.module.rules.find(
      (rule) =>
        typeof rule === "object" &&
        rule !== null &&
        rule.test instanceof RegExp &&
        rule.test.test(".svg"),
    );
    if (fileLoaderRule && typeof fileLoaderRule === "object") {
      fileLoaderRule.exclude = /\.svg$/i;
    }
    config.module.rules.push(
      {
        test: /\.svg$/i,
        resourceQuery: /url/,
        type: "asset/resource",
      },
      // Alternative: use @svgr/webpack to import SVGs as React components
    );

    return config;
  },
};

export default nextConfig;
