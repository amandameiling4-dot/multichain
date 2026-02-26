import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/deposits?status=PENDING
 * List deposit proofs with optional status filter.
 */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "PENDING";

  const proofs = await prisma.depositProof.findMany({
    where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
    include: {
      user: { select: { walletAddress: true, displayName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(proofs);
}

/**
 * PATCH /api/admin/deposits — approve or reject a deposit proof
 * Body: { id, status: APPROVED|REJECTED, adminNote? }
 */
export async function PATCH(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json() as {
    id?: string;
    status?: "APPROVED" | "REJECTED";
    adminNote?: string;
  };

  const { id, status, adminNote } = body;
  if (!id || !status) {
    return Response.json({ error: "id and status are required" }, { status: 400 });
  }
  if (status !== "APPROVED" && status !== "REJECTED") {
    return Response.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
  }

  const proof = await prisma.depositProof.update({
    where: { id },
    data: { status, adminNote, reviewedAt: new Date() },
  });

  // Notify user
  const notifTitle = status === "APPROVED" ? "Deposit Approved" : "Deposit Rejected";
  const notifBody =
    status === "APPROVED"
      ? `Your deposit of ${proof.amount} ${proof.network} has been approved.`
      : `Your deposit was rejected. ${adminNote ?? ""}`.trim();
  await prisma.notification.create({
    data: { userId: proof.userId, title: notifTitle, body: notifBody, type: "DEPOSIT" },
  }).catch(() => {});

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId: "admin-api",
      userId: proof.userId,
      action: `DEPOSIT_${status}`,
      entityType: "DepositProof",
      entityId: id,
      after: JSON.stringify({ status, adminNote }),
    },
  }).catch(() => {});

  return Response.json(proof);
}
