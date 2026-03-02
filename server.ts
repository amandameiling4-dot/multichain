/**
 * Custom Next.js HTTP server with WebSocket support.
 *
 * Run with:  npx tsx server.ts
 * (the "dev" script in package.json is updated to call this instead of `next dev`)
 *
 * WebSocket clients connect to:
 *   ws://host/api/ws?assetId=<optional>
 *
 * On connect they receive:
 *   { type: "snapshot", trades: Trade[] }   ← last 20 trades
 *
 * Afterwards, every time a new trade is ingested (POST /api/trades) the server
 * pushes:
 *   { type: "trade", trade: Trade }
 *
 * Fallback: browsers / environments that do not support WebSocket can still
 * use the SSE endpoint at GET /api/stream.
 */

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer } from "ws";
import { registerClient, sendSnapshot, type BroadcastTrade } from "./src/lib/ws-manager";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST ?? "0.0.0.0";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "/", true);
    handle(req, res, parsedUrl).catch((err: unknown) => {
      console.error("Next.js request handler error", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    });
  });

  // Attach a WebSocket server to the same HTTP server.
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    const { pathname } = parse(request.url ?? "/");
    if (pathname === "/api/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", async (ws, request) => {
    const { query } = parse(request.url ?? "/", true);
    const assetId = typeof query.assetId === "string" ? query.assetId : "";

    // Register before we await the snapshot so the client is never missed
    registerClient(ws, assetId);

    // Lazy-import prisma so this file can be compiled without DATABASE_URL
    try {
      const { prisma } = await import("./src/lib/prisma");
      const recent = await prisma.trade.findMany({
        where: assetId ? { assetId } : {},
        orderBy: { tradedAt: "desc" },
        take: 20,
        include: { asset: { select: { symbol: true, name: true } } },
      });
      sendSnapshot(ws, recent.reverse() as BroadcastTrade[]);
    } catch (err) {
      console.error("WebSocket snapshot error", err);
    }
  });

  httpServer.listen(port, hostname, () => {
    console.log(`▲ Ready on http://${hostname}:${port} (WebSocket on /api/ws)`);
  });
});
