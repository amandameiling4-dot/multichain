import type { NextConfig } from "next";
import pkg from "./package.json";

// Content-Security-Policy
// ─ script-src: 'unsafe-inline' is currently required for Next.js hydration
//   chunks injected at runtime. To harden further, replace 'unsafe-inline' with
//   a per-request nonce via Next.js Middleware (middleware.ts) and the
//   `nonce` prop on <Script> / next/headers — see:
//   https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
// ─ style-src:  'unsafe-inline' is required for Tailwind CSS utility classes.
// ─ img-src:    data: and blob: for in-browser image previews; https: for
//               remote asset logo URLs whose domain is not known at build time.
// ─ connect-src: 'self' covers fetch + SSE (/api/stream); wss: allows the
//               Next.js HMR WebSocket in development as well as the custom
//               WebSocket server at /api/ws.
// ─ frame-ancestors 'none' duplicates X-Frame-Options for CSP-aware browsers.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' ws: wss:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Forbid embedding in frames (legacy browsers)
  { key: "X-Frame-Options", value: "DENY" },
  // Reduce Referer leakage
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unused browser features
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Enforce HTTPS for 2 years (production only; Next.js strips HSTS in dev)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Content Security Policy (replaces the deprecated X-XSS-Protection)
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling these server-side packages.
  // `pg` and the Prisma adapter use native Node.js APIs that break when
  // bundled by the Next.js App Router bundler.
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "@prisma/client"],

  // Expose the package version as a build-time env var so API routes can
  // reference it without a fragile relative import path.
  env: {
    APP_VERSION: pkg.version,
  },

  async headers() {
    return [
      {
        // Apply to every route — pages, API routes, and static assets.
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
