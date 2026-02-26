"use client";

import { useState } from "react";

const MOCK_BALANCE = "10,000.00";

export default function WalletPanel() {
  const [tab, setTab] = useState<"overview" | "deposit" | "history">("overview");

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">👛 My Wallet</h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-800 p-1 rounded-lg">
        {(["overview", "deposit", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded text-sm capitalize font-medium transition-colors ${
              tab === t ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-800/50 rounded-xl p-5">
            <div className="text-xs text-gray-400 mb-1">Total Balance</div>
            <div className="text-3xl font-bold text-white">${MOCK_BALANCE}</div>
            <div className="text-xs text-green-400 mt-1">+2.4% today</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Available</div>
              <div className="text-lg font-semibold text-white">$8,500.00</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">In Trades</div>
              <div className="text-lg font-semibold text-yellow-400">$1,500.00</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Pending Withdrawals</div>
            <div className="text-sm text-white">$0.00</div>
          </div>
        </div>
      )}

      {tab === "deposit" && (
        <div className="text-gray-400 text-sm">
          <p>Select a network to deposit funds.</p>
          <p className="mt-2 text-xs text-gray-500">Available via Wallet page →</p>
        </div>
      )}

      {tab === "history" && (
        <div className="text-gray-500 text-sm text-center py-4">
          No transaction history yet.
        </div>
      )}
    </div>
  );
}
