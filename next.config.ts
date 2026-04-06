import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Required for GitHub Pages deployment to a sub-path
  basePath: '/Mathly',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
