import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/me — returns current user profile + KYC status.
 * Requires session cookie OR walletAddress query param (legacy localStorage flow).
 */
export async function GET(request: NextRequest) {
  // Try session cookie first
  let userId: string | null = null;
  const session = getSession(request);
  if (session) {
    userId = session.userId;
  } else {
    // Fall back to walletAddress query param for backwards-compat
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");
    if (walletAddress) {
      const user = await prisma.appUser.findUnique({ where: { walletAddress } });
      if (user) userId = user.id;
    }
  }

  if (!userId) return unauthorizedResponse();

  const user = await prisma.appUser.findUnique({
    where: { id: userId },
    include: {
      kycSubmissions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, fullName: true, createdAt: true, reviewNote: true },
      },
    },
  });

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  return Response.json({
    id: user.id,
    walletAddress: user.walletAddress,
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    mode: user.mode,
    vipLevel: user.vipLevel,
    isRegistered: user.isRegistered,
    isFrozen: user.isFrozen,
    points: user.points,
    referralCode: user.referralCode,
    createdAt: user.createdAt,
    kyc: user.kycSubmissions[0] ?? null,
  });
}

/** PATCH /api/me — update profile (displayName, email) */
export async function PATCH(request: NextRequest) {
  const session = getSession(request);
  if (!session) {
    // Fall back: check walletAddress in body
    const body = await request.json() as { walletAddress?: string; displayName?: string; email?: string };
    if (!body.walletAddress) return unauthorizedResponse();
    const user = await prisma.appUser.findUnique({ where: { walletAddress: body.walletAddress } });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });
    const updated = await prisma.appUser.update({
      where: { id: user.id },
      data: { displayName: body.displayName, email: body.email },
    });
    return Response.json({ id: updated.id, displayName: updated.displayName, email: updated.email });
  }

  const body = await request.json() as { displayName?: string; email?: string };
  const updated = await prisma.appUser.update({
    where: { id: session.userId },
    data: { displayName: body.displayName, email: body.email },
  });
  return Response.json({ id: updated.id, displayName: updated.displayName, email: updated.email });
}
