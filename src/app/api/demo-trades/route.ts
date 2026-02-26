import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/demo-trades?userId=... */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId is required" }, { status: 400 });

  const trades = await prisma.demoTrade.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return Response.json(trades);
}

/** POST /api/demo-trades - place demo trade */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, assetSymbol, direction, amount } = body as {
    userId?: string;
    assetSymbol?: string;
    direction?: string;
    amount?: number;
  };

  if (!userId || !assetSymbol || !direction || amount == null) {
    return Response.json({ error: "userId, assetSymbol, direction, and amount are required" }, { status: 400 });
  }
  if (direction !== "UP" && direction !== "DOWN") {
    return Response.json({ error: "direction must be UP or DOWN" }, { status: 400 });
  }

  // Simulate random outcome
  const result: "WIN" | "LOSS" = Math.random() > 0.5 ? "WIN" : "LOSS";
  const profit = result === "WIN" ? amount * 0.85 : -amount;

  const trade = await prisma.demoTrade.create({
    data: {
      userId,
      assetSymbol,
      direction: direction as "UP" | "DOWN",
      amount,
      result,
      profit,
    },
  });
  return Response.json(trade, { status: 201 });
}
