import TradeFeed from "@/components/TradeFeed";
import PriceChart from "@/components/PriceChart";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-tight">
              ⛓️ MultiChain
            </span>
            <span className="text-xs bg-blue-600/30 text-blue-400 border border-blue-600/40 px-2 py-0.5 rounded-full font-medium">
              LIVE
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="text-white font-medium border-b-2 border-blue-500 pb-0.5"
            >
              Dashboard
            </Link>
            <Link
              href="/admin"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Price chart */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">
            Price History
          </h2>
          <PriceChart />
        </section>

        {/* Live trade feed */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">
            Real-Time Trade Feed
          </h2>
          <TradeFeed />
        </section>
      </main>

      <footer className="border-t border-gray-800 px-6 py-4 text-center text-sm text-gray-500 mt-8">
        MultiChain — Real-Time Trading Dapp · Powered by Next.js + Neon +
        Prisma
      </footer>
    </div>
  );
}

