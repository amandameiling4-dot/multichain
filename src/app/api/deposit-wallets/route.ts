import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/deposit-wallets - public endpoint to fetch active deposit wallets */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get("network");

  const wallets = await prisma.depositWallet.findMany({
    where: {
      isActive: true,
      ...(network ? { network } : {}),
    },
    select: { id: true, network: true, address: true, label: true },
    orderBy: { createdAt: "asc" },
  });
  return Response.json(wallets);
}
