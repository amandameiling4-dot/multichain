import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/binary-trades?userId=... */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId is required" }, { status: 400 });

  const trades = await prisma.binaryTrade.findMany({
    where: { userId },
    include: { asset: { select: { symbol: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return Response.json(trades);
}

/** POST /api/binary-trades - place trade */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, assetId, direction, amount, expiry, payoutPct, entryPrice } = body as {
    userId?: string;
    assetId?: string;
    direction?: string;
    amount?: number;
    expiry?: number;
    payoutPct?: number;
    entryPrice?: number;
  };

  if (!userId || !assetId || !direction || amount == null || !expiry) {
    return Response.json({ error: "userId, assetId, direction, amount, and expiry are required" }, { status: 400 });
  }
  if (direction !== "UP" && direction !== "DOWN") {
    return Response.json({ error: "direction must be UP or DOWN" }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + expiry * 1000);
  const trade = await prisma.binaryTrade.create({
    data: {
      userId,
      assetId,
      direction: direction as "UP" | "DOWN",
      amount,
      expiry,
      payoutPct: payoutPct ?? 85,
      entryPrice: entryPrice ?? null,
      expiresAt,
    },
    include: { asset: { select: { symbol: true, name: true } } },
  });
  return Response.json(trade, { status: 201 });
}

/** PUT /api/binary-trades - settle trade */
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, exitPrice, outcome } = body as {
    id?: string;
    exitPrice?: number;
    outcome?: string;
  };

  if (!id || !outcome) {
    return Response.json({ error: "id and outcome are required" }, { status: 400 });
  }
  if (outcome !== "WIN" && outcome !== "LOSS") {
    return Response.json({ error: "outcome must be WIN or LOSS" }, { status: 400 });
  }

  const existing = await prisma.binaryTrade.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Trade not found" }, { status: 404 });

  const profit = outcome === "WIN"
    ? Number(existing.amount) * (Number(existing.payoutPct) / 100)
    : -Number(existing.amount);

  const trade = await prisma.binaryTrade.update({
    where: { id },
    data: {
      exitPrice: exitPrice ?? null,
      outcome: outcome as "WIN" | "LOSS",
      profit,
      status: "SETTLED",
      settledAt: new Date(),
    },
  });
  return Response.json(trade);
}
