import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/nonce?walletAddress=0x...
 * Returns a random nonce for the wallet to sign.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("walletAddress");
  if (!walletAddress) {
    return Response.json({ error: "walletAddress is required" }, { status: 400 });
  }

  const nonce = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.authNonce.upsert({
    where: { walletAddress },
    create: { walletAddress, nonce, expiresAt },
    update: { nonce, expiresAt },
  });

  return Response.json({
    nonce,
    message: `Sign this message to authenticate with MultiChain:\n\nNonce: ${nonce}\nWallet: ${walletAddress}`,
  });
}
