"use client";

import { useEffect, useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  INFO: "ℹ️",
  SUCCESS: "✅",
  WARNING: "⚠️",
  ERROR: "❌",
  TRADE: "📈",
  DEPOSIT: "💰",
  KYC: "🪪",
};

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const w = localStorage.getItem("connectedWallet");
    if (!w) return;
    fetch(`/api/users?walletAddress=${w}`)
      .then((r) => r.json())
      .then((u: { id?: string }) => {
        if (u.id) {
          setUserId(u.id);
          return fetch(`/api/notifications?userId=${u.id}`);
        }
        return null;
      })
      .then((r) => r ? r.json() : [])
      .then((data: Notification[]) => { if (Array.isArray(data)) setNotifications(data); })
      .catch(() => {});
  }, []);

  async function markAllRead() {
    if (!userId) return;
    setMarking(true);
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarking(false);
  }

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllRead}
                disabled={marking}
                className="bg-gray-700 hover:bg-gray-600 text-sm text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Mark All Read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center text-gray-500">
              <div className="text-4xl mb-3">🔔</div>
              <p>No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-gray-900 border rounded-xl p-4 flex gap-3 transition-colors ${
                    n.isRead ? "border-gray-800" : "border-blue-800/50 bg-blue-950/10"
                  }`}
                >
                  <span className="text-xl">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-semibold ${n.isRead ? "text-gray-300" : "text-white"}`}>
                        {n.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </WalletGate>
  );
}
