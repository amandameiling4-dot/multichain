"use client";

import { useEffect, useState } from "react";
import TradeFeed from "@/components/TradeFeed";
import PriceChart from "@/components/PriceChart";
import Link from "next/link";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PromoCarousel from "@/components/PromoCarousel";
import MarketOverview from "@/components/MarketOverview";

const BOTTOM_NAV = [
  { href: "/trade", label: "Trade", icon: "📈" },
  { href: "/futures", label: "Futures", icon: "⚡" },
  { href: "/arbitrage", label: "Arb", icon: "🤖" },
  { href: "/wallet", label: "Wallet", icon: "👛" },
  { href: "/support", label: "More", icon: "💬" },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wallet, setWallet] = useState<string | undefined>(undefined);

  useEffect(() => {
    setWallet(localStorage.getItem("connectedWallet") ?? undefined);
  }, []);

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white pb-16 lg:pb-0">
        <Header wallet={wallet} onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6 flex flex-col gap-6">
          {/* Promo carousel */}
          <PromoCarousel />

          {/* Market overview */}
          <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-100">Markets</h2>
            <MarketOverview />
          </section>

          {/* Price chart */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">Price History</h2>
            <PriceChart />
          </section>

          {/* Live trade feed */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">Real-Time Trade Feed</h2>
            <TradeFeed />
          </section>

          {/* Nav links */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { href: "/trade", label: "Binary Trade" },
                { href: "/futures", label: "Futures" },
                { href: "/arbitrage", label: "Arbitrage" },
                { href: "/demo", label: "Demo" },
                { href: "/p2p", label: "P2P" },
                { href: "/borrow", label: "Borrow" },
                { href: "/wallet", label: "Wallet" },
                { href: "/kyc", label: "KYC" },
                { href: "/notifications", label: "Notifications" },
                { href: "/support", label: "Support" },
                { href: "/admin", label: "Admin" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </main>

        <footer className="lg:ml-60 border-t border-gray-800 px-6 py-4 text-center text-sm text-gray-500">
          MultiChain — Real-Time Trading Dapp · Powered by Next.js + Neon + Prisma
        </footer>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex z-20">
          {BOTTOM_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center py-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs mt-0.5">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </WalletGate>
  );
}

