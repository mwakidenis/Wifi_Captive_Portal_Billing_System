// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',               // Static export for Cloudflare Pages
  eslint: {
    ignoreDuringBuilds: false,    // Change to true to ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true,      // Allow build even if TypeScript errors exist
  },
  images: {
    unoptimized: true,            // Keep unoptimized images
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL, // ESM-compatible env
  },
  webpack(config) {
    // Split large chunks to avoid Cloudflare Pages 25MB limit
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 25 * 1024 * 1024,  // 25MB
    };
    return config;
  },
};

export default nextConfig;
