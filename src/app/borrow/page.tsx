"use client";

import { useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const LENDING_RATES = [
  { asset: "USDT", apy: "8.5%", min: "$100" },
  { asset: "BTC", apy: "5.2%", min: "0.001 BTC" },
  { asset: "ETH", apy: "6.8%", min: "0.01 ETH" },
];

export default function BorrowPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState<"loans" | "lending">("loans");

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-6">Borrow & Lending</h1>

          {/* Section tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setSection("loans")}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                section === "loans" ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Crypto Loans
            </button>
            <button
              onClick={() => setSection("lending")}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                section === "lending" ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Lending
            </button>
          </div>

          {section === "loans" && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Total Borrowed</div>
                  <div className="text-2xl font-bold text-white">$0.00</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Interest Due</div>
                  <div className="text-2xl font-bold text-yellow-400">$0.00</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-1">Collateral Locked</div>
                  <div className="text-2xl font-bold text-blue-400">$0.00</div>
                </div>
              </div>

              {/* Active loans */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold text-gray-300">Active Loans</h2>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm">
                    Apply for Loan
                  </button>
                </div>
                <div className="text-gray-500 text-sm text-center py-4">No active loans.</div>
              </div>
            </div>
          )}

          {section === "lending" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {LENDING_RATES.map((r) => (
                  <div key={r.asset} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <div className="text-lg font-bold text-white mb-1">{r.asset}</div>
                    <div className="text-3xl font-bold text-green-400 mb-2">{r.apy}</div>
                    <div className="text-xs text-gray-400">Min: {r.min}</div>
                    <button className="mt-3 w-full bg-green-600/20 hover:bg-green-600/40 border border-green-600/40 text-green-400 py-2 rounded-lg text-sm">
                      Lend Now
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-300 mb-3">Active Lending Positions</h2>
                <div className="text-gray-500 text-sm text-center py-4">No active lending positions.</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </WalletGate>
  );
}
