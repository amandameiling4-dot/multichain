import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/settings — list all system settings */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const settings = await prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  });
  return Response.json(settings);
}

/** PUT /api/admin/settings — upsert a system setting */
export async function PUT(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { key, value } = body as { key?: string; value?: string };

  if (!key || value == null) {
    return Response.json({ error: "key and value are required" }, { status: 400 });
  }

  const setting = await prisma.systemSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  return Response.json(setting);
}
