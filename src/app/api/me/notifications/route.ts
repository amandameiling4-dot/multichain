import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/me/notifications
 * Returns the current user's notifications.
 * Supports legacy ?userId= param for backwards-compat.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let userId = searchParams.get("userId");

  if (!userId) {
    const session = getSession(request);
    if (session) userId = session.userId;
  }

  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return Response.json(notifications);
}
