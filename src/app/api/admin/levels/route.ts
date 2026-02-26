import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/levels */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const levels = await prisma.tradingLevel.findMany({
    where: type ? { type: type as "BINARY" | "ARBITRAGE" } : undefined,
    orderBy: { createdAt: "asc" },
  });
  return Response.json(levels);
}

/** POST /api/admin/levels */
export async function POST(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { name, type, minAmount, maxAmount, payoutPct, description } = body as {
    name?: string;
    type?: string;
    minAmount?: number;
    maxAmount?: number;
    payoutPct?: number;
    description?: string;
  };

  if (!name || !type || minAmount == null || maxAmount == null || payoutPct == null) {
    return Response.json({ error: "name, type, minAmount, maxAmount, and payoutPct are required" }, { status: 400 });
  }

  const level = await prisma.tradingLevel.create({
    data: {
      name,
      type: type as "BINARY" | "ARBITRAGE",
      minAmount,
      maxAmount,
      payoutPct,
      description,
    },
  });
  return Response.json(level, { status: 201 });
}

/** PUT /api/admin/levels */
export async function PUT(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { id, ...data } = body as { id?: string; [key: string]: unknown };
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  const level = await prisma.tradingLevel.update({ where: { id }, data });
  return Response.json(level);
}

/** DELETE /api/admin/levels?id=... */
export async function DELETE(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  await prisma.tradingLevel.delete({ where: { id } });
  return Response.json({ success: true });
}
