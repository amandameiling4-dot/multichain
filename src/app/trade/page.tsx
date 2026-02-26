"use client";

import { useEffect, useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BinaryTradePanel from "@/components/BinaryTradePanel";

interface Asset {
  id: string;
  symbol: string;
  name: string;
}

export default function TradePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wallet, setWallet] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const w = localStorage.getItem("connectedWallet") ?? undefined;
    setWallet(w);
    if (w) {
      fetch(`/api/users?walletAddress=${w}`)
        .then((r) => r.json())
        .then((u: { id?: string }) => { if (u.id) setUserId(u.id); })
        .catch(() => {});
    }
    fetch("/api/assets")
      .then((r) => r.json())
      .then((data: Asset[]) => setAssets(data))
      .catch(() => {});
  }, []);

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header wallet={wallet} onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-6">Binary Options Trading</h1>
          {userId && assets.length > 0 ? (
            <BinaryTradePanel userId={userId} assets={assets} />
          ) : (
            <div className="text-gray-400">Loading trading panel...</div>
          )}
        </main>
      </div>
    </WalletGate>
  );
}
