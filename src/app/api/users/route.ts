import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/users?walletAddress=0x... */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("walletAddress");
  if (!walletAddress) {
    return Response.json({ error: "walletAddress is required" }, { status: 400 });
  }
  const user = await prisma.appUser.findUnique({ where: { walletAddress } });
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(user);
}

/** POST /api/users - create user with walletAddress */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { walletAddress } = body as { walletAddress?: string };
  if (!walletAddress) {
    return Response.json({ error: "walletAddress is required" }, { status: 400 });
  }

  const userId = String(Math.floor(10000 + Math.random() * 90000));
  const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  const existing = await prisma.appUser.findUnique({ where: { walletAddress } });
  if (existing) return Response.json(existing);

  const user = await prisma.appUser.create({
    data: { walletAddress, userId, referralCode },
  });
  return Response.json(user, { status: 201 });
}
