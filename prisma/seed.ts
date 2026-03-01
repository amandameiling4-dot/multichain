/**
 * Seed script: populates the database with sample trading data.
 * Run with: npm run db:seed
 *
 * Uses DATABASE_URL (pooled PgBouncer connection) for runtime DB access.
 * Ensure DATABASE_URL is set in your .env.local (or environment) before running.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

const ASSETS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "MATIC", name: "Polygon" },
];

const EXCHANGES = ["Binance", "Coinbase", "Kraken", "OKX", "Bybit"];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

async function main() {
  console.log("🌱 Seeding database…");

  // Upsert assets
  const assets = await Promise.all(
    ASSETS.map((a) =>
      prisma.asset.upsert({
        where: { symbol: a.symbol },
        create: a,
        update: {},
      })
    )
  );
  console.log(`✅ Upserted ${assets.length} assets`);

  // Base prices per asset
  const basePrices: Record<string, number> = {
    BTC: 65000,
    ETH: 3500,
    SOL: 170,
    AVAX: 38,
    MATIC: 0.9,
  };

  // Seed 100 trades per asset
  for (const asset of assets) {
    const base = basePrices[asset.symbol] ?? 1;
    const trades = Array.from({ length: 100 }).map((_, i) => {
      const price = base * (1 + randomBetween(-0.02, 0.02));
      const quantity = randomBetween(0.001, 10);
      const total = price * quantity;
      return {
        assetId: asset.id,
        side: Math.random() > 0.5 ? ("BUY" as const) : ("SELL" as const),
        price,
        quantity,
        total,
        exchange: EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)]!,
        tradedAt: new Date(Date.now() - i * 60_000),
      };
    });

    await prisma.trade.createMany({ data: trades, skipDuplicates: true });
  }
  console.log("✅ Seeded trades");

  // Seed 60 price snapshots per asset (1-minute intervals)
  const intervals = ["1m"] as const;
  for (const asset of assets) {
    const base = basePrices[asset.symbol] ?? 1;
    for (const interval of intervals) {
      const snapshots = Array.from({ length: 60 }).map((_, i) => {
        const open = base * (1 + randomBetween(-0.01, 0.01));
        const high = open * (1 + randomBetween(0, 0.005));
        const low = open * (1 - randomBetween(0, 0.005));
        const close = randomBetween(low, high);
        const volume = randomBetween(10, 1000) * base;
        const timestamp = new Date(Date.now() - i * 60_000);
        return { assetId: asset.id, interval, open, high, low, close, volume, timestamp };
      });

      for (const s of snapshots) {
        await prisma.priceSnapshot.upsert({
          where: {
            assetId_interval_timestamp: {
              assetId: s.assetId,
              interval: s.interval,
              timestamp: s.timestamp,
            },
          },
          create: s,
          update: {},
        });
      }
    }
  }
  console.log("✅ Seeded price snapshots");

  // Create a default admin user
  const passwordHash = await bcrypt.hash("Admin@123!", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@multichain.dev" },
    create: { email: "admin@multichain.dev", name: "Admin", passwordHash },
    update: {},
  });
  console.log("✅ Upserted admin user (admin@multichain.dev / Admin@123!)");

  // Create default system settings
  const defaultSettings = [
    { key: "REFRESH_INTERVAL_MS", value: "2000" },
    { key: "MAX_TRADES_PER_PAGE", value: "50" },
    { key: "SUPPORTED_INTERVALS", value: "1m,5m,1h,1d" },
  ];
  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      create: s,
      update: {},
    });
  }
  console.log("✅ Upserted system settings");

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
