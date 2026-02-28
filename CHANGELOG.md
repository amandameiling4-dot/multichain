# Changelog

All notable changes to MultiChain are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] — 2026-02-28

### Fixed
- **KYC page toggle logic** (`src/app/kyc/page.tsx`): The "Resubmit KYC" button
  now correctly sets `submitted` to `true` so the KYC form is displayed when
  clicked. Previously it was a no-op (setting `false` when the value was already
  `false`), preventing users with a rejected submission from resubmitting. The
  `onSuccess` callback now correctly sets `submitted` back to `false` after a
  successful resubmission so the updated status block is shown.

### Added
- **Health check endpoint** (`GET /api/health`): Returns
  `{ status, version, uptime, db: { status, latencyMs }, timestamp }`.
  HTTP 200 when the database is reachable; HTTP 503 (with `console.error`) when
  the DB is unreachable. Designed for uptime monitors and Vercel health probes.
- **HTTP security headers** (`next.config.ts`): Applied globally via
  `async headers()` on `/(.*)`; covers:
  - `Content-Security-Policy` — restricts script/style/image/connect sources;
    `'unsafe-inline'` is required for Next.js hydration and Tailwind CSS.
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  
  The deprecated `X-XSS-Protection` header is intentionally excluded — it is
  superseded by CSP and can introduce vulnerabilities in older browsers.
- **`public/robots.txt`**: Allows crawlers only on `/` and `/register`;
  disallows `/admin`, `/wallet`, `/kyc`, `/history`, `/settings`, `/support`,
  `/trade`, `/futures`, `/arbitrage`, `/demo`, `/p2p`, `/borrow`, `/withdraw`,
  `/notifications`, and all `/api/` routes.
- **`src/app/sitemap.ts`**: Next.js App Router sitemap — emits `/sitemap.xml`
  containing only the two public pages (`/` and `/register`), consistent with
  `robots.txt`. Uses `NEXT_PUBLIC_APP_URL` for the base URL.

