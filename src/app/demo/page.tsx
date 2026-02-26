"use client";

import { useEffect, useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface DemoTrade {
  id: string;
  assetSymbol: string;
  direction: string;
  amount: string;
  result?: string;
  profit?: string;
  createdAt: string;
}

const TOP_TRADERS = [
  { rank: 1, name: "CryptoKing88", profit: "+$12,450", winRate: "78%" },
  { rank: 2, name: "TradeMaster", profit: "+$9,230", winRate: "72%" },
  { rank: 3, name: "BullRider", profit: "+$7,800", winRate: "69%" },
  { rank: 4, name: "AlphaWave", profit: "+$5,600", winRate: "65%" },
  { rank: 5, name: "MoonShot", profit: "+$4,100", winRate: "62%" },
];

export default function DemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [trades, setTrades] = useState<DemoTrade[]>([]);
  const [asset, setAsset] = useState("BTC");
  const [direction, setDirection] = useState<"UP" | "DOWN">("UP");
  const [amount, setAmount] = useState("50");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const w = localStorage.getItem("connectedWallet");
    if (!w) return;
    fetch(`/api/users?walletAddress=${w}`)
      .then((r) => r.json())
      .then((u: { id?: string }) => {
        if (u.id) {
          setUserId(u.id);
          return fetch(`/api/demo-trades?userId=${u.id}`);
        }
        return null;
      })
      .then((r) => r ? r.json() : [])
      .then((data: DemoTrade[]) => { if (Array.isArray(data)) setTrades(data); })
      .catch(() => {});
  }, []);

  async function placeDemoTrade() {
    if (!userId) return;
    setPlacing(true);
    try {
      const res = await fetch("/api/demo-trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, assetSymbol: asset, direction, amount: parseFloat(amount) }),
      });
      const trade = await res.json() as DemoTrade;
      if (res.ok) setTrades((prev) => [trade, ...prev]);
    } catch {
      // silently fail
    } finally {
      setPlacing(false);
    }
  }

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-2">Demo Trading</h1>
          <p className="text-gray-400 text-sm mb-6">Practice with $100,000 virtual funds. No real money at risk.</p>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Demo trade form */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Place Demo Trade</h2>

              <div className="mb-3">
                <label className="text-xs text-gray-400 block mb-1">Asset</label>
                <select
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                >
                  {["BTC", "ETH", "BNB", "SOL", "ADA"].map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="text-xs text-gray-400 block mb-1">Amount (virtual USDT)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setDirection("UP")}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm ${direction === "UP" ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400"}`}
                >▲ UP</button>
                <button
                  onClick={() => setDirection("DOWN")}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm ${direction === "DOWN" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400"}`}
                >▼ DOWN</button>
              </div>

              <button
                onClick={placeDemoTrade}
                disabled={placing || !userId}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg"
              >
                {placing ? "Placing..." : "Place Demo Trade"}
              </button>
            </div>

            {/* Recent demo trades */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Recent Demo Trades</h2>
              {trades.length === 0 ? (
                <div className="text-gray-500 text-sm">No demo trades yet.</div>
              ) : (
                <div className="space-y-2">
                  {trades.slice(0, 8).map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm border-b border-gray-800 pb-2">
                      <div>
                        <span className="text-white font-medium">{t.assetSymbol}</span>
                        <span className={`ml-2 text-xs ${t.direction === "UP" ? "text-green-400" : "text-red-400"}`}>
                          {t.direction === "UP" ? "▲" : "▼"}
                        </span>
                      </div>
                      <span className={`font-medium ${t.result === "WIN" ? "text-green-400" : t.result === "LOSS" ? "text-red-400" : "text-gray-400"}`}>
                        {t.result === "WIN" ? `+$${parseFloat(t.profit ?? "0").toFixed(2)}` : t.result === "LOSS" ? `-$${Math.abs(parseFloat(t.profit ?? "0")).toFixed(2)}` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">🏆 Top Traders This Week</h2>
              <div className="space-y-3">
                {TOP_TRADERS.map((trader) => (
                  <div key={trader.rank} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      trader.rank === 1 ? "bg-yellow-600 text-white" :
                      trader.rank === 2 ? "bg-gray-400 text-gray-900" :
                      trader.rank === 3 ? "bg-orange-700 text-white" : "bg-gray-700 text-gray-400"
                    }`}>{trader.rank}</span>
                    <div className="flex-1">
                      <div className="text-sm text-white">{trader.name}</div>
                      <div className="text-xs text-gray-400">Win Rate: {trader.winRate}</div>
                    </div>
                    <span className="text-green-400 text-sm font-medium">{trader.profit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </WalletGate>
  );
}
