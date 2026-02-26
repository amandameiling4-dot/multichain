import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/chat?userId=... */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId is required" }, { status: 400 });

  // Get or find latest open session
  let session = await prisma.chatSession.findFirst({
    where: { userId, status: "OPEN" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ session });
}

/** POST /api/chat - create message (creates session if needed) */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, content, sender } = body as {
    userId?: string;
    content?: string;
    sender?: string;
  };

  if (!userId || !content) {
    return Response.json({ error: "userId and content are required" }, { status: 400 });
  }

  // Find or create open session
  let session = await prisma.chatSession.findFirst({
    where: { userId, status: "OPEN" },
    orderBy: { createdAt: "desc" },
  });

  if (!session) {
    session = await prisma.chatSession.create({
      data: { userId },
    });
  }

  const message = await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      sender: sender ?? "user",
      content,
    },
  });

  await prisma.chatSession.update({
    where: { id: session.id },
    data: { lastMessage: content, lastMsgAt: new Date() },
  });

  return Response.json(message, { status: 201 });
}
