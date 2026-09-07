import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  // Only use basePath in production (e.g., for GitHub Pages)
  basePath: isProd ? '/Mathly' : '', 
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
