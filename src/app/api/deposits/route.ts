import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/deposits?userId=...
 * List deposit proofs for a user (alias for /api/uploads).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId is required" }, { status: 400 });

  const proofs = await prisma.depositProof.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(proofs);
}

/**
 * POST /api/deposits — submit a deposit proof
 */
export async function POST(request: NextRequest) {
  const body = await request.json() as {
    userId?: string;
    amount?: number;
    currency?: string;
    network?: string;
    txHash?: string;
    screenshot?: string;
  };

  const { userId, amount, network, txHash, screenshot, currency } = body;

  if (!userId || amount == null || !network || !txHash) {
    return Response.json(
      { error: "userId, amount, network, and txHash are required" },
      { status: 400 }
    );
  }

  const proof = await prisma.depositProof.create({
    data: { userId, amount, network, txHash, ...(screenshot !== undefined && { screenshot }) },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      title: "Deposit Submitted",
      body: `Your deposit of ${amount} ${currency ?? "USDT"} via ${network} has been received and is under review.`,
      type: "DEPOSIT",
    },
  }).catch(() => {});

  return Response.json(proof, { status: 201 });
}
