/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simplified config for Vercel compatibility
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {},
  // Increase body size limit for photo uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase from default 1mb to 10mb
    },
  },
  images: {
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