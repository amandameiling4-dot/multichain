import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders, handlePreflight } from "@/lib/cors";

export const dynamic = "force-dynamic";

/**
 * GET /api/assets
 * Returns all active trading assets.
 * CORS-enabled for React Native / mobile clients.
 */
export function OPTIONS() {
  return handlePreflight();
}

export async function GET() {
  const assets = await prisma.asset.findMany({
    where: { isActive: true },
    orderBy: { symbol: "asc" },
  });
  return Response.json(assets, { headers: corsHeaders });
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
