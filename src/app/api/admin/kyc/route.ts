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
    data: { status: status as "APPROVED" | "REJECTED", reviewNote, reviewedAt: new Date() },
  });
  return Response.json(submission);
}
