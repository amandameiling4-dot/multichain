import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/alerts — list all alerts */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const alerts = await prisma.alert.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(alerts);
}

/** POST /api/admin/alerts — create a price / volume alert */
export async function POST(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { assetSymbol, condition, threshold, message } = body as {
    assetSymbol?: string;
    condition?: string;
    threshold?: number;
    message?: string;
  };

  const validConditions = ["PRICE_ABOVE", "PRICE_BELOW", "VOLUME_ABOVE"];
  if (!assetSymbol || !condition || threshold == null) {
    return Response.json(
      { error: "assetSymbol, condition, and threshold are required" },
      { status: 400 }
    );
  }
  if (!validConditions.includes(condition)) {
    return Response.json(
      { error: `condition must be one of: ${validConditions.join(", ")}` },
      { status: 400 }
    );
  }

  const alert = await prisma.alert.create({
    data: {
      assetSymbol: assetSymbol.toUpperCase(),
      condition: condition as "PRICE_ABOVE" | "PRICE_BELOW" | "VOLUME_ABOVE",
      threshold,
      ...(message !== undefined && { message }),
    },
  });
  return Response.json(alert, { status: 201 });
}

/** DELETE /api/admin/alerts?id=xxx — deactivate an alert */
export async function DELETE(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.alert.update({
    where: { id },
    data: { isActive: false },
  });
  return Response.json({ success: true });
}
