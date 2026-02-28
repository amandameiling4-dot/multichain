# Changelog

All notable changes to MultiChain are documented in this file.

## [Unreleased]

### Fixed
- **KYC page toggle logic** (`src/app/kyc/page.tsx`): The "Resubmit KYC" button now correctly sets `submitted` to `true` so the KYC form is displayed when clicked. Previously it was a no-op (setting `false` when the value was already `false`), preventing users with a rejected submission from resubmitting. The `onSuccess` callback now correctly sets `submitted` back to `false` after a successful resubmission so the updated status block is shown.

### Added
- **Health check endpoint** (`GET /api/health`): Returns `{ status, db, timestamp }` with HTTP 200 when the database is reachable and HTTP 503 otherwise. Intended for uptime monitors and load-balancer health probes.
- **HTTP security headers** (via `next.config.ts`): All responses now include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` headers, hardening the app for public deployment. The deprecated `X-XSS-Protection` header is intentionally excluded as it can introduce vulnerabilities in older browsers.
- **`public/robots.txt`**: Instructs search engine crawlers to allow only the root and `/register` pages, and to disallow all user-specific routes (`/wallet`, `/kyc`, `/history`, etc.) and all `/api/` endpoints, protecting user data from being indexed.
