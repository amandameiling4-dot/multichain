import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Returns the health status of the application and its dependencies.
 * Used by uptime monitors and load balancers.
 *
 * HTTP 200  { status: "ok",    version, uptime, db: { status: "ok",    latencyMs }, timestamp }
 * HTTP 503  { status: "error", version, uptime, db: { status: "error"              }, timestamp }
 *
 * `version` is set at build time via the `env.APP_VERSION` field in next.config.ts.
 */
export async function GET() {
  const start = Date.now();
  const version = process.env.APP_VERSION ?? "unknown";
  const uptimeSeconds = Math.floor(process.uptime());

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    return Response.json(
      {
        status: "ok",
        version,
        uptime: uptimeSeconds,
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
        version,
        uptime: uptimeSeconds,
        db: { status: "error" },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
