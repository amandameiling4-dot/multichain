import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/uploads - pending deposit proofs */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "PENDING";

  const proofs = await prisma.depositProof.findMany({
    where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
    include: { user: { select: { walletAddress: true, displayName: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(proofs);
}

/** PUT /api/admin/uploads - approve or reject deposit proof */
export async function PUT(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { id, status, adminNote } = body as {
    id?: string;
    status?: string;
    adminNote?: string;
  };

  if (!id || !status) return Response.json({ error: "id and status are required" }, { status: 400 });
  if (status !== "APPROVED" && status !== "REJECTED") {
    return Response.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
  }

  const proof = await prisma.depositProof.update({
    where: { id },
    data: { status: status as "APPROVED" | "REJECTED", ...(adminNote !== undefined && { adminNote }), reviewedAt: new Date() },
  });
  return Response.json(proof);
}
