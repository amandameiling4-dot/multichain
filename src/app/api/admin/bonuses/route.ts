import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/bonuses */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const bonuses = await prisma.bonusProgram.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(bonuses);
}

/** POST /api/admin/bonuses */
export async function POST(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { type, name, value, description } = body as {
    type?: string;
    name?: string;
    value?: number;
    description?: string;
  };

  if (!type || !name || value == null) {
    return Response.json({ error: "type, name, and value are required" }, { status: 400 });
  }

  const bonus = await prisma.bonusProgram.create({
    data: {
      type: type as "WELCOME" | "REFERRAL" | "CASHBACK" | "STAKING",
      name,
      value,
      ...(description !== undefined && { description }),
    },
  });
  return Response.json(bonus, { status: 201 });
}

/** PUT /api/admin/bonuses */
export async function PUT(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { id, ...data } = body as { id?: string; [key: string]: unknown };
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  const bonus = await prisma.bonusProgram.update({ where: { id }, data });
  return Response.json(bonus);
}
