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
      // Track the tradedAt timestamp of the most recent trade we've seen
      let lastSeenAt: Date = new Date(0);

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
        // recent[0] is the most recent trade (desc order)
        lastSeenAt = recent[0].tradedAt;
        send({ type: "snapshot", trades: recent.reverse() });
      }

      // Poll every 2 seconds for trades newer than the last seen timestamp
      const intervalId = setInterval(async () => {
        try {
          const newTrades = await prisma.trade.findMany({
            where: {
              ...(assetId && { assetId }),
              tradedAt: { gt: lastSeenAt },
            },
            orderBy: { tradedAt: "asc" },
            take: 50,
            include: { asset: { select: { symbol: true, name: true } } },
          });

          if (newTrades.length > 0) {
            // Advance the cursor to the latest trade seen
            lastSeenAt = newTrades[newTrades.length - 1].tradedAt;
            for (const trade of newTrades) {
              send({ type: "trade", trade });
            }
          }
        } catch {
          clearInterval(intervalId);
          try {
            controller.close();
          } catch {
            // already closed
          }
        }
      }, 2000);

      // Clean up when the client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
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
