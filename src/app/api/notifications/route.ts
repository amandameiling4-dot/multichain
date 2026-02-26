import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/notifications?userId=... */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId is required" }, { status: 400 });

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(notifications);
}

/** POST /api/notifications - create notification */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, title, body: msgBody, type } = body as {
    userId?: string;
    title?: string;
    body?: string;
    type?: string;
  };
  if (!userId || !title || !msgBody) {
    return Response.json({ error: "userId, title, and body are required" }, { status: 400 });
  }
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      body: msgBody,
      type: (type as "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "TRADE" | "DEPOSIT" | "KYC") ?? "INFO",
    },
  });
  return Response.json(notification, { status: 201 });
}

/** PUT /api/notifications - mark notifications read */
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { userId, id } = body as { userId?: string; id?: string };
  if (!userId) return Response.json({ error: "userId is required" }, { status: 400 });

  if (id) {
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
  } else {
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  }
  return Response.json({ success: true });
}
