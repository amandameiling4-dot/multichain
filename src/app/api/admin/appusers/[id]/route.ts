import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/appusers/[id] — get single user with history */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAdminKey(request)) return unauthorizedResponse();
  const { id } = await params;

  const user = await prisma.appUser.findUnique({
    where: { id },
    include: {
      kycSubmissions: { orderBy: { createdAt: "desc" }, take: 5 },
      depositProofs: { orderBy: { createdAt: "desc" }, take: 10 },
      withdrawals: { orderBy: { createdAt: "desc" }, take: 10 },
      notifications: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: {
        select: { binaryTrades: true, depositProofs: true, kycSubmissions: true, withdrawals: true },
      },
    },
  });

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });
  return Response.json(user);
}

/**
 * PATCH /api/admin/appusers/[id] — update user (freeze/unfreeze, role, vip, points)
 * Body: { isFrozen?, role?, vipLevel?, points?, mode?, adminId? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAdminKey(request)) return unauthorizedResponse();
  const { id } = await params;

  const body = await request.json() as {
    isFrozen?: boolean;
    role?: string;
    vipLevel?: number;
    points?: number;
    mode?: string;
  };

  const { isFrozen, role, vipLevel, points, mode } = body;

  const before = await prisma.appUser.findUnique({ where: { id } });
  if (!before) return Response.json({ error: "User not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};
  if (isFrozen !== undefined) updateData.isFrozen = isFrozen;
  if (role !== undefined) updateData.role = role;
  if (vipLevel !== undefined) updateData.vipLevel = vipLevel;
  if (points !== undefined) updateData.points = points;
  if (mode !== undefined) updateData.mode = mode;

  const user = await prisma.appUser.update({ where: { id }, data: updateData });
  // Determine action label
  let action = "USER_UPDATED";
  if (isFrozen === true) action = "USER_FROZEN";
  else if (isFrozen === false) action = "USER_UNFROZEN";
  else if (role !== undefined) action = "USER_ROLE_CHANGED";

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId: "admin-api",
      userId: id,
      action,
      entityType: "AppUser",
      entityId: id,
      before: JSON.stringify({ isFrozen: before.isFrozen, role: before.role }),
      after: JSON.stringify(updateData),
    },
  }).catch(() => {});

  // Notify user if frozen/unfrozen
  if (isFrozen !== undefined) {
    await prisma.notification.create({
      data: {
        userId: id,
        title: isFrozen ? "Account Frozen" : "Account Unfrozen",
        body: isFrozen
          ? "Your account has been frozen. Please contact support."
          : "Your account has been reactivated.",
        type: isFrozen ? "WARNING" : "SUCCESS",
      },
    }).catch(() => {});
  }

  return Response.json(user);
}
