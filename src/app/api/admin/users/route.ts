import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminKey, unauthorizedResponse } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/** GET /api/admin/users — list admin users */
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const users = await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return Response.json(users);
}

/** POST /api/admin/users — create an admin user */
export async function POST(request: NextRequest) {
  if (!validateAdminKey(request)) return unauthorizedResponse();

  const body = await request.json();
  const { email, name, password } = body as {
    email?: string;
    name?: string;
    password?: string;
  };

  if (!email || !name || !password) {
    return Response.json(
      { error: "email, name, and password are required" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.create({
    data: { email, name, passwordHash },
    select: { id: true, email: true, name: true, isActive: true, createdAt: true },
  });
  return Response.json(user, { status: 201 });
}
