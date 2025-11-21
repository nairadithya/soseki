import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow larger body sizes for PDF uploads
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
