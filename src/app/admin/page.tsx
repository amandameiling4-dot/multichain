"use client";

import { useState } from "react";
import Link from "next/link";

// ── Type definitions ────────────────────────────────────────────────────────

interface Alert {
  id: string;
  assetSymbol: string;
  condition: string;
  threshold: string;
  message: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Setting { id: string; key: string; value: string; }

interface Asset { id: string; symbol: string; name: string; isActive: boolean; }

interface DepositProof {
  id: string;
  userId: string;
  amount: string;
  network: string;
  txHash: string;
  screenshot?: string;
  status: string;
  adminNote?: string;
  createdAt: string;
  user?: { walletAddress: string; displayName?: string; email?: string };
}

interface Withdrawal {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  destination: string;
  method: string;
  status: string;
  adminNote?: string;
  txRef?: string;
  createdAt: string;
  user?: { walletAddress: string; displayName?: string; email?: string };
}

interface KYCSub {
  id: string;
  userId: string;
  fullName: string;
  docType: string;
  docNumber: string;
  status: string;
  reviewNote?: string;
  createdAt: string;
  user?: { walletAddress: string; displayName?: string };
}

interface AppUser {
  id: string;
  walletAddress: string;
  userId: string;
  displayName?: string;
  email?: string;
  role: string;
  isFrozen: boolean;
  vipLevel: number;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  adminId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  after?: string;
  createdAt: string;
  user?: { walletAddress: string; displayName?: string };
}

// ── Status badge helper ──────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-900/50 text-yellow-400",
  APPROVED: "bg-green-900/50 text-green-400",
  REJECTED: "bg-red-900/50 text-red-400",
  PAID: "bg-blue-900/50 text-blue-400",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[status] ?? "bg-gray-800 text-gray-400"}`}>
      {status}
    </span>
  );
}

// ── Modal for approve/reject with note ──────────────────────────────────────

interface ReviewModalProps {
  title: string;
  showPaid?: boolean;
  onConfirm: (status: string, note: string, txRef?: string) => void;
  onClose: () => void;
}

function ReviewModal({ title, showPaid, onConfirm, onClose }: ReviewModalProps) {
  const [status, setStatus] = useState("APPROVED");
  const [note, setNote] = useState("");
  const [txRef, setTxRef] = useState("");
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex gap-2">
          {["APPROVED", "REJECTED", ...(showPaid ? ["PAID"] : [])].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                status === s
                  ? s === "APPROVED" || s === "PAID" ? "bg-green-700 text-white" : "bg-red-700 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <textarea
          placeholder="Admin note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none"
        />
        {showPaid && status === "PAID" && (
          <input
            placeholder="TX Reference / hash (optional)"
            value={txRef}
            onChange={(e) => setTxRef(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
          />
        )}
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(status, note, txRef || undefined)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section components ───────────────────────────────────────────────────────

function DepositsSection({ headers }: { headers: Record<string, string> }) {
  const [deposits, setDeposits] = useState<DepositProof[]>([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loaded, setLoaded] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);

  function load(s = statusFilter) {
    setLoaded(false);
    fetch(`/api/admin/deposits?status=${s}`, { headers })
      .then((r) => r.json())
      .then((d: DepositProof[]) => { if (Array.isArray(d)) setDeposits(d); })
      .finally(() => setLoaded(true));
  }

  function changeStatus(s: string) { setStatusFilter(s); load(s); }

  async function review(id: string, status: string, note: string) {
    await fetch("/api/admin/deposits", {
      method: "PATCH", headers,
      body: JSON.stringify({ id, status, adminNote: note }),
    });
    setReviewing(null);
    load();
  }

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
      {reviewing && (
        <ReviewModal title="Review Deposit" onConfirm={(s, n) => review(reviewing, s, n)} onClose={() => setReviewing(null)} />
      )}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-100">Deposit Proofs</h2>
        <div className="flex gap-1">
          {["PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button key={s} onClick={() => changeStatus(s)}
              className={`text-xs px-2 py-1 rounded transition-colors ${statusFilter === s ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {s}
            </button>
          ))}
          <button onClick={() => load()} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:bg-gray-700">↻</button>
        </div>
      </div>
      {!loaded ? (
        <p className="text-gray-500 text-sm">Click ↻ to load</p>
      ) : deposits.length === 0 ? (
        <p className="text-gray-500 text-sm">No {statusFilter.toLowerCase()} deposits.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="pb-2 text-left pr-3">User</th>
                <th className="pb-2 text-left pr-3">Amount</th>
                <th className="pb-2 text-left pr-3">Network</th>
                <th className="pb-2 text-left pr-3">TX Hash</th>
                <th className="pb-2 text-left pr-3">Status</th>
                <th className="pb-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d.id} className="border-b border-gray-800/50">
                  <td className="py-2 pr-3 text-gray-300">{d.user?.displayName ?? d.user?.walletAddress?.slice(0, 8) ?? d.userId.slice(0, 8)}</td>
                  <td className="py-2 pr-3 text-white">${d.amount}</td>
                  <td className="py-2 pr-3 text-gray-400">{d.network}</td>
                  <td className="py-2 pr-3 font-mono text-gray-400">{d.txHash.slice(0, 12)}...</td>
                  <td className="py-2 pr-3"><Badge status={d.status} /></td>
                  <td className="py-2">
                    {d.status === "PENDING" && (
                      <button onClick={() => setReviewing(d.id)} className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-2 py-0.5 rounded">Review</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function WithdrawalsSection({ headers }: { headers: Record<string, string> }) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loaded, setLoaded] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);

  function load(s = statusFilter) {
    setLoaded(false);
    fetch(`/api/admin/withdrawals?status=${s}`, { headers })
      .then((r) => r.json())
      .then((d: Withdrawal[]) => { if (Array.isArray(d)) setWithdrawals(d); })
      .finally(() => setLoaded(true));
  }

  function changeStatus(s: string) { setStatusFilter(s); load(s); }

  async function review(id: string, status: string, note: string, txRef?: string) {
    await fetch("/api/admin/withdrawals", {
      method: "PATCH", headers,
      body: JSON.stringify({ id, status, adminNote: note, txRef }),
    });
    setReviewing(null);
    load();
  }

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
      {reviewing && (
        <ReviewModal title="Review Withdrawal" showPaid onConfirm={(s, n, r) => review(reviewing, s, n, r)} onClose={() => setReviewing(null)} />
      )}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-100">Withdrawals</h2>
        <div className="flex gap-1">
          {["PENDING", "APPROVED", "PAID", "REJECTED"].map((s) => (
            <button key={s} onClick={() => changeStatus(s)}
              className={`text-xs px-2 py-1 rounded transition-colors ${statusFilter === s ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {s}
            </button>
          ))}
          <button onClick={() => load()} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:bg-gray-700">↻</button>
        </div>
      </div>
      {!loaded ? (
        <p className="text-gray-500 text-sm">Click ↻ to load</p>
      ) : withdrawals.length === 0 ? (
        <p className="text-gray-500 text-sm">No {statusFilter.toLowerCase()} withdrawals.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="pb-2 text-left pr-3">User</th>
                <th className="pb-2 text-left pr-3">Amount</th>
                <th className="pb-2 text-left pr-3">Destination</th>
                <th className="pb-2 text-left pr-3">Method</th>
                <th className="pb-2 text-left pr-3">Status</th>
                <th className="pb-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-b border-gray-800/50">
                  <td className="py-2 pr-3 text-gray-300">{w.user?.displayName ?? w.user?.walletAddress?.slice(0, 8) ?? w.userId.slice(0, 8)}</td>
                  <td className="py-2 pr-3 text-white">{w.amount} {w.currency}</td>
                  <td className="py-2 pr-3 font-mono text-gray-400">{w.destination.slice(0, 14)}...</td>
                  <td className="py-2 pr-3 text-gray-400">{w.method}</td>
                  <td className="py-2 pr-3"><Badge status={w.status} /></td>
                  <td className="py-2">
                    {(w.status === "PENDING" || w.status === "APPROVED") && (
                      <button onClick={() => setReviewing(w.id)} className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-2 py-0.5 rounded">Review</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function KYCSection({ headers }: { headers: Record<string, string> }) {
  const [submissions, setSubmissions] = useState<KYCSub[]>([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loaded, setLoaded] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);

  function load(s = statusFilter) {
    setLoaded(false);
    fetch(`/api/admin/kyc?status=${s}`, { headers })
      .then((r) => r.json())
      .then((d: KYCSub[]) => { if (Array.isArray(d)) setSubmissions(d); })
      .finally(() => setLoaded(true));
  }

  function changeStatus(s: string) { setStatusFilter(s); load(s); }

  async function review(id: string, status: string, note: string) {
    await fetch("/api/admin/kyc", {
      method: "PUT", headers,
      body: JSON.stringify({ id, status, reviewNote: note }),
    });
    setReviewing(null);
    load();
  }

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
      {reviewing && (
        <ReviewModal title="Review KYC" onConfirm={(s, n) => review(reviewing, s, n)} onClose={() => setReviewing(null)} />
      )}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-100">KYC Submissions</h2>
        <div className="flex gap-1">
          {["PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button key={s} onClick={() => changeStatus(s)}
              className={`text-xs px-2 py-1 rounded transition-colors ${statusFilter === s ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {s}
            </button>
          ))}
          <button onClick={() => load()} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:bg-gray-700">↻</button>
        </div>
      </div>
      {!loaded ? (
        <p className="text-gray-500 text-sm">Click ↻ to load</p>
      ) : submissions.length === 0 ? (
        <p className="text-gray-500 text-sm">No {statusFilter.toLowerCase()} KYC submissions.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="pb-2 text-left pr-3">Name</th>
                <th className="pb-2 text-left pr-3">Doc Type</th>
                <th className="pb-2 text-left pr-3">Wallet</th>
                <th className="pb-2 text-left pr-3">Status</th>
                <th className="pb-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((k) => (
                <tr key={k.id} className="border-b border-gray-800/50">
                  <td className="py-2 pr-3 text-white">{k.fullName}</td>
                  <td className="py-2 pr-3 text-gray-400">{k.docType}</td>
                  <td className="py-2 pr-3 font-mono text-gray-400">{k.user?.walletAddress?.slice(0, 10) ?? k.userId.slice(0, 10)}</td>
                  <td className="py-2 pr-3"><Badge status={k.status} /></td>
                  <td className="py-2">
                    {k.status === "PENDING" && (
                      <button onClick={() => setReviewing(k.id)} className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-2 py-0.5 rounded">Review</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function UsersSection({ headers }: { headers: Record<string, string> }) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");

  function load() {
    setLoaded(false);
    fetch("/api/admin/appusers", { headers })
      .then((r) => r.json())
      .then((d: AppUser[]) => { if (Array.isArray(d)) setUsers(d); })
      .finally(() => setLoaded(true));
  }

  async function toggleFreeze(user: AppUser) {
    await fetch(`/api/admin/appusers/${user.id}`, { method: "PATCH", headers, body: JSON.stringify({ isFrozen: !user.isFrozen }) });
    load();
  }

  async function changeRole(user: AppUser, role: string) {
    await fetch(`/api/admin/appusers/${user.id}`, { method: "PATCH", headers, body: JSON.stringify({ role }) });
    load();
  }

  const filtered = users.filter((u) =>
    !search ||
    u.walletAddress?.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-100">User Management</h2>
        <div className="flex gap-2">
          <input
            placeholder="Search wallet/name/email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs w-48"
          />
          <button onClick={load} className="text-xs px-3 py-1 rounded bg-gray-800 text-gray-400 hover:bg-gray-700">↻ Load</button>
        </div>
      </div>
      {!loaded ? (
        <p className="text-gray-500 text-sm">Click ↻ Load to fetch users</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="pb-2 text-left pr-3">Wallet</th>
                <th className="pb-2 text-left pr-3">Name</th>
                <th className="pb-2 text-left pr-3">Role</th>
                <th className="pb-2 text-left pr-3">VIP</th>
                <th className="pb-2 text-left pr-3">Status</th>
                <th className="pb-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((u) => (
                <tr key={u.id} className="border-b border-gray-800/50">
                  <td className="py-2 pr-3 font-mono text-gray-300">{u.walletAddress.slice(0, 10)}...</td>
                  <td className="py-2 pr-3 text-white">{u.displayName ?? "—"}</td>
                  <td className="py-2 pr-3">
                    <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-white text-xs rounded px-1 py-0.5">
                      {["USER", "SUPPORT", "OPS_ADMIN", "SUPER_ADMIN"].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3 text-yellow-400">{u.vipLevel}</td>
                  <td className="py-2 pr-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${u.isFrozen ? "bg-red-900/50 text-red-400" : "bg-green-900/50 text-green-400"}`}>
                      {u.isFrozen ? "Frozen" : "Active"}
                    </span>
                  </td>
                  <td className="py-2">
                    <button onClick={() => toggleFreeze(u)}
                      className={`text-xs px-2 py-0.5 rounded ${u.isFrozen ? "bg-green-800 hover:bg-green-700 text-white" : "bg-red-900 hover:bg-red-800 text-white"}`}>
                      {u.isFrozen ? "Unfreeze" : "Freeze"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 50 && (
            <p className="text-xs text-gray-500 mt-2">Showing 50 of {filtered.length}. Refine with search.</p>
          )}
        </div>
      )}
    </section>
  );
}

function AuditSection({ headers }: { headers: Record<string, string> }) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  function load() {
    setLoaded(false);
    fetch("/api/admin/audit?limit=50", { headers })
      .then((r) => r.json())
      .then((d: AuditEntry[]) => { if (Array.isArray(d)) setLogs(d); })
      .finally(() => setLoaded(true));
  }

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Audit Log</h2>
        <button onClick={load} className="text-xs px-3 py-1 rounded bg-gray-800 text-gray-400 hover:bg-gray-700">↻ Load</button>
      </div>
      {!loaded ? (
        <p className="text-gray-500 text-sm">Click ↻ Load to fetch audit log</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500 text-sm">No audit entries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="pb-2 text-left pr-3">Action</th>
                <th className="pb-2 text-left pr-3">Entity</th>
                <th className="pb-2 text-left pr-3">User</th>
                <th className="pb-2 text-left pr-3">Admin</th>
                <th className="pb-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-gray-800/50">
                  <td className="py-2 pr-3 text-blue-300 font-medium">{l.action}</td>
                  <td className="py-2 pr-3 text-gray-400">{l.entityType ?? "—"}</td>
                  <td className="py-2 pr-3 text-gray-300 font-mono">{l.user?.walletAddress?.slice(0, 10) ?? "—"}</td>
                  <td className="py-2 pr-3 text-gray-400">{l.adminId?.slice(0, 12) ?? "system"}</td>
                  <td className="py-2 text-gray-500">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ── Main admin page ─────────────────────────────────────────────────────────

type AdminTab = "queues" | "users" | "system" | "audit";

export default function AdminPage() {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("admin_key") ?? "";
    return "";
  });
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("queues");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [newAlert, setNewAlert] = useState({ assetSymbol: "", condition: "PRICE_ABOVE", threshold: "", message: "" });
  const [newAsset, setNewAsset] = useState({ symbol: "", name: "", logoUrl: "" });
  const [settingKey, setSettingKey] = useState("");
  const [settingValue, setSettingValue] = useState("");

  const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };

  async function login() {
    const res = await fetch("/api/admin/settings", { headers });
    if (res.ok) { setAuthed(true); setAuthError(""); loadSystem(); }
    else setAuthError("Invalid API key");
  }

  async function loadSystem() {
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
    const res = await fetch("/api/admin/alerts", { method: "POST", headers, body: JSON.stringify({ ...newAlert, threshold: Number(newAlert.threshold) }) });
    if (res.ok) { setNewAlert({ assetSymbol: "", condition: "PRICE_ABOVE", threshold: "", message: "" }); loadSystem(); }
  }

  async function deleteAlert(id: string) {
    await fetch(`/api/admin/alerts?id=${id}`, { method: "DELETE", headers });
    loadSystem();
  }

  async function createAsset() {
    const res = await fetch("/api/assets", { method: "POST", headers, body: JSON.stringify(newAsset) });
    if (res.ok) { setNewAsset({ symbol: "", name: "", logoUrl: "" }); loadSystem(); }
  }

  async function saveSetting() {
    const res = await fetch("/api/admin/settings", { method: "PUT", headers, body: JSON.stringify({ key: settingKey, value: settingValue }) });
    if (res.ok) { setSettingKey(""); setSettingValue(""); loadSystem(); }
  }

  const handleLogin = () => { sessionStorage.setItem("admin_key", apiKey); login(); };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-xl font-bold text-white">Admin Login</h1>
          <p className="text-sm text-gray-400">Enter your Admin API key to access the admin panel.</p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Admin API Key"
            className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {authError && <p className="text-red-400 text-xs">{authError}</p>}
          <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-2 text-sm font-medium transition-colors">Login</button>
        </div>
      </div>
    );
  }

  const TABS: { key: AdminTab; label: string }[] = [
    { key: "queues", label: "Review Queues" },
    { key: "users", label: "Users" },
    { key: "system", label: "System" },
    { key: "audit", label: "Audit Log" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight">⛓️ MultiChain Admin</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <button onClick={() => { sessionStorage.removeItem("admin_key"); setAuthed(false); setApiKey(""); }} className="text-gray-400 hover:text-white transition-colors">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <div className="border-b border-gray-800 px-6">
        <div className="max-w-7xl mx-auto flex gap-1 pt-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === t.key ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "queues" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepositsSection headers={headers} />
            <WithdrawalsSection headers={headers} />
            <div className="lg:col-span-2">
              <KYCSection headers={headers} />
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="grid grid-cols-1 gap-6">
            <UsersSection headers={headers} />
          </div>
        )}

        {activeTab === "system" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.isActive ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                          {a.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Add Asset</p>
                <div className="flex gap-2">
                  <input placeholder="Symbol" value={newAsset.symbol} onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm" />
                  <input placeholder="Name" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} className="flex-1 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm" />
                </div>
                <button onClick={createAsset} className="self-start bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1.5 text-sm font-medium">Add Asset</button>
              </div>
            </section>

            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-100">Alerts</h2>
              <div className="flex flex-col gap-2 overflow-auto max-h-52">
                {alerts.length === 0 && <p className="text-gray-500 text-sm">No alerts configured.</p>}
                {alerts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">{a.assetSymbol}</span>{" "}
                      <span className="text-gray-400">{a.condition.replace(/_/g, " ")} ${Number(a.threshold).toLocaleString()}</span>
                      {a.message && <span className="ml-2 text-gray-500 text-xs">{a.message}</span>}
                    </div>
                    <button onClick={() => deleteAlert(a.id)} className="text-red-400 hover:text-red-300 text-xs ml-4">Disable</button>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">New Alert</p>
                <div className="flex gap-2 flex-wrap">
                  <input placeholder="Symbol" value={newAlert.assetSymbol} onChange={(e) => setNewAlert({ ...newAlert, assetSymbol: e.target.value })} className="w-24 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm" />
                  <select value={newAlert.condition} onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })} className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm">
                    <option value="PRICE_ABOVE">Price Above</option>
                    <option value="PRICE_BELOW">Price Below</option>
                    <option value="VOLUME_ABOVE">Volume Above</option>
                  </select>
                  <input type="number" placeholder="Threshold" value={newAlert.threshold} onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })} className="w-28 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm" />
                </div>
                <input placeholder="Optional message" value={newAlert.message} onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })} className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm" />
                <button onClick={createAlert} className="self-start bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1.5 text-sm font-medium">Create Alert</button>
              </div>
            </section>

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
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Set / Update Setting</p>
                <div className="flex gap-2 flex-wrap">
                  <input placeholder="Key" value={settingKey} onChange={(e) => setSettingKey(e.target.value)} className="w-40 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm" />
                  <input placeholder="Value" value={settingValue} onChange={(e) => setSettingValue(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm" />
                  <button onClick={saveSetting} className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1.5 text-sm font-medium">Save</button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="grid grid-cols-1 gap-6">
            <AuditSection headers={headers} />
          </div>
        )}
      </main>
    </div>
  );
}
