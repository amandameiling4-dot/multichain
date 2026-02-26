import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/withdrawals?status=PENDING
 */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "PENDING";

  const withdrawals = await prisma.withdrawal.findMany({
    where: { status: status as "PENDING" | "APPROVED" | "REJECTED" | "PAID" },
    include: {
      user: { select: { walletAddress: true, displayName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(withdrawals);
}

/**
 * PATCH /api/admin/withdrawals — approve/reject/mark-paid
 * Body: { id, status: APPROVED|REJECTED|PAID, adminNote?, txRef? }
 */
export async function PATCH(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json() as {
    id?: string;
    status?: "APPROVED" | "REJECTED" | "PAID";
    adminNote?: string;
    txRef?: string;
  };

  const { id, status, adminNote, txRef } = body;
  if (!id || !status) {
    return Response.json({ error: "id and status are required" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { status, adminNote, reviewedAt: new Date() };
  if (status === "PAID") {
    updateData.paidAt = new Date();
    if (txRef) updateData.txRef = txRef;
  }

  const withdrawal = await prisma.withdrawal.update({ where: { id }, data: updateData });

  // Notify user
  const notifMessages: Record<string, string> = {
    APPROVED: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been approved and is being processed.`,
    REJECTED: `Your withdrawal was rejected. ${adminNote ?? ""}`.trim(),
    PAID: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been paid.${txRef ? ` Ref: ${txRef}` : ""}`,
  };
  await prisma.notification.create({
    data: {
      userId: withdrawal.userId,
      title: `Withdrawal ${status}`,
      body: notifMessages[status] ?? `Withdrawal status updated to ${status}.`,
      type: "INFO",
    },
  }).catch(() => {});

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId: "admin-api",
      userId: withdrawal.userId,
      action: `WITHDRAWAL_${status}`,
      entityType: "Withdrawal",
      entityId: id,
      after: JSON.stringify({ status, adminNote, txRef }),
    },
  }).catch(() => {});

  return Response.json(withdrawal);
}
