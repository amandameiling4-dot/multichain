import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/currencies */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const currencies = await prisma.currency.findMany({
    include: { networks: true },
    orderBy: { symbol: "asc" },
  });
  return Response.json(currencies);
}

/** POST /api/admin/currencies - create currency or network */
export async function POST(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { action } = body as { action?: string };

  if (action === "network") {
    const { currencyId, name, symbol, chainId, fee, minDeposit } = body as {
      currencyId?: string;
      name?: string;
      symbol?: string;
      chainId?: string;
      fee?: number;
      minDeposit?: number;
    };
    if (!currencyId || !name || !symbol) {
      return Response.json({ error: "currencyId, name, and symbol are required" }, { status: 400 });
    }
    const network = await prisma.network.create({
      data: { currencyId, name, symbol, ...(chainId !== undefined && { chainId }), fee: fee ?? 0, minDeposit: minDeposit ?? 0 },
    });
    return Response.json(network, { status: 201 });
  }

  const { symbol, name } = body as { symbol?: string; name?: string };
  if (!symbol || !name) {
    return Response.json({ error: "symbol and name are required" }, { status: 400 });
  }
  const currency = await prisma.currency.create({ data: { symbol, name } });
  return Response.json(currency, { status: 201 });
}
