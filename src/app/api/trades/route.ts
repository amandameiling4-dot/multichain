import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/trades
 * Query params: assetId, side, limit (default 50), cursor
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId") ?? undefined;
  const side = searchParams.get("side") as "BUY" | "SELL" | null;
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);
  const cursor = searchParams.get("cursor") ?? undefined;

  const trades = await prisma.trade.findMany({
    where: {
      ...(assetId && { assetId }),
      ...(side && { side }),
    },
    orderBy: { tradedAt: "desc" },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    include: {
      asset: { select: { symbol: true, name: true } },
    },
  });

  const nextCursor = trades.length === limit ? trades[trades.length - 1]!.id : null;
  return Response.json({ trades, nextCursor });
}

/**
 * POST /api/trades
 * Record a new trade.
 * Body: { assetId, side, price, quantity, exchange }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { assetId, side, price, quantity, exchange } = body as {
    assetId?: string;
    side?: string;
    price?: number;
    quantity?: number;
    exchange?: string;
  };

  if (!assetId || !side || price == null || quantity == null || !exchange) {
    return Response.json(
      { error: "assetId, side, price, quantity, and exchange are required" },
      { status: 400 }
    );
  }
  if (side !== "BUY" && side !== "SELL") {
    return Response.json({ error: "side must be BUY or SELL" }, { status: 400 });
  }

  const total = price * quantity;
  const trade = await prisma.trade.create({
    data: {
      assetId,
      side,
      price,
      quantity,
      total,
      exchange,
    },
    include: { asset: { select: { symbol: true, name: true } } },
  });

  return Response.json(trade, { status: 201 });
}
