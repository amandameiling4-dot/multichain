import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSessionCookie } from "@/lib/auth";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/verify
 * Body: { walletAddress, signature?, nonce? }
 *
 * For the MVP demo, signature verification is skipped (mock wallets).
 * In production, verify the ECDSA signature against the nonce message.
 * Creates or fetches the AppUser, then sets an HTTP-only session cookie.
 */
export async function POST(request: NextRequest) {
  const body = await request.json() as {
    walletAddress?: string;
    signature?: string;
    nonce?: string;
  };

  const { walletAddress } = body;
  if (!walletAddress) {
    return Response.json({ error: "walletAddress is required" }, { status: 400 });
  }

  // In a production SIWE flow, verify the signature against the stored nonce here.
  // For the demo, we accept any connection.

  // Delete used nonce
  await prisma.authNonce.deleteMany({ where: { walletAddress } }).catch(() => {});

  // Upsert user
  const userId = randomUUID().replace(/-/g, "").slice(0, 12);
  const referralCode = Buffer.from(walletAddress.slice(2, 10), "hex")
    .toString("base64url")
    .slice(0, 8)
    .toUpperCase();

  let user = await prisma.appUser.findUnique({ where: { walletAddress } });
  if (!user) {
    user = await prisma.appUser.create({
      data: { walletAddress, userId, referralCode },
    });
  }

  if (user.isFrozen) {
    return Response.json({ error: "Account is frozen" }, { status: 403 });
  }

  const session = { userId: user.id, walletAddress: user.walletAddress, role: user.role };
  const cookie = buildSessionCookie(session);

  return Response.json(
    { user: { id: user.id, walletAddress: user.walletAddress, role: user.role, displayName: user.displayName } },
    { headers: { "Set-Cookie": cookie } }
  );
}
