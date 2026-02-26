import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/stakes?userId=... */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId is required" }, { status: 400 });

  const stakes = await prisma.stake.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(stakes);
}

/** POST /api/stakes - create stake */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, assetSymbol, amount, apyRate } = body as {
    userId?: string;
    assetSymbol?: string;
    amount?: number;
    apyRate?: number;
  };

  if (!userId || !assetSymbol || amount == null || apyRate == null) {
    return Response.json({ error: "userId, assetSymbol, amount, and apyRate are required" }, { status: 400 });
  }

  const stake = await prisma.stake.create({
    data: { userId, assetSymbol, amount, apyRate },
  });
  return Response.json(stake, { status: 201 });
}

/** PUT /api/stakes - claim or withdraw stake */
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, action } = body as { id?: string; action?: string };

  if (!id || !action) return Response.json({ error: "id and action are required" }, { status: 400 });

  if (action === "claim") {
    const stake = await prisma.stake.update({
      where: { id },
      data: { claimedAt: new Date() },
    });
    return Response.json(stake);
  } else if (action === "withdraw") {
    const stake = await prisma.stake.update({
      where: { id },
      data: { status: "WITHDRAWN", endDate: new Date() },
    });
    return Response.json(stake);
  }

  return Response.json({ error: "action must be claim or withdraw" }, { status: 400 });
}
