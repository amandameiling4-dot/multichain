/**
 * GET /api/admin/binary-trades — list all binary trades across all users
 * Query params: status (ACTIVE|SETTLED|CANCELLED), userId, limit
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const userId = searchParams.get("userId") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 500);

  const trades = await prisma.binaryTrade.findMany({
    where: {
      ...(status ? { status: status as "ACTIVE" | "SETTLED" | "CANCELLED" } : {}),
      ...(userId ? { userId } : {}),
    },
    include: {
      asset: { select: { symbol: true, name: true } },
      user: { select: { walletAddress: true, displayName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return Response.json(trades);
}

/**
 * PATCH /api/admin/binary-trades — settle a trade (admin override)
 * Body: { id, outcome: WIN|LOSS, exitPrice? }
 */
export async function PATCH(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json() as {
    id?: string;
    outcome?: "WIN" | "LOSS";
    exitPrice?: number;
  };

  const { id, outcome, exitPrice } = body;
  if (!id || !outcome) {
    return Response.json({ error: "id and outcome are required" }, { status: 400 });
  }
  if (outcome !== "WIN" && outcome !== "LOSS") {
    return Response.json({ error: "outcome must be WIN or LOSS" }, { status: 400 });
  }

  const existing = await prisma.binaryTrade.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Trade not found" }, { status: 404 });

  const profit =
    outcome === "WIN"
      ? Number(existing.amount) * (Number(existing.payoutPct) / 100)
      : -Number(existing.amount);

  const trade = await prisma.binaryTrade.update({
    where: { id },
    data: {
      outcome,
      profit,
      status: "SETTLED",
      settledAt: new Date(),
      ...(exitPrice != null ? { exitPrice } : {}),
    },
  });

  // Notify user
  await prisma.notification.create({
    data: {
      userId: trade.userId,
      title: outcome === "WIN" ? "Trade Won! 🎉" : "Trade Settled",
      body:
        outcome === "WIN"
          ? `Your binary trade won! Profit: $${profit.toFixed(2)}`
          : `Your binary trade expired. Loss: $${Math.abs(profit).toFixed(2)}`,
      type: "TRADE",
    },
  }).catch(() => {});

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId: "admin-api",
      userId: trade.userId,
      action: `BINARY_TRADE_SETTLED`,
      entityType: "BinaryTrade",
      entityId: id,
      after: JSON.stringify({ outcome, profit, exitPrice }),
    },
  }).catch(() => {});

  return Response.json(trade);
}
