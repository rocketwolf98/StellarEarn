import type { NextConfig } from "next";

// ─── Security Headers ─────────────────────────────────────────────────────────
// See AGENTS.md §6.6 — OWASP A05 (Security Misconfiguration)
const securityHeaders = [
  // Enable DNS prefetching for performance
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Enforce HTTPS for 2 years (HSTS)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // NOTE: unsafe-eval required for Next.js dev mode; tighten in prod
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      // Stellar Horizon, Supabase, and IPFS gateways
      [
        "connect-src 'self'",
        "https://*.supabase.co",
        "https://horizon-testnet.stellar.org",
        "https://horizon.stellar.org",
        "https://soroban-testnet.stellar.org",
        "wss://*.supabase.co",
      ].join(" "),
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // ── Security headers applied to all routes ──────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // ── Image domains for next/image ────────────────────────────────────────
  images: {
    remotePatterns: [
      // Supabase storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
