# ⛓️ MultiChain — Real-Time Trading Dapp

A real-time multi-chain trading data dashboard with admin control panel.

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 16 (App Router, TypeScript) |
| Styling    | Tailwind CSS v4                     |
| Database   | Neon Postgres (serverless Postgres) |
| ORM        | Prisma v7                           |
| Hosting    | Vercel                              |
| Streaming  | Server-Sent Events (SSE)            |

## Features

- 📈 **Live trade feed** — real-time trade stream via Server-Sent Events  
- 📊 **Price history chart** — candlestick OHLCV data with interval selector (1m / 5m / 1h / 1d)  
- 🔑 **Admin panel** — asset management, price/volume alerts, system settings  
- 🗄️ **Neon Postgres** — serverless Postgres with connection pooling  
- 🔄 **Prisma ORM** — type-safe queries, migrations, and seed data  

## Getting started

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

Edit `.env.local` and fill in your [Neon](https://neon.tech) connection strings and an `ADMIN_API_KEY`.

### 3. Run database migrations

```bash
npm run db:generate   # generate Prisma client
npm run db:migrate    # apply migrations to your Neon database
npm run db:seed       # optional: populate sample data
```

### 4. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the trading dashboard and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

## Deploying to Vercel

1. Import this repository in [Vercel](https://vercel.com/new).
2. Set the following environment variables in Vercel → Project → Settings → Environment Variables:
   - `DATABASE_URL` — pooled Neon connection URL
   - `DATABASE_URL_UNPOOLED` — direct Neon connection URL (for migrations)
   - `ADMIN_API_KEY` — a secure random string (`openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL` — your Vercel deployment URL
3. Before deploying (or after schema changes), apply migrations from your local machine with your Neon credentials configured in `.env.local`:
   ```bash
   npm run db:migrate
   ```
4. Vercel will automatically run `npm run vercel-build` which:
   - Generates the Prisma client (`prisma generate`)
   - Builds the Next.js application (`next build`)

## API reference

| Method | Endpoint                  | Description                  | Auth    |
|--------|---------------------------|------------------------------|---------|
| GET    | `/api/assets`             | List active assets           | Public  |
| POST   | `/api/assets`             | Create asset                 | Public  |
| GET    | `/api/trades`             | List trades (paginated)      | Public  |
| POST   | `/api/trades`             | Record a trade               | Public  |
| GET    | `/api/prices`             | Price snapshots for an asset | Public  |
| POST   | `/api/prices`             | Upsert a price snapshot      | Public  |
| GET    | `/api/stream`             | SSE real-time trade stream   | Public  |
| GET    | `/api/admin/alerts`       | List alerts                  | Admin 🔑|
| POST   | `/api/admin/alerts`       | Create alert                 | Admin 🔑|
| DELETE | `/api/admin/alerts?id=`   | Deactivate alert             | Admin 🔑|
| GET    | `/api/admin/settings`     | List system settings         | Admin 🔑|
| PUT    | `/api/admin/settings`     | Upsert a system setting      | Admin 🔑|
| GET    | `/api/admin/users`        | List admin users             | Admin 🔑|
| POST   | `/api/admin/users`        | Create admin user            | Admin 🔑|

Admin endpoints require `Authorization: Bearer <ADMIN_API_KEY>` header.

## Project structure

```
multichain/
├── prisma/
│   ├── schema.prisma       # Data models
│   ├── migrations/         # Migration files
│   └── seed.ts             # Database seeder
├── prisma.config.ts        # Prisma config
├── src/
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client singleton
│   │   └── auth.ts         # Admin auth helper
│   ├── components/
│   │   ├── TradeFeed.tsx   # Real-time trade table
│   │   └── PriceChart.tsx  # Price history chart
│   └── app/
│       ├── page.tsx        # Trading dashboard
│       ├── admin/page.tsx  # Admin panel
│       └── api/            # API routes
├── .env.example
├── vercel.json
└── package.json
```

## License

MIT
