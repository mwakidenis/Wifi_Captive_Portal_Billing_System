/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',         // Static export for Cloudflare Pages
  eslint: {
    ignoreDuringBuilds: false, // Keep ESLint checks, but can change to true to ignore
  },
  typescript: {
    ignoreBuildErrors: true,  // ALLOW build even if TypeScript errors exist
  },
  images: {
    unoptimized: true,  // Keep unoptimized images or configure domain-based optimization
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL, // Your environment variable
  },
  webpack(config) {
    // Split large files to avoid exceeding Cloudflare Pages limit
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 25 * 1024 * 1024, // Split files if they are larger than 25 MB
    };
    return config;
  },
};

export default nextConfig;
