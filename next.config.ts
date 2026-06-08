import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable strict type checking
  typescript: {
    // Fail the build if types are wrong
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warn about eslint issues but don't fail build
    ignoreDuringBuilds: false,
  },
  // Performance optimization
  swcMinify: true,
  // Headers for security
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
      ],
    },
  ],
};

export default nextConfig;
