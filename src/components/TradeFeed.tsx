"use client";

import { useEffect, useRef, useState } from "react";

interface Asset {
  symbol: string;
  name: string;
}

interface Trade {
  id: string;
  side: "BUY" | "SELL";
  price: string;
  quantity: string;
  total: string;
  exchange: string;
  tradedAt: string;
  asset: Asset;
}

interface Props {
  assetId?: string;
}

type ServerMessage =
  | { type: "snapshot"; trades: Trade[] }
  | { type: "trade"; trade: Trade };

/**
 * Connect to the real-time trade feed.
 *
 * Strategy:
 *   1. Try WebSocket at ws(s)://host/api/ws  (custom server, faster)
 *   2. If WebSocket is unavailable (e.g. serverless), fall back to SSE at
 *      /api/stream so the component always works regardless of deployment.
 */
function openConnection(
  assetId: string | undefined,
  onMessage: (msg: ServerMessage) => void,
  onStatusChange: (connected: boolean) => void,
): () => void {
  const qs = assetId ? `?assetId=${encodeURIComponent(assetId)}` : "";

  // Build the WebSocket URL from the current page origin
  const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProtocol}//${location.host}/api/ws${qs}`;

  let ws: WebSocket | null = null;
  let es: EventSource | null = null;
  let usedFallback = false;

  function startSSEFallback() {
    usedFallback = true;
    es = new EventSource(`/api/stream${qs}`);
    es.onopen = () => onStatusChange(true);
    es.onerror = () => onStatusChange(false);
    es.onmessage = (event: MessageEvent<string>) => {
      try {
        onMessage(JSON.parse(event.data) as ServerMessage);
      } catch {
        // ignore malformed frames
      }
    };
  }

  try {
    ws = new WebSocket(wsUrl);

    // Give WebSocket 3 s to connect; if it fails, switch to SSE
    const fallbackTimer = setTimeout(() => {
      if (ws && ws.readyState !== WebSocket.OPEN) {
        ws.close();
        startSSEFallback();
      }
    }, 3000);

    ws.onopen = () => {
      clearTimeout(fallbackTimer);
      onStatusChange(true);
    };

    ws.onerror = () => {
      clearTimeout(fallbackTimer);
      if (!usedFallback) startSSEFallback();
    };

    ws.onclose = () => {
      if (!usedFallback) onStatusChange(false);
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        onMessage(JSON.parse(event.data) as ServerMessage);
      } catch {
        // ignore malformed frames
      }
    };
  } catch {
    // WebSocket constructor not available (SSR guard — should not happen at runtime)
    startSSEFallback();
  }

  return () => {
    ws?.close();
    es?.close();
    onStatusChange(false);
  };
}

export default function TradeFeed({ assetId }: Props) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [connected, setConnected] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    cleanupRef.current = openConnection(
      assetId,
      (msg) => {
        if (msg.type === "snapshot") {
          setTrades(msg.trades);
        } else if (msg.type === "trade") {
          setTrades((prev) => [msg.trade, ...prev].slice(0, 100));
        }
      },
      setConnected,
    );

    return () => {
      cleanupRef.current?.();
    };
  }, [assetId]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            connected ? "bg-green-400" : "bg-gray-400"
          }`}
        />
        <span className="text-xs text-gray-400">
          {connected ? "Live" : "Connecting…"}
        </span>
      </div>

      <div className="overflow-auto max-h-[480px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="py-2 pr-4">Asset</th>
              <th className="py-2 pr-4">Side</th>
              <th className="py-2 pr-4 text-right">Price</th>
              <th className="py-2 pr-4 text-right">Qty</th>
              <th className="py-2 pr-4 text-right">Total</th>
              <th className="py-2 text-right">Exchange</th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  Waiting for trades…
                </td>
              </tr>
            )}
            {trades.map((t) => (
              <tr
                key={t.id}
                className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors"
              >
                <td className="py-2 pr-4 font-medium">{t.asset.symbol}</td>
                <td
                  className={`py-2 pr-4 font-semibold ${
                    t.side === "BUY" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {t.side}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums">
                  ${Number(t.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums">
                  {Number(t.quantity).toFixed(4)}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums">
                  ${Number(t.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 text-right text-gray-400">{t.exchange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
