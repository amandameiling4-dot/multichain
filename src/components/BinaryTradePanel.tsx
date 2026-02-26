"use client";

import { useEffect, useState } from "react";

interface Asset {
  id: string;
  symbol: string;
  name: string;
}

interface BinaryTradeRecord {
  id: string;
  assetId: string;
  direction: "UP" | "DOWN";
  amount: string;
  expiry: number;
  payoutPct: string;
  status: string;
  outcome?: string;
  profit?: string;
  expiresAt: string;
  createdAt: string;
  asset?: { symbol: string; name: string };
}

interface BinaryTradePanelProps {
  userId: string;
  assets: Asset[];
}

const EXPIRY_OPTIONS = [
  { label: "30s", value: 30 },
  { label: "1m", value: 60 },
  { label: "5m", value: 300 },
];

export default function BinaryTradePanel({ userId, assets }: BinaryTradePanelProps) {
  const [selectedAsset, setSelectedAsset] = useState<string>(assets[0]?.id ?? "");
  const [direction, setDirection] = useState<"UP" | "DOWN">("UP");
  const [amount, setAmount] = useState("10");
  const [expiry, setExpiry] = useState(60);
  const [trades, setTrades] = useState<BinaryTradeRecord[]>([]);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/binary-trades?userId=${userId}`)
      .then((r) => r.json())
      .then((data: BinaryTradeRecord[]) => setTrades(data))
      .catch(() => {});
  }, [userId]);

  async function placeTrade() {
    if (!selectedAsset || !amount || !userId) return;
    setPlacing(true);
    setMessage("");
    try {
      const res = await fetch("/api/binary-trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          assetId: selectedAsset,
          direction,
          amount: parseFloat(amount),
          expiry,
          payoutPct: 85,
        }),
      });
      const trade = await res.json() as BinaryTradeRecord;
      if (res.ok) {
        setTrades((prev) => [trade, ...prev]);
        setMessage("Trade placed successfully!");
      } else {
        setMessage("Failed to place trade.");
      }
    } catch {
      setMessage("Network error.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Trade form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Binary Options</h2>

        {/* Asset selector */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">Asset</label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id}>{a.symbol} — {a.name}</option>
            ))}
          </select>
        </div>

        {/* Direction */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">Direction</label>
          <div className="flex gap-2">
            <button
              onClick={() => setDirection("UP")}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                direction === "UP"
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              ▲ UP
            </button>
            <button
              onClick={() => setDirection("DOWN")}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                direction === "DOWN"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              ▼ DOWN
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">Amount (USDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Expiry */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">Expiry</label>
          <div className="flex gap-2">
            {EXPIRY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setExpiry(opt.value)}
                className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                  expiry === opt.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payout info */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4 flex justify-between text-sm">
          <span className="text-gray-400">Payout</span>
          <span className="text-green-400 font-semibold">85%</span>
        </div>

        {/* Submit */}
        <button
          onClick={placeTrade}
          disabled={placing || !selectedAsset}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {placing ? "Placing..." : "Place Trade"}
        </button>

        {message && (
          <p className="text-xs text-center mt-2 text-gray-400">{message}</p>
        )}
      </div>

      {/* Active trades */}
      {trades.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Trades</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="pb-2 text-left">Asset</th>
                  <th className="pb-2 text-left">Dir</th>
                  <th className="pb-2 text-left">Amount</th>
                  <th className="pb-2 text-left">Status</th>
                  <th className="pb-2 text-left">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 10).map((t) => (
                  <tr key={t.id} className="border-b border-gray-800/50">
                    <td className="py-1.5 text-white">{t.asset?.symbol ?? "—"}</td>
                    <td className={`py-1.5 font-medium ${t.direction === "UP" ? "text-green-400" : "text-red-400"}`}>
                      {t.direction === "UP" ? "▲" : "▼"} {t.direction}
                    </td>
                    <td className="py-1.5 text-gray-300">${t.amount}</td>
                    <td className="py-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        t.status === "ACTIVE" ? "bg-yellow-900/50 text-yellow-400" :
                        t.status === "SETTLED" ? "bg-gray-800 text-gray-400" : "bg-red-900/50 text-red-400"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className={`py-1.5 font-medium ${
                      t.outcome === "WIN" ? "text-green-400" : t.outcome === "LOSS" ? "text-red-400" : "text-gray-500"
                    }`}>
                      {t.outcome ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
