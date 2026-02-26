"use client";

import { useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

type TabType = "buy" | "sell";

const BUY_OFFERS = [
  { id: "1", user: "Trader_A", amount: "500 USDT", rate: "$1.001", payment: "Bank Transfer" },
  { id: "2", user: "CryptoEx", amount: "2,000 USDT", rate: "$1.000", payment: "PayPal" },
  { id: "3", user: "FastTrade", amount: "800 USDT", rate: "$0.999", payment: "Wire" },
];

const SELL_OFFERS = [
  { id: "4", user: "P2PSeller", amount: "1,500 USDT", rate: "$1.002", payment: "Bank Transfer" },
  { id: "5", user: "CoinMover", amount: "600 USDT", rate: "$1.001", payment: "Zelle" },
  { id: "6", user: "QuickSell", amount: "3,000 USDT", rate: "$1.000", payment: "Wire" },
];

export default function P2PPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<TabType>("buy");

  const offers = tab === "buy" ? BUY_OFFERS : SELL_OFFERS;

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-6">P2P Trading</h1>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setTab("buy")}
              className={`px-6 py-2 rounded text-sm font-medium transition-colors ${tab === "buy" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Buy
            </button>
            <button
              onClick={() => setTab("sell")}
              className={`px-6 py-2 rounded text-sm font-medium transition-colors ${tab === "sell" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Sell
            </button>
          </div>

          {/* Offers list */}
          <div className="space-y-3">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {offer.user[0]}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{offer.user}</div>
                    <div className="text-xs text-gray-400">{offer.payment}</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">{offer.amount}</div>
                  <div className="text-xs text-gray-400">Rate: {offer.rate}</div>
                </div>
                <button className={`px-5 py-2 rounded-lg text-sm font-semibold ${
                  tab === "buy" ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"
                } text-white transition-colors`}>
                  {tab === "buy" ? "Buy" : "Sell"}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-gray-500 text-center">
            P2P trading is peer-to-peer. Always verify counterparty before trading.
          </div>
        </main>
      </div>
    </WalletGate>
  );
}
