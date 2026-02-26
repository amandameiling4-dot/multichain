# MultiChain — GitHub Copilot Instructions

## Project overview

MultiChain is a **real-time trading data dapp** with an admin control panel.

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 16 (App Router, TypeScript) |
| Styling    | Tailwind CSS v4                     |
| Database   | Neon Postgres (serverless Postgres) |
| ORM        | Prisma v7 (`prisma-client-js`)      |
| Hosting    | Vercel                              |
| Auth       | API-key-based admin auth            |
| Streaming  | Server-Sent Events (SSE)            |

---

## Directory structure

```
multichain/
├── prisma/
│   ├── schema.prisma       # Data models (Asset, Trade, PriceSnapshot, AdminUser, Alert, SystemSetting)
│   ├── migrations/         # Prisma migration files
│   └── seed.ts             # Database seeder (tsx prisma/seed.ts)
├── prisma.config.ts        # Prisma config — uses DATABASE_URL_UNPOOLED for migrations
├── src/
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client singleton (dev-safe with global caching)
│   │   └── auth.ts         # Admin API-key validation helper
│   ├── components/
│   │   ├── TradeFeed.tsx   # Real-time SSE trade table component
│   │   └── PriceChart.tsx  # Price history chart with interval selector
│   └── app/
│       ├── page.tsx         # Trading dashboard (public)
│       ├── admin/
│       │   └── page.tsx    # Admin panel (key-protected, client-side)
│       ├── api/
│       │   ├── assets/route.ts            # GET/POST assets
│       │   ├── trades/route.ts            # GET/POST trades
│       │   ├── prices/route.ts            # GET/POST price snapshots
│       │   ├── stream/route.ts            # GET SSE stream of live trades
│       │   └── admin/
│       │       ├── users/route.ts         # Admin user management
│       │       ├── alerts/route.ts        # Alert CRUD
│       │       └── settings/route.ts     # System settings
│       └── layout.tsx
├── .env.example            # Template for required environment variables
├── vercel.json             # Vercel build config (runs vercel-build script)
└── package.json
```

---

## Key conventions

### Prisma
- Always import the client from `@/lib/prisma` (singleton, never `new PrismaClient()` inline).
- Schema uses `directUrl = env("DATABASE_URL_UNPOOLED")` so Prisma can run migrations
  through the direct connection on Neon without PgBouncer interfering.
- Run `npm run db:generate` after editing the schema locally.
- Run `npm run db:migrate` to apply migrations in production.
- Seed data: `npm run db:seed`.

### API routes
- All routes are in `src/app/api/` (Next.js App Router).
- Admin routes validate the `Authorization: Bearer <ADMIN_API_KEY>` header using `validateAdminKey()` from `@/lib/auth.ts`.
- Always set `export const dynamic = "force-dynamic"` on API routes that read from the DB.
- Return `Response.json(...)` (not `NextResponse.json`) for simplicity.

### Real-time data
- Use Server-Sent Events via `GET /api/stream` (polling the DB every 2 s).
- Client-side: use the native `EventSource` API (no additional library needed).
- The `TradeFeed` component manages the `EventSource` lifecycle via `useEffect`.

### Admin panel
- The admin page (`/admin`) is a **client component** that reads the API key from
  `sessionStorage` and gates itself behind an API call to `/api/admin/settings`.
- Never expose the admin key in page source or cookies.

### Styling
- Use Tailwind utility classes. Dark mode is the default (`bg-gray-950` backgrounds).
- Avoid custom CSS files except for global resets in `globals.css`.

---

## Environment variables

| Variable               | Purpose                                                  |
|------------------------|----------------------------------------------------------|
| `DATABASE_URL`         | Pooled Neon connection (PgBouncer) — runtime             |
| `DATABASE_URL_UNPOOLED`| Direct Neon connection — Prisma migrations only          |
| `ADMIN_API_KEY`        | Secret key for admin API endpoints                       |
| `NEXT_PUBLIC_APP_URL`  | Public base URL of the app                               |

Set these in Vercel → Project → Settings → Environment Variables.

---

## Build & deploy

```bash
# Local development
cp .env.example .env.local   # fill in your Neon credentials
npm install
npm run db:generate          # generate Prisma client
npm run db:migrate           # apply migrations
npm run db:seed              # optional: seed sample data
npm run dev                  # start Next.js dev server

# Production (Vercel runs this automatically via vercel.json)
npm run vercel-build         # prisma generate → prisma migrate deploy → next build
```

---

## Adding new features (Copilot guidance)

- **New DB model**: add to `prisma/schema.prisma`, run `npx prisma migrate dev --name <name>`, then `npm run db:generate`.
- **New API route**: create `src/app/api/<feature>/route.ts`, export `GET`/`POST`/`PUT`/`DELETE`, add `export const dynamic = "force-dynamic"`.
- **New admin endpoint**: wrap handler with `validateAdminKey()` guard.
- **New page**: create `src/app/<route>/page.tsx`. Server components are default; add `"use client"` for interactivity.
- **New component**: place in `src/components/`, use Tailwind for styling.
