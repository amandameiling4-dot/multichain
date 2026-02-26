import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/chat - all sessions */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const sessions = await prisma.chatSession.findMany({
    include: {
      user: { select: { walletAddress: true, displayName: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return Response.json(sessions);
}

/** PUT /api/admin/chat - mark messages read or send reply */
export async function PUT(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { sessionId, content, action } = body as {
    sessionId?: string;
    content?: string;
    action?: string;
  };

  if (!sessionId) return Response.json({ error: "sessionId is required" }, { status: 400 });

  if (action === "reply" && content) {
    const message = await prisma.chatMessage.create({
      data: { sessionId, sender: "support", content },
    });
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { lastMessage: content, lastMsgAt: new Date() },
    });
    return Response.json(message);
  }

  // Mark all user messages as read
  await prisma.chatMessage.updateMany({
    where: { sessionId, sender: "user", readAt: null },
    data: { readAt: new Date() },
  });
  return Response.json({ success: true });
}

/** DELETE /api/admin/chat?id=... - close session */
export async function DELETE(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  await prisma.chatSession.update({ where: { id }, data: { status: "CLOSED" } });
  return Response.json({ success: true });
}
