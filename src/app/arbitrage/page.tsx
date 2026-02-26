"use client";

import { useEffect, useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface TradingLevel {
  id: string;
  name: string;
  type: string;
  minAmount: string;
  maxAmount: string;
  payoutPct: string;
  description?: string;
  isActive: boolean;
}

export default function ArbitragePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [levels, setLevels] = useState<TradingLevel[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/trading-levels?type=ARBITRAGE")
      .then((r) => r.json())
      .then((data: TradingLevel[]) => { if (Array.isArray(data)) setLevels(data); })
      .catch(() => {});
  }, []);

  const mockLevels = [
    { id: "m1", name: "Starter", minAmount: "100", maxAmount: "999", payoutPct: "12", description: "Entry level AI arbitrage strategy" },
    { id: "m2", name: "Pro", minAmount: "1000", maxAmount: "4999", payoutPct: "18", description: "Advanced multi-exchange arbitrage" },
    { id: "m3", name: "Elite", minAmount: "5000", maxAmount: "50000", payoutPct: "25", description: "Premium HFT arbitrage system" },
  ];

  const displayLevels = levels.length > 0 ? levels : mockLevels;

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">AI Arbitrage</h1>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Start AI Strategy
            </button>
          </div>

          <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-400">
            🤖 Our AI monitors price discrepancies across 50+ exchanges in real-time and executes profitable trades automatically.
          </div>

          <h2 className="text-lg font-semibold text-white mb-4">Investment Levels</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayLevels.map((level) => (
              <div key={level.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-600/50 transition-colors">
                <h3 className="text-lg font-bold text-white mb-1">{level.name}</h3>
                {level.description && <p className="text-xs text-gray-400 mb-3">{level.description}</p>}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min</span>
                    <span className="text-white">${parseFloat(level.minAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max</span>
                    <span className="text-white">${parseFloat(level.maxAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Return</span>
                    <span className="text-green-400 font-semibold">{level.payoutPct}%</span>
                  </div>
                </div>
                <button className="mt-4 w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/40 text-blue-400 py-2 rounded-lg text-sm transition-colors">
                  Invest Now
                </button>
              </div>
            ))}
          </div>

          {/* Active investments */}
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Active Investments</h3>
            <div className="text-gray-500 text-sm text-center py-4">
              No active investments. Start an AI strategy above.
            </div>
          </div>
        </main>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold text-white mb-3">Start AI Strategy</h2>
              <p className="text-gray-400 text-sm mb-4">Select an investment level and fund your account to begin.</p>
              <button
                onClick={() => setModalOpen(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </WalletGate>
  );
}
