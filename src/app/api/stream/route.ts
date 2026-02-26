import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/stream
 * Server-Sent Events endpoint for real-time trade updates.
 * Query params: assetId (optional)
 *
 * Clients receive a snapshot of recent trades on connect, then
 * receive new trades as they are polled from the database.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId") ?? undefined;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastTradeId: string | null = null;

      const send = (data: unknown) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          // controller already closed
        }
      };

      // Send initial batch of recent trades
      const recent = await prisma.trade.findMany({
        where: { ...(assetId && { assetId }) },
        orderBy: { tradedAt: "desc" },
        take: 20,
        include: { asset: { select: { symbol: true, name: true } } },
      });

      if (recent.length > 0) {
        lastTradeId = recent[0].id;
        send({ type: "snapshot", trades: recent.reverse() });
      }

      // Poll every 2 seconds for new trades
      const interval = setInterval(async () => {
        try {
          const newTrades = await prisma.trade.findMany({
            where: {
              ...(assetId && { assetId }),
              ...(lastTradeId && {
                tradedAt: { gt: recent[0]?.tradedAt ?? new Date(0) },
              }),
            },
            orderBy: { tradedAt: "asc" },
            take: 50,
            include: { asset: { select: { symbol: true, name: true } } },
          });

          if (newTrades.length > 0) {
            lastTradeId = newTrades[newTrades.length - 1].id;
            for (const trade of newTrades) {
              send({ type: "trade", trade });
            }
          }
        } catch {
          clearInterval(interval);
          try {
            controller.close();
          } catch {
            // already closed
          }
        }
      }, 2000);

      // Clean up when the client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
