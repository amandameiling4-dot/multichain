"use client";

import { useEffect, useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface UserProfile {
  id: string;
  walletAddress: string;
  userId: string;
  email?: string;
  displayName?: string;
  role: string;
  mode: string;
  vipLevel: number;
  isRegistered: boolean;
  isFrozen: boolean;
  points: number;
  referralCode?: string;
  createdAt: string;
  kyc?: {
    status: string;
    fullName: string;
    createdAt: string;
    reviewNote?: string;
  } | null;
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ displayName: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  useEffect(() => {
    const w = localStorage.getItem("connectedWallet");
    if (!w) return;
    fetch(`/api/me?walletAddress=${w}`)
      .then((r) => r.json())
      .then((u: UserProfile) => {
        if (u.id) {
          setProfile(u);
          setForm({ displayName: u.displayName ?? "", email: u.email ?? "" });
        }
      })
      .catch(() => {});
  }, []);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: profile.walletAddress, ...form }),
    });
    if (res.ok) {
      const updated = await res.json() as Partial<UserProfile>;
      setProfile((p) => p ? { ...p, ...updated } : p);
      setMsg("Profile saved successfully.");
      setMsgType("ok");
    } else {
      setMsg("Failed to save profile.");
      setMsgType("err");
    }
    setSaving(false);
  }

  function truncate(str: string, n = 12) {
    if (str.length <= n * 2) return str;
    return str.slice(0, n) + "..." + str.slice(-6);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6 max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-6">Settings & Profile</h1>

          {/* Profile form */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Profile</h2>

            {profile && (
              <div className="mb-4 bg-gray-800 rounded-lg p-3 text-xs text-gray-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Wallet</span>
                  <span
                    className="font-mono text-white cursor-pointer hover:text-blue-400"
                    onClick={() => copyToClipboard(profile.walletAddress)}
                    title="Click to copy"
                  >
                    {truncate(profile.walletAddress)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>User ID</span>
                  <span className="text-white">{profile.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Role</span>
                  <span className="text-blue-400 font-medium">{profile.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>VIP Level</span>
                  <span className="text-yellow-400">{profile.vipLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Points</span>
                  <span className="text-green-400">{profile.points}</span>
                </div>
                <div className="flex justify-between">
                  <span>Referral Code</span>
                  <span
                    className="font-mono text-white cursor-pointer hover:text-blue-400"
                    onClick={() => profile.referralCode && copyToClipboard(profile.referralCode)}
                    title="Click to copy"
                  >
                    {profile.referralCode ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since</span>
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Status</span>
                  <span className={profile.isFrozen ? "text-red-400" : "text-green-400"}>
                    {profile.isFrozen ? "🔒 Frozen" : "✓ Active"}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Display Name</label>
                <input
                  value={form.displayName}
                  onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                  placeholder="Your display name"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              {msg && (
                <p className={`text-xs ${msgType === "ok" ? "text-green-400" : "text-red-400"}`}>{msg}</p>
              )}
            </div>
          </div>

          {/* KYC status */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-300">KYC Verification</h2>
              <Link href="/kyc" className="text-xs text-blue-400 hover:text-blue-300">
                {profile?.kyc?.status === "APPROVED" ? "View" : "Complete KYC →"}
              </Link>
            </div>
            {profile?.kyc ? (
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  profile.kyc.status === "APPROVED" ? "bg-green-900/50 text-green-400" :
                  profile.kyc.status === "REJECTED" ? "bg-red-900/50 text-red-400" :
                  "bg-yellow-900/50 text-yellow-400"
                }`}>
                  {profile.kyc.status === "APPROVED" ? "✓ Verified" :
                   profile.kyc.status === "REJECTED" ? "✕ Rejected" : "⏳ Pending"}
                </span>
                {profile.kyc.reviewNote && (
                  <span className="text-xs text-gray-500">{profile.kyc.reviewNote}</span>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">KYC not submitted. Complete verification to unlock higher limits.</p>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Quick Links</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/wallet", label: "💰 Wallet & Deposits" },
                { href: "/withdraw", label: "📤 Withdraw Funds" },
                { href: "/history", label: "📋 Transaction History" },
                { href: "/kyc", label: "🪪 KYC Verification" },
                { href: "/notifications", label: "🔔 Notifications" },
                { href: "/support", label: "💬 Support" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs px-3 py-2 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </WalletGate>
  );
}
