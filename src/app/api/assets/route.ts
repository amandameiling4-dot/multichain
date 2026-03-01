import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/assets
 * Returns all active trading assets.
 */
export async function GET() {
  const assets = await prisma.asset.findMany({
    where: { isActive: true },
    orderBy: { symbol: "asc" },
  });
  return Response.json(assets);
}

/**
 * POST /api/assets
 * Create a new trading asset. Requires admin API key.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { symbol, name, logoUrl } = body as {
    symbol?: string;
    name?: string;
    logoUrl?: string;
  };

  if (!symbol || !name) {
    return Response.json(
      { error: "symbol and name are required" },
      { status: 400 }
    );
  }

  const asset = await prisma.asset.create({
    data: { symbol: symbol.toUpperCase(), name, ...(logoUrl !== undefined && { logoUrl }) },
  });
  return Response.json(asset, { status: 201 });
}
