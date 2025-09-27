import path from 'path';

// Load global polyfill for SSR compatibility
if (typeof global !== 'undefined' && !global.self) {
  global.self = global;
}

/** @type {import('next').NextConfig} */
const nextConfig = {

  // Fix lockfile warning by setting the correct project root
  outputFileTracingRoot: path.resolve(process.cwd()),
  
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
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      'framer-motion',
      '@clerk/nextjs',
      '@supabase/supabase-js'
    ], // Optimize specific packages
    webVitalsAttribution: ['CLS', 'LCP'], // Track Core Web Vitals
    optimizeCss: true, // Enable CSS optimization
    scrollRestoration: true, // Optimize scroll restoration
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
  webpack: (config, options) => {
    // Fix 'self is not defined' error in server-side rendering
    if (options.isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "self": false
      };

      // Ensure Webpack uses a Node-safe global object in server bundles
      config.output = config.output || {};
      config.output.globalObject = 'globalThis';

      // Ensure "self" resolves to globalThis in server bundles to avoid SSR ReferenceError
      config.plugins = config.plugins || [];
      config.plugins.push(new webpack.DefinePlugin({
        self: 'globalThis',
      }));

    }

    // Client-side configuration
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
      // Always allow Next to control server chunking/runtime format. Only customize client-side.
      if (!options.isServer) {
        config.optimization = {
          ...config.optimization,
          minimize: true,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
              },
              animations: {
                test: /[\\/]node_modules[\\/](framer-motion|@react-spring)[\\/]/,
                name: 'animations',
                chunks: 'all',
                priority: 20,
              },
              ui: {
                test: /[\\/]node_modules[\\/](@radix-ui|@clerk)[\\/]/,
                name: 'ui',
                chunks: 'all',
                priority: 15,
              },
            },
          },
        };
      } else {
        // Preserve server defaults; optionally keep minimization
        config.optimization = {
          ...config.optimization,
          minimize: true,
        };
      }
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
