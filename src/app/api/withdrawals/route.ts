import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/withdrawals?userId=...
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId is required" }, { status: 400 });

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(withdrawals);
}

/**
 * POST /api/withdrawals — create a withdrawal request
 * Body: { userId, amount, currency?, destination, method? }
 */
export async function POST(request: NextRequest) {
  const session = getSession(request);
  const body = await request.json() as {
    userId?: string;
    amount?: number;
    currency?: string;
    destination?: string;
    method?: "CRYPTO" | "BANK";
    fee?: number;
  };

  const userId = session?.userId ?? body.userId;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, currency = "USDT", destination, method = "CRYPTO", fee = 0 } = body;

  if (amount == null || !destination) {
    return Response.json(
      { error: "amount and destination are required" },
      { status: 400 }
    );
  }

  // Check if user is frozen
  const user = await prisma.appUser.findUnique({ where: { id: userId } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });
  if (user.isFrozen) return Response.json({ error: "Account is frozen" }, { status: 403 });

  const withdrawal = await prisma.withdrawal.create({
    data: { userId, amount, currency, destination, method, fee },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      title: "Withdrawal Requested",
      body: `Your withdrawal of ${amount} ${currency} to ${destination} is pending review.`,
      type: "INFO",
    },
  }).catch(() => {});

  return Response.json(withdrawal, { status: 201 });
}
