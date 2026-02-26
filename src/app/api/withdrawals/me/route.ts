import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/withdrawals/me — list current user's withdrawals
 */
export async function GET(request: NextRequest) {
  const session = getSession(request);
  const { searchParams } = new URL(request.url);
  const userId = session?.userId ?? searchParams.get("userId");
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(withdrawals);
}
