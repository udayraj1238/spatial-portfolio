import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ━━━ Performance ━━━
  productionBrowserSourceMaps: false,
  
  // ━━━ Type Safety ━━━
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ━━━ Images ━━━
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  
  // ━━━ Headers & Security ━━━
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
};

export default nextConfig;
