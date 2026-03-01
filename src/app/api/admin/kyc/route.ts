import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/kyc - pending KYC submissions */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "PENDING";

  const submissions = await prisma.kYCSubmission.findMany({
    where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
    include: { user: { select: { walletAddress: true, displayName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(submissions);
}

/** PUT /api/admin/kyc - approve or reject KYC */
export async function PUT(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { id, status, reviewNote } = body as {
    id?: string;
    status?: string;
    reviewNote?: string;
  };

  if (!id || !status) return Response.json({ error: "id and status are required" }, { status: 400 });
  if (status !== "APPROVED" && status !== "REJECTED") {
    return Response.json({ error: "status must be APPROVED or REJECTED" }, { status: 400 });
  }

  const submission = await prisma.kYCSubmission.update({
    where: { id },
    data: { status: status as "APPROVED" | "REJECTED", ...(reviewNote !== undefined && { reviewNote }), reviewedAt: new Date() },
  });

  // Notify user
  await prisma.notification.create({
    data: {
      userId: submission.userId,
      title: status === "APPROVED" ? "KYC Approved" : "KYC Rejected",
      body:
        status === "APPROVED"
          ? "Your identity verification has been approved."
          : `Your KYC was rejected. ${reviewNote ?? ""}`.trim(),
      type: "KYC",
    },
  }).catch(() => {});

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId: "admin-api",
      userId: submission.userId,
      action: `KYC_${status}`,
      entityType: "KYCSubmission",
      entityId: id,
      after: JSON.stringify({ status, reviewNote }),
    },
  }).catch(() => {});

  return Response.json(submission);
}
