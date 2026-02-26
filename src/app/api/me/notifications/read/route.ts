import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/me/notifications/read
 * Body: { id? } — marks one or all notifications as read.
 */
export async function POST(request: NextRequest) {
  const session = getSession(request);
  const body = await request.json() as { id?: string; userId?: string };
  const userId = session?.userId ?? body.userId;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (body.id) {
    await prisma.notification.update({ where: { id: body.id }, data: { isRead: true } });
  } else {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
  return Response.json({ success: true });
}
