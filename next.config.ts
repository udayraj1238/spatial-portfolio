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
  
  // ━━━ Security Headers ━━━
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        // Prevents MIME-type sniffing
        { key: "X-Content-Type-Options", value: "nosniff" },

        // Prevents this site from being embedded in iframes (clickjacking)
        { key: "X-Frame-Options", value: "DENY" },

        // Controls referrer info sent with requests
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

        // Restricts which browser features can be used
        { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },

        // HSTS: forces HTTPS for 2 years, including subdomains
        // Add to preload list at https://hstspreload.org when ready
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },

        // CSP: the actual XSS defence (replaces deprecated X-XSS-Protection)
        // ── What each directive does ──────────────────────────────────────
        // default-src 'self'          → block everything not listed below
        // script-src 'unsafe-inline' 'unsafe-eval' → required by Next.js/React Three Fiber
        // style-src 'unsafe-inline'   → required by inline CSS-in-JS (ChatTerminal)
        // img-src data: blob:         → Three.js and canvas textures
        // font-src fonts.gstatic.com  → Google Fonts (Geist font)
        // connect-src *.groq.com      → Groq API streaming
        //             *.supabase.co   → Supabase analytics
        // worker-src blob:            → Next.js service workers
        // frame-ancestors 'none'      → replaces X-Frame-Options (belt + suspenders)
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://*.groq.com https://*.supabase.co",
            "worker-src blob:",
            "frame-ancestors 'none'",
          ].join("; "),
        },

        // NOTE: X-XSS-Protection intentionally REMOVED.
        // It was deprecated by Chrome in 2019, does nothing in modern browsers,
        // and can create vulnerabilities in old IE. CSP above is the correct replacement.
      ],
    },
  ],
};

export default nextConfig;
