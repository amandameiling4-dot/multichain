import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/wallets */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const wallets = await prisma.depositWallet.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(wallets);
}

/** POST /api/admin/wallets */
export async function POST(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { network, address, label } = body as {
    network?: string;
    address?: string;
    label?: string;
  };

  if (!network || !address) {
    return Response.json({ error: "network and address are required" }, { status: 400 });
  }

  const wallet = await prisma.depositWallet.create({ data: { network, address, label } });
  return Response.json(wallet, { status: 201 });
}

/** PUT /api/admin/wallets */
export async function PUT(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { id, ...data } = body as { id?: string; [key: string]: unknown };
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  const wallet = await prisma.depositWallet.update({ where: { id }, data });
  return Response.json(wallet);
}

/** DELETE /api/admin/wallets?id=... */
export async function DELETE(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  await prisma.depositWallet.update({ where: { id }, data: { isActive: false } });
  return Response.json({ success: true });
}
