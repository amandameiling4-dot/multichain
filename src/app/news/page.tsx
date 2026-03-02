"use client";

import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import NewsFeed from "@/components/NewsFeed";
import { useState } from "react";

export default function NewsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">📰</span>
            <h1 className="text-2xl font-bold text-white">Market News & Announcements</h1>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <NewsFeed limit={50} />
          </div>
        </main>
      </div>
    </WalletGate>
  );
}
