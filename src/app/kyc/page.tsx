"use client";

import { useEffect, useState } from "react";
import WalletGate from "@/components/WalletGate";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import KYCForm from "@/components/KYCForm";

interface KYCSubmission {
  id: string;
  status: string;
  fullName: string;
  docType: string;
  createdAt: string;
  reviewNote?: string;
}

export default function KYCPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const w = localStorage.getItem("connectedWallet");
    if (!w) return;
    fetch(`/api/users?walletAddress=${w}`)
      .then((r) => r.json())
      .then((u: { id?: string }) => {
        if (u.id) {
          setUserId(u.id);
          return fetch(`/api/kyc?userId=${u.id}`);
        }
        return null;
      })
      .then((r) => r ? r.json() : [])
      .then((data: KYCSubmission[]) => { if (Array.isArray(data)) setSubmissions(data); })
      .catch(() => {});
  }, []);

  const latestSubmission = submissions[0];

  return (
    <WalletGate>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header onMenuToggle={() => setSidebarOpen((p) => !p)} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-60 px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-6">KYC Verification</h1>

          {latestSubmission && !submitted ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${
                latestSubmission.status === "APPROVED" ? "bg-green-900/50 text-green-400" :
                latestSubmission.status === "REJECTED" ? "bg-red-900/50 text-red-400" :
                "bg-yellow-900/50 text-yellow-400"
              }`}>
                {latestSubmission.status === "APPROVED" ? "✓ Verified" :
                 latestSubmission.status === "REJECTED" ? "✕ Rejected" : "⏳ Under Review"}
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>Name: <span className="text-white">{latestSubmission.fullName}</span></div>
                <div>Document: <span className="text-white">{latestSubmission.docType}</span></div>
                <div>Submitted: <span className="text-white">{new Date(latestSubmission.createdAt).toLocaleDateString()}</span></div>
                {latestSubmission.reviewNote && (
                  <div>Note: <span className="text-white">{latestSubmission.reviewNote}</span></div>
                )}
              </div>
              {latestSubmission.status === "REJECTED" && (
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Resubmit KYC
                </button>
              )}
            </div>
          ) : (
            <KYCForm
              userId={userId}
              onSuccess={() => {
                setSubmitted(true);
                // Reload submissions
                if (userId) {
                  fetch(`/api/kyc?userId=${userId}`)
                    .then((r) => r.json())
                    .then((data: KYCSubmission[]) => { if (Array.isArray(data)) setSubmissions(data); })
                    .catch(() => {});
                }
              }}
            />
          )}
        </main>
      </div>
    </WalletGate>
  );
}
