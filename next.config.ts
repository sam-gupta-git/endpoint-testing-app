import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standard webpack for build to avoid routes manifest issues
  experimental: {
    // Keep turbopack for dev but not for build
  },
};

export default nextConfig;
