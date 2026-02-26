"use client";

import { useEffect, useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface Deposit {
  id: string;
  amount: string;
  network: string;
  txHash: string;
  status: string;
  adminNote?: string;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  amount: string;
  currency: string;
  destination: string;
  method: string;
  status: string;
  adminNote?: string;
  txRef?: string;
  createdAt: string;
  paidAt?: string;
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-900/50 text-yellow-400",
  APPROVED: "bg-blue-900/50 text-blue-400",
  REJECTED: "bg-red-900/50 text-red-400",
  PAID: "bg-green-900/50 text-green-400",
};

export default function HistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<"deposits" | "withdrawals">("deposits");
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const w = localStorage.getItem("connectedWallet");
    if (!w) return;
    fetch(`/api/users?walletAddress=${w}`)
      .then((r) => r.json())
      .then((u: { id?: string }) => {
        if (u.id) {
          Promise.all([
            fetch(`/api/deposits?userId=${u.id}`).then((r) => r.json()),
            fetch(`/api/withdrawals?userId=${u.id}`).then((r) => r.json()),
          ])
            .then(([deps, withs]: [Deposit[], Withdrawal[]]) => {
              if (Array.isArray(deps)) setDeposits(deps);
              if (Array.isArray(withs)) setWithdrawals(withs);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-6">Transaction History</h1>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 p-1 rounded-lg w-fit">
            {(["deposits", "withdrawals"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded text-sm capitalize font-medium transition-colors ${
                  tab === t ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {t} {t === "deposits" ? `(${deposits.length})` : `(${withdrawals.length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-gray-500 text-sm">Loading...</div>
          ) : tab === "deposits" ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {deposits.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <div className="text-3xl mb-2">💰</div>
                  <p>No deposits yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800 bg-gray-900/50">
                        <th className="p-4 text-left">Network</th>
                        <th className="p-4 text-left">Amount</th>
                        <th className="p-4 text-left">TX Hash</th>
                        <th className="p-4 text-left">Status</th>
                        <th className="p-4 text-left">Note</th>
                        <th className="p-4 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deposits.map((d) => (
                        <tr key={d.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="p-4 text-white font-medium">{d.network}</td>
                          <td className="p-4 text-white">${d.amount}</td>
                          <td className="p-4 text-gray-400 font-mono text-xs">
                            {d.txHash.length > 20 ? d.txHash.slice(0, 20) + "..." : d.txHash}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[d.status] ?? "bg-gray-800 text-gray-400"}`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">{d.adminNote ?? "—"}</td>
                          <td className="p-4 text-xs text-gray-500">{new Date(d.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {withdrawals.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <div className="text-3xl mb-2">📤</div>
                  <p>No withdrawals yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800 bg-gray-900/50">
                        <th className="p-4 text-left">Amount</th>
                        <th className="p-4 text-left">Destination</th>
                        <th className="p-4 text-left">Method</th>
                        <th className="p-4 text-left">Status</th>
                        <th className="p-4 text-left">TX Ref</th>
                        <th className="p-4 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="p-4 text-white font-medium">{w.amount} {w.currency}</td>
                          <td className="p-4 text-gray-400 font-mono text-xs">
                            {w.destination.length > 20 ? w.destination.slice(0, 20) + "..." : w.destination}
                          </td>
                          <td className="p-4 text-gray-400 text-xs">{w.method}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[w.status] ?? "bg-gray-800 text-gray-400"}`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500 font-mono">{w.txRef ?? "—"}</td>
                          <td className="p-4 text-xs text-gray-500">{new Date(w.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </WalletGate>
  );
}
