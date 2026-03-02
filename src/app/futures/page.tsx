"use client";

import { useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PriceChart from "@/components/PriceChart";

const ASSETS = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT"];
const LEVERAGES = [1, 2, 5, 10, 20, 50, 100];

export default function FuturesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [asset, setAsset] = useState("BTC/USDT");
  const [leverage, setLeverage] = useState(10);
  const [size, setSize] = useState("100");
  const [side, setSide] = useState<"long" | "short">("long");

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-6">Futures Trading</h1>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Trade form */}
            <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-1">Asset Pair</label>
                <select
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                >
                  {ASSETS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-1">Leverage</label>
                <div className="flex flex-wrap gap-1.5">
                  {LEVERAGES.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLeverage(l)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        leverage === l ? "bg-yellow-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {l}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-1">Position Size (USDT)</label>
                <input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="bg-gray-800 rounded-lg p-3 mb-4 text-xs space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Margin</span>
                  <span className="text-white">${(parseFloat(size || "0") / leverage).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Leverage</span>
                  <span className="text-yellow-400">{leverage}x</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSide("long")}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm ${
                    side === "long" ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  Long
                </button>
                <button
                  onClick={() => setSide("short")}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm ${
                    side === "short" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  Short
                </button>
              </div>

              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-800/50 rounded-lg text-xs text-yellow-400 text-center">
                ⚡ Futures trading coming soon
              </div>
            </div>

            {/* Live chart */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Live Price Chart</h2>
              <PriceChart />
            </div>
          </div>
        </main>
      </div>
    </WalletGate>
  );
}
