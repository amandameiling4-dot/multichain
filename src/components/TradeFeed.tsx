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

export default function TradeFeed({ assetId }: Props) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `/api/stream${assetId ? `?assetId=${assetId}` : ""}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data) as
        | { type: "snapshot"; trades: Trade[] }
        | { type: "trade"; trade: Trade };

      if (data.type === "snapshot") {
        setTrades(data.trades);
      } else if (data.type === "trade") {
        setTrades((prev) => [data.trade, ...prev].slice(0, 100));
      }
    };

    return () => {
      es.close();
      setConnected(false);
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
