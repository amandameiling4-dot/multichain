"use client";

import { useState } from "react";
import Link from "next/link";

interface Alert {
  id: string;
  assetSymbol: string;
  condition: string;
  threshold: string;
  message: string | null;
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

interface Setting {
  id: string;
  key: string;
  value: string;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  isActive: boolean;
}

export default function AdminPage() {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_key") ?? "";
    }
    return "";
  });
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // New alert form
  const [newAlert, setNewAlert] = useState({
    assetSymbol: "",
    condition: "PRICE_ABOVE",
    threshold: "",
    message: "",
  });

  // New asset form
  const [newAsset, setNewAsset] = useState({ symbol: "", name: "", logoUrl: "" });

  // Settings form
  const [settingKey, setSettingKey] = useState("");
  const [settingValue, setSettingValue] = useState("");

  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };

  async function login() {
    const res = await fetch("/api/admin/settings", { headers });
    if (res.ok) {
      setAuthed(true);
      setAuthError("");
      loadData();
    } else {
      setAuthError("Invalid API key");
    }
  }

  async function loadData() {
    const [alertsRes, settingsRes, assetsRes] = await Promise.all([
      fetch("/api/admin/alerts", { headers }),
      fetch("/api/admin/settings", { headers }),
      fetch("/api/assets"),
    ]);
    if (alertsRes.ok) setAlerts(await alertsRes.json());
    if (settingsRes.ok) setSettings(await settingsRes.json());
    if (assetsRes.ok) setAssets(await assetsRes.json());
  }

  async function createAlert() {
    const res = await fetch("/api/admin/alerts", {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...newAlert,
        threshold: Number(newAlert.threshold),
      }),
    });
    if (res.ok) {
      setNewAlert({ assetSymbol: "", condition: "PRICE_ABOVE", threshold: "", message: "" });
      loadData();
    }
  }

  async function deleteAlert(id: string) {
    await fetch(`/api/admin/alerts?id=${id}`, { method: "DELETE", headers });
    loadData();
  }

  async function createAsset() {
    const res = await fetch("/api/assets", {
      method: "POST",
      headers,
      body: JSON.stringify(newAsset),
    });
    if (res.ok) {
      setNewAsset({ symbol: "", name: "", logoUrl: "" });
      loadData();
    }
  }

  async function saveSetting() {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers,
      body: JSON.stringify({ key: settingKey, value: settingValue }),
    });
    if (res.ok) {
      setSettingKey("");
      setSettingValue("");
      loadData();
    }
  }

  const handleLogin = () => {
    sessionStorage.setItem("admin_key", apiKey);
    login();
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-xl font-bold text-white">Admin Login</h1>
          <p className="text-sm text-gray-400">
            Enter your Admin API key to access the admin panel.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Admin API Key"
            className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {authError && <p className="text-red-400 text-xs">{authError}</p>}
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-2 text-sm font-medium transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight">⛓️ MultiChain Admin</span>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_key");
                setAuthed(false);
                setApiKey("");
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-100">Assets</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-2 pr-4">Symbol</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className="border-b border-gray-800">
                  <td className="py-2 pr-4 font-medium">{a.symbol}</td>
                  <td className="py-2 pr-4 text-gray-300">{a.name}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.isActive
                          ? "bg-green-900/50 text-green-400"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {a.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Add asset form */}
          <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Add Asset
            </p>
            <div className="flex gap-2">
              <input
                placeholder="Symbol (e.g. BTC)"
                value={newAsset.symbol}
                onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                placeholder="Name"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={createAsset}
              className="self-start bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1.5 text-sm font-medium transition-colors"
            >
              Add Asset
            </button>
          </div>
        </section>

        {/* Alerts */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-100">Alerts</h2>
          <div className="flex flex-col gap-2 overflow-auto max-h-52">
            {alerts.length === 0 && (
              <p className="text-gray-500 text-sm">No alerts configured.</p>
            )}
            {alerts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{a.assetSymbol}</span>{" "}
                  <span className="text-gray-400">
                    {a.condition.replace(/_/g, " ")} ${Number(a.threshold).toLocaleString()}
                  </span>
                  {a.message && (
                    <span className="ml-2 text-gray-500 text-xs">{a.message}</span>
                  )}
                </div>
                <button
                  onClick={() => deleteAlert(a.id)}
                  className="text-red-400 hover:text-red-300 text-xs ml-4"
                >
                  Disable
                </button>
              </div>
            ))}
          </div>
          {/* New alert form */}
          <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              New Alert
            </p>
            <div className="flex gap-2 flex-wrap">
              <input
                placeholder="Symbol"
                value={newAlert.assetSymbol}
                onChange={(e) => setNewAlert({ ...newAlert, assetSymbol: e.target.value })}
                className="w-24 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="PRICE_ABOVE">Price Above</option>
                <option value="PRICE_BELOW">Price Below</option>
                <option value="VOLUME_ABOVE">Volume Above</option>
              </select>
              <input
                type="number"
                placeholder="Threshold"
                value={newAlert.threshold}
                onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
                className="w-28 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <input
              placeholder="Optional message"
              value={newAlert.message}
              onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
              className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={createAlert}
              className="self-start bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1.5 text-sm font-medium transition-colors"
            >
              Create Alert
            </button>
          </div>
        </section>

        {/* System Settings */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-100">System Settings</h2>
          {settings.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2 pr-4">Key</th>
                  <th className="pb-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s) => (
                  <tr key={s.id} className="border-b border-gray-800">
                    <td className="py-2 pr-4 font-mono text-sm text-blue-300">{s.key}</td>
                    <td className="py-2 text-gray-300">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Set / Update Setting
            </p>
            <div className="flex gap-2 flex-wrap">
              <input
                placeholder="Key"
                value={settingKey}
                onChange={(e) => setSettingKey(e.target.value)}
                className="w-40 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                placeholder="Value"
                value={settingValue}
                onChange={(e) => setSettingValue(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={saveSetting}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1.5 text-sm font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
