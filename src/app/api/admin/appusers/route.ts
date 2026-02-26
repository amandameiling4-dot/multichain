import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/appusers */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const users = await prisma.appUser.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { binaryTrades: true, depositProofs: true, kycSubmissions: true },
      },
    },
  });
  return Response.json(users);
}

/** PUT /api/admin/appusers - update user (freeze, vip, points, mode) */
export async function PUT(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { id, isFrozen, vipLevel, points, mode, assignedAdmin } = body as {
    id?: string;
    isFrozen?: boolean;
    vipLevel?: number;
    points?: number;
    mode?: string;
    assignedAdmin?: string;
  };

  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (isFrozen !== undefined) updateData.isFrozen = isFrozen;
  if (vipLevel !== undefined) updateData.vipLevel = vipLevel;
  if (points !== undefined) updateData.points = points;
  if (mode !== undefined) updateData.mode = mode;
  if (assignedAdmin !== undefined) updateData.assignedAdmin = assignedAdmin;

  const user = await prisma.appUser.update({ where: { id }, data: updateData });
  return Response.json(user);
}

/** DELETE /api/admin/appusers?id=... */
export async function DELETE(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  await prisma.appUser.delete({ where: { id } });
  return Response.json({ success: true });
}
