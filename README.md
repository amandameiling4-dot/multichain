# ⛓️ MultiChain — Real-Time Trading Dapp

A real-time multi-chain trading data dashboard with admin control panel.

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 16 (App Router, TypeScript) |
| Styling    | Tailwind CSS v4                     |
| Database   | Neon Postgres (serverless Postgres) |
| ORM        | Prisma v7                           |
| Hosting    | Vercel                              |
| Auth       | HMAC-SHA256 session cookies + API key |
| Streaming  | Server-Sent Events (SSE)            |

## Features

- 📈 **Live trade feed** — real-time trade stream via Server-Sent Events  
- 📊 **Price history chart** — candlestick OHLCV data with interval selector (1m / 5m / 1h / 1d)  
- 💱 **Binary trading** — UP/DOWN binary options with configurable payout levels  
- 🎮 **Demo mode** — practice trading with virtual funds  
- 📂 **P2P / Futures / Arbitrage** — additional trading modules  
- 👛 **Wallet & withdrawals** — deposit proofs, withdrawal requests, staking  
- 🪪 **KYC** — document submission with admin review  
- 💬 **Live chat** — user ↔ support messaging  
- 🔔 **Notifications** — in-app notification centre  
- 🔑 **Admin panel** — full back-office: users, KYC, deposits, withdrawals, alerts, audit log  
- 🗄️ **Neon Postgres** — serverless Postgres with connection pooling  
- 🔄 **Prisma ORM** — type-safe queries, migrations, and seed data  

## Deploying to Vercel (primary path)

The recommended way to run MultiChain is to deploy it publicly on [Vercel](https://vercel.com/new) with a [Neon](https://neon.tech) Postgres database.

### 1. Create a Neon database

Create a free project at <https://neon.tech>. From the *Connection Details* panel, copy both:
- **Pooled** connection string — used at runtime (do **not** add `?pgbouncer=true`; the `@prisma/adapter-pg` driver handles pooling directly)
- **Direct** (unpooled) connection string — used for migrations only

### 2. Import the repository into Vercel

Import this repository in [Vercel](https://vercel.com/new). Before the first deploy, set **all** of the following environment variables in **Vercel → Project → Settings → Environment Variables**:

| Variable                | Description |
|-------------------------|-------------|
| `DATABASE_URL`          | Pooled Neon connection URL (runtime, via PgBouncer) |
| `DATABASE_URL_UNPOOLED` | Direct Neon connection URL (migrations only — must bypass PgBouncer) |
| `ADMIN_API_KEY`         | Secret for admin API endpoints — generate with `openssl rand -base64 32` |
| `SESSION_SECRET`        | Secret for signing session cookies — generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL`   | Your Vercel deployment URL (e.g. `https://your-project.vercel.app`) |

> ⚠️ **`SESSION_SECRET` is required in production.** The app will throw on startup if it is missing.

### 3. Apply database migrations (pre/post-deploy step)

Migrations must run against the **direct** connection (`DATABASE_URL_UNPOOLED`) to bypass PgBouncer, which does not support DDL transactions. Run this locally before or after each deploy (with your `.env.local` configured):

```bash
npm run db:migrate    # uses DATABASE_URL_UNPOOLED (direct connection)
```

Migrations are intentionally **not** run during the Vercel build to avoid connection errors (`P1001`).

### 4. Vercel build

Vercel automatically runs `npm run vercel-build` on each deploy, which:
- Generates the Prisma client (`prisma generate`)
- Builds the Next.js application (`next build`)

### Secret hygiene

- **Never** commit real credentials to version control. `.env*` files are already excluded by `.gitignore`.
- Store all secrets in **Vercel → Project → Settings → Environment Variables**, not in the repo.
- Rotate `ADMIN_API_KEY` and `SESSION_SECRET` regularly and update them in Vercel.
- Avoid printing `DATABASE_URL` or `DATABASE_URL_UNPOOLED` in logs, scripts, or error messages.

---

## Local development (optional)

> These steps are for contributors running the app locally. For production use, follow the Vercel deployment steps above.

### 1. Clone & install

```bash
git clone https://github.com/amandameiling4-dot/multichain.git
cd multichain
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in **all** required values. See `.env.example` for descriptions.  
`.env.local` is excluded by `.gitignore` — never commit it.

> **Neon tip:** create a free project at <https://neon.tech>. The *Connection Details* panel gives you both the pooled and direct (unpooled) URLs. Do **not** add `?pgbouncer=true` to `DATABASE_URL` — the `@prisma/adapter-pg` driver handles the pooled connection directly.

### 3. Run database migrations

```bash
npm run db:generate   # generate Prisma client (no DB connection needed)
npm run db:migrate    # apply migrations — uses DATABASE_URL_UNPOOLED (direct connection)
npm run db:seed       # optional: populate sample data — uses DATABASE_URL (pooled connection)
```

### 4. Start the dev server

```bash
npm run dev
```

| URL | Description |
|-----|-------------|
| <http://localhost:3000> | Trading dashboard |
| <http://localhost:3000/admin> | Admin panel (requires `ADMIN_API_KEY`) |
| <http://localhost:3000/register> | User registration |

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate` | Apply pending migrations (`prisma migrate deploy`) |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

## API reference

### Public endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check — `{ status, version, uptime, db: { status, latencyMs }, timestamp }` (HTTP 200 / 503) |
| GET | `/api/assets` | List active trading assets |
| POST | `/api/assets` | Create a new asset |
| GET | `/api/trades` | List trades (paginated) |
| POST | `/api/trades` | Record a trade |
| GET | `/api/prices` | Price snapshots for an asset |
| POST | `/api/prices` | Upsert a price snapshot |
| GET | `/api/stream` | SSE real-time trade stream |
| GET | `/api/trading-levels` | List trading levels |
| GET | `/api/deposit-wallets` | List deposit wallet addresses |

### Auth endpoints (session cookie)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/nonce?walletAddress=` | Get sign-in nonce for a wallet |
| POST | `/api/auth/verify` | Verify signature and set session cookie |
| POST | `/api/auth/logout` | Clear session cookie |

### User endpoints (session required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me` | Current user profile |
| PATCH | `/api/me` | Update profile (displayName, email) |
| GET | `/api/me/notifications` | User notifications |
| POST | `/api/me/notifications/read` | Mark notifications as read |
| GET/POST | `/api/users` | Lookup / register user by wallet address |
| GET/POST | `/api/binary-trades` | Binary trade history / place trade |
| GET/POST | `/api/demo-trades` | Demo trade history / place demo trade |
| GET/POST | `/api/stakes` | Staking positions |
| GET/POST | `/api/deposits` | Deposit proof submissions |
| GET | `/api/deposits/me` | Current user's deposit history |
| GET/POST | `/api/withdrawals` | Withdrawal requests |
| GET | `/api/withdrawals/me` | Current user's withdrawal history |
| GET/POST | `/api/kyc` | KYC submission |
| GET/POST | `/api/chat` | Chat sessions & messages |
| GET/POST | `/api/notifications` | Notifications |
| GET/POST | `/api/uploads` | File uploads |

### Admin endpoints (require `Authorization: Bearer <ADMIN_API_KEY>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/alerts` | Price/volume alerts |
| DELETE | `/api/admin/alerts?id=` | Deactivate alert |
| GET/PUT | `/api/admin/settings` | System settings |
| GET/POST | `/api/admin/users` | Admin user management |
| GET/PATCH | `/api/admin/appusers` | App user management |
| GET/PATCH | `/api/admin/appusers/[id]` | Single app user |
| GET/PUT | `/api/admin/kyc` | KYC review |
| GET/PUT | `/api/admin/deposits` | Deposit proof review |
| GET/PUT | `/api/admin/withdrawals` | Withdrawal processing |
| GET/POST/PUT | `/api/admin/bonuses` | Bonus programs |
| GET/POST/PUT | `/api/admin/levels` | Trading levels |
| GET/POST/PUT | `/api/admin/currencies` | Currencies & networks |
| GET/POST/PUT | `/api/admin/wallets` | Deposit wallet addresses |
| GET | `/api/admin/chat` | Chat sessions |
| GET/POST | `/api/admin/uploads` | Uploaded files |
| GET | `/api/admin/audit` | Audit log |

## Project structure

```
multichain/
├── prisma/
│   ├── schema.prisma           # All data models and enums
│   ├── migrations/             # Prisma migration history
│   └── seed.ts                 # Database seeder (assets, trades, admin user)
├── prisma.config.ts            # Prisma config — direct DB URL for migrations
├── src/
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton (lazy, build-safe)
│   │   └── auth.ts             # API-key auth, session cookie helpers, RBAC
│   ├── components/
│   │   ├── Header.tsx          # Top navigation bar
│   │   ├── Sidebar.tsx         # Left navigation sidebar
│   │   ├── TradeFeed.tsx       # Real-time SSE trade table
│   │   ├── PriceChart.tsx      # OHLCV price history chart
│   │   ├── MarketOverview.tsx  # Market overview panel
│   │   ├── PromoCarousel.tsx   # Promotional carousel
│   │   ├── WalletGate.tsx      # Wallet connection guard
│   │   ├── WalletPanel.tsx     # Wallet balance & actions
│   │   ├── BinaryTradePanel.tsx # Binary options trading UI
│   │   ├── KYCForm.tsx         # KYC document submission form
│   │   ├── RegistrationFlow.tsx # User registration wizard
│   │   ├── NotificationBell.tsx # Notification indicator
│   │   └── ChatWidget.tsx      # Live chat widget
│   └── app/
│       ├── page.tsx            # Trading dashboard (home)
│       ├── sitemap.ts          # /sitemap.xml — public pages only (/ and /register)
│       ├── admin/page.tsx      # Admin back-office panel
│       ├── register/page.tsx   # User registration page
│       ├── trade/page.tsx      # Binary options trading
│       ├── futures/page.tsx    # Futures trading
│       ├── arbitrage/page.tsx  # Arbitrage module
│       ├── demo/page.tsx       # Demo / paper trading
│       ├── p2p/page.tsx        # P2P trading
│       ├── borrow/page.tsx     # Borrowing module
│       ├── wallet/page.tsx     # Wallet & balances
│       ├── withdraw/page.tsx   # Withdrawal requests
│       ├── history/page.tsx    # Trade history
│       ├── kyc/page.tsx        # KYC verification
│       ├── notifications/page.tsx # Notifications
│       ├── settings/page.tsx   # Account settings
│       ├── support/page.tsx    # Support & live chat
│       └── api/                # All API route handlers
├── .env.example                # Environment variable template
├── vercel.json                 # Vercel build config
└── package.json
```

## License

MIT
