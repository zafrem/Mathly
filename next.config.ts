import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // If your repository is "Mathly", the basePath should match the repo name for GitHub Pages
  // basePath: '/Mathly', 
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
