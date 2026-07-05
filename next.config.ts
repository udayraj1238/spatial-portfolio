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
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { 
          key: "Content-Security-Policy", 
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://api.groq.com https://ihrdizjoloyvmmzihfwp.supabase.co wss://ihrdizjoloyvmmzihfwp.supabase.co; img-src 'self' data: blob: https:; media-src 'self' data: blob:; worker-src 'self' blob:;" 
        },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
      ],
    },
  ],
};

export default nextConfig;
