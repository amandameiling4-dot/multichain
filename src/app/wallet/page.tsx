"use client";

import { useEffect, useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import WalletPanel from "@/components/WalletPanel";

interface DepositWallet {
  id: string;
  network: string;
  address: string;
  label?: string;
}

interface DepositProof {
  id: string;
  amount: string;
  network: string;
  txHash: string;
  status: string;
  createdAt: string;
}

export default function WalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [wallets, setWallets] = useState<DepositWallet[]>([]);
  const [deposits, setDeposits] = useState<DepositProof[]>([]);
  const [form, setForm] = useState({ network: "", txHash: "", amount: "", screenshot: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const w = localStorage.getItem("connectedWallet");
    if (!w) return;
    fetch(`/api/users?walletAddress=${w}`)
      .then((r) => r.json())
      .then((u: { id?: string }) => {
        if (u.id) {
          setUserId(u.id);
          fetch(`/api/uploads?userId=${u.id}`)
            .then((r) => r.json())
            .then((data: DepositProof[]) => { if (Array.isArray(data)) setDeposits(data); })
            .catch(() => {});
        }
      })
      .catch(() => {});

    // Fetch public deposit wallets
    fetch("/api/deposit-wallets")
      .then((r) => r.json())
      .then((data: DepositWallet[]) => { if (Array.isArray(data)) setWallets(data); })
      .catch(() => {});
  }, []);

  async function submitDeposit() {
    if (!userId || !form.txHash || !form.network || !form.amount) {
      setMsg("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    setMsg("");
    const res = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...form, amount: parseFloat(form.amount) }),
    });
    if (res.ok) {
      const proof = await res.json() as DepositProof;
      setDeposits((prev) => [proof, ...prev]);
      setMsg("Deposit proof submitted! We will review within 1 hour.");
      setForm({ network: "", txHash: "", amount: "", screenshot: "" });
    } else {
      setMsg("Submission failed.");
    }
    setSubmitting(false);
  }

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-6">Wallet</h1>

          <div className="grid lg:grid-cols-2 gap-6">
            <WalletPanel />

            {/* Deposit flow */}
            <div className="space-y-4">
              {/* Deposit addresses */}
              {wallets.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h2 className="text-sm font-semibold text-gray-300 mb-3">Deposit Addresses</h2>
                  {wallets.map((w) => (
                    <div key={w.id} className="mb-3 bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">{w.network}{w.label ? ` — ${w.label}` : ""}</div>
                      <div className="font-mono text-xs text-white break-all">{w.address}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload deposit proof */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-300 mb-3">Upload Deposit Proof</h2>
                <div className="space-y-3">
                  <input
                    placeholder="Network (e.g. BTC, ETH, TRC20)"
                    value={form.network}
                    onChange={(e) => setForm((p) => ({ ...p, network: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Amount (USDT)"
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Transaction Hash"
                    value={form.txHash}
                    onChange={(e) => setForm((p) => ({ ...p, txHash: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Screenshot URL (optional)"
                    value={form.screenshot}
                    onChange={(e) => setForm((p) => ({ ...p, screenshot: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={submitDeposit}
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm"
                  >
                    {submitting ? "Submitting..." : "Submit Proof"}
                  </button>
                  {msg && <p className="text-xs text-gray-400">{msg}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Deposit history */}
          {deposits.length > 0 && (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Recent Deposits</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="pb-2 text-left">Network</th>
                      <th className="pb-2 text-left">Amount</th>
                      <th className="pb-2 text-left">TX Hash</th>
                      <th className="pb-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((d) => (
                      <tr key={d.id} className="border-b border-gray-800/50">
                        <td className="py-2 text-white">{d.network}</td>
                        <td className="py-2 text-white">${d.amount}</td>
                        <td className="py-2 text-gray-400 font-mono">{d.txHash.slice(0, 16)}...</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            d.status === "APPROVED" ? "bg-green-900/50 text-green-400" :
                            d.status === "REJECTED" ? "bg-red-900/50 text-red-400" :
                            "bg-yellow-900/50 text-yellow-400"
                          }`}>{d.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </WalletGate>
  );
}
