"use client";

import { useEffect, useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface Withdrawal {
  id: string;
  amount: string;
  currency: string;
  destination: string;
  method: string;
  fee: string;
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

export default function WithdrawPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [form, setForm] = useState({
    amount: "",
    currency: "USDT",
    destination: "",
    method: "CRYPTO" as "CRYPTO" | "BANK",
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  function loadWithdrawals(uid: string) {
    fetch(`/api/withdrawals?userId=${uid}`)
      .then((r) => r.json())
      .then((data: Withdrawal[]) => { if (Array.isArray(data)) setWithdrawals(data); })
      .catch(() => {});
  }

  useEffect(() => {
    const w = localStorage.getItem("connectedWallet");
    if (!w) return;
    fetch(`/api/users?walletAddress=${w}`)
      .then((r) => r.json())
      .then((u: { id?: string }) => {
        if (u.id) {
          setUserId(u.id);
          loadWithdrawals(u.id);
        }
      })
      .catch(() => {});
  }, []);

  async function submit() {
    if (!userId || !form.amount || !form.destination) {
      setMsg("Please fill all required fields.");
      setMsgType("err");
      return;
    }
    setSubmitting(true);
    setMsg("");
    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...form, amount: parseFloat(form.amount) }),
    });
    if (res.ok) {
      const w = await res.json() as Withdrawal;
      setWithdrawals((prev) => [w, ...prev]);
      setMsg("Withdrawal request submitted! We will process it within 24 hours.");
      setMsgType("ok");
      setForm({ amount: "", currency: "USDT", destination: "", method: "CRYPTO" });
    } else {
      const err = await res.json() as { error?: string };
      setMsg(err.error ?? "Submission failed.");
      setMsgType("err");
    }
    setSubmitting(false);
  }

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/wallet" className="text-gray-400 hover:text-white text-sm">← Wallet</Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-2xl font-bold text-white">Withdraw</h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Withdrawal form */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Create Withdrawal Request</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  />
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="BNB">BNB</option>
                  </select>
                </div>

                <select
                  value={form.method}
                  onChange={(e) => setForm((p) => ({ ...p, method: e.target.value as "CRYPTO" | "BANK" }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                >
                  <option value="CRYPTO">Crypto Wallet</option>
                  <option value="BANK">Bank Transfer</option>
                </select>

                <input
                  placeholder={form.method === "CRYPTO" ? "Destination wallet address" : "Bank account / IBAN"}
                  value={form.destination}
                  onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                />

                <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Withdrawal Amount</span>
                    <span>{form.amount || "0.00"} {form.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Fee</span>
                    <span>~0.00 {form.currency}</span>
                  </div>
                  <div className="flex justify-between font-medium text-white border-t border-gray-700 pt-1 mt-1">
                    <span>You receive</span>
                    <span>{form.amount || "0.00"} {form.currency}</span>
                  </div>
                </div>

                <button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm"
                >
                  {submitting ? "Submitting..." : "Request Withdrawal"}
                </button>

                {msg && (
                  <p className={`text-xs ${msgType === "ok" ? "text-green-400" : "text-red-400"}`}>{msg}</p>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Withdrawal Info</h3>
                <ul className="text-xs text-gray-400 space-y-2">
                  <li>• Withdrawals are reviewed within 24 hours</li>
                  <li>• Make sure your destination address is correct</li>
                  <li>• Minimum withdrawal: 10 USDT</li>
                  <li>• Frozen accounts cannot withdraw</li>
                  <li>• KYC may be required for large withdrawals</li>
                </ul>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Status Guide</h3>
                <div className="space-y-1.5">
                  {[["PENDING", "Awaiting admin review"], ["APPROVED", "Approved, processing"], ["PAID", "Payment sent"], ["REJECTED", "Request rejected"]].map(([s, desc]) => (
                    <div key={s} className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded ${STATUS_STYLE[s]}`}>{s}</span>
                      <span className="text-gray-400">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal history */}
          {withdrawals.length > 0 && (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">My Withdrawals</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="pb-2 text-left">Amount</th>
                      <th className="pb-2 text-left">Destination</th>
                      <th className="pb-2 text-left">Method</th>
                      <th className="pb-2 text-left">Status</th>
                      <th className="pb-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="border-b border-gray-800/50">
                        <td className="py-2 text-white font-medium">{w.amount} {w.currency}</td>
                        <td className="py-2 text-gray-400 font-mono">{w.destination.slice(0, 20)}...</td>
                        <td className="py-2 text-gray-400">{w.method}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${STATUS_STYLE[w.status] ?? "bg-gray-800 text-gray-400"}`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-2 text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
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
