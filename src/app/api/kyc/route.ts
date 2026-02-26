import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/kyc?userId=... */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId is required" }, { status: 400 });

  const submissions = await prisma.kYCSubmission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(submissions);
}

/** POST /api/kyc - submit KYC */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, fullName, docType, docNumber, frontImage, backImage } = body as {
    userId?: string;
    fullName?: string;
    docType?: string;
    docNumber?: string;
    frontImage?: string;
    backImage?: string;
  };

  if (!userId || !fullName || !docType || !docNumber || !frontImage || !backImage) {
    return Response.json({ error: "All KYC fields are required" }, { status: 400 });
  }

  const submission = await prisma.kYCSubmission.create({
    data: { userId, fullName, docType, docNumber, frontImage, backImage },
  });
  return Response.json(submission, { status: 201 });
}
