import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/trading-levels - public endpoint to fetch active trading levels */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const levels = await prisma.tradingLevel.findMany({
    where: {
      isActive: true,
      ...(type ? { type: type as "BINARY" | "ARBITRAGE" } : {}),
    },
    orderBy: { minAmount: "asc" },
  });
  return Response.json(levels);
}
