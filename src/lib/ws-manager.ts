/**
 * WebSocket broadcast manager.
 *
 * This module maintains a registry of active WebSocket connections keyed by
 * assetId (or "" for the global feed) and provides a helper to broadcast
 * trade events.  It is used by the custom server (server.ts) and by the
 * trade-ingestion layer so that new trades are pushed to connected clients
 * instead of having every client poll the database.
 */

import { WebSocket } from "ws";

export interface BroadcastTrade {
  id: string;
  assetId: string;
  side: string;
  price: unknown;
  quantity: unknown;
  total: unknown;
  exchange: string;
  tradedAt: Date | string;
  asset: { symbol: string; name: string };
  [key: string]: unknown;
}

/** Connected clients, keyed by assetId filter ("" = all trades). */
const clients = new Map<string, Set<WebSocket>>();

/** Register a WebSocket client, optionally filtered to a single asset. */
export function registerClient(ws: WebSocket, assetId = ""): void {
  let bucket = clients.get(assetId);
  if (!bucket) {
    bucket = new Set();
    clients.set(assetId, bucket);
  }
  bucket.add(ws);

  ws.on("close", () => {
    bucket!.delete(ws);
    if (bucket!.size === 0) clients.delete(assetId);
  });
}

/** Broadcast a trade to all clients that subscribed to it. */
export function broadcastTrade(trade: BroadcastTrade): void {
  const assetId = trade.assetId;
  const msg = JSON.stringify({ type: "trade", trade });

  // Send to clients watching this specific asset
  for (const ws of clients.get(assetId) ?? []) {
    safeSend(ws, msg);
  }

  // Also send to clients watching all assets (empty assetId key)
  if (assetId !== "") {
    for (const ws of clients.get("") ?? []) {
      safeSend(ws, msg);
    }
  }
}

/** Broadcast a snapshot (array of recent trades) to a single client. */
export function sendSnapshot(ws: WebSocket, trades: BroadcastTrade[]): void {
  safeSend(ws, JSON.stringify({ type: "snapshot", trades }));
}

function safeSend(ws: WebSocket, data: string): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(data);
  }
}
