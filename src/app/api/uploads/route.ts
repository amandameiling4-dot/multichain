import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/uploads?userId=... */
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

/** POST /api/uploads - submit deposit proof */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, amount, network, txHash, screenshot } = body as {
    userId?: string;
    amount?: number;
    network?: string;
    txHash?: string;
    screenshot?: string;
  };

  if (!userId || amount == null || !network || !txHash) {
    return Response.json({ error: "userId, amount, network, and txHash are required" }, { status: 400 });
  }

  const proof = await prisma.depositProof.create({
    data: { userId, amount, network, txHash, screenshot },
  });
  return Response.json(proof, { status: 201 });
}
