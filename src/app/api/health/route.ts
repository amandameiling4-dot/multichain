import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Returns the health status of the application and its dependencies.
 * Used by uptime monitors and load balancers.
 */
export async function GET() {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    return Response.json(
      {
        status: "ok",
        db: { status: "ok", latencyMs },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[health] DB check failed:", err);
    return Response.json(
      {
        status: "error",
        db: { status: "error" },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
