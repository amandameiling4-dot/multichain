"use client";

import { useState, useEffect, ReactNode } from "react";

interface WalletGateProps {
  children: ReactNode;
}

function generateWalletAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

async function establishSession(walletAddress: string): Promise<boolean> {
  try {
    const nonceRes = await fetch(`/api/auth/nonce?walletAddress=${encodeURIComponent(walletAddress)}`);
    if (!nonceRes.ok) return false;
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ walletAddress }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function WalletGate({ children }: WalletGateProps) {
  const [wallet, setWallet] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("connectedWallet");
    return null;
  });
  const [connecting, setConnecting] = useState(false);

  // On mount: verify existing session; re-establish or clear if invalid.
  useEffect(() => {
    const stored = localStorage.getItem("connectedWallet");
    if (!stored) return;

    fetch("/api/me", { credentials: "include" })
      .then((r) => {
        if (r.ok) {
          return r.json().then((data: { walletAddress?: string }) => {
            // Sync the wallet address from the session; fall back to the stored value.
            const addr = data.walletAddress ?? stored;
            localStorage.setItem("connectedWallet", addr);
            setWallet(addr);
          });
        }
        // Session is invalid or expired – try to re-establish it.
        return establishSession(stored).then((ok) => {
          if (ok) {
            // Re-establishment succeeded; wallet is already set above.
            return;
          }
          // Re-establishment failed. Try fallback: register via legacy users endpoint.
          return fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress: stored }),
          })
            .then(() => {
              // Fallback succeeded; keep the stored wallet.
              localStorage.setItem("connectedWallet", stored);
              setWallet(stored);
            })
            .catch(() => {
              // Fallback also failed; clear the wallet.
              localStorage.removeItem("connectedWallet");
              setWallet(null);
            });
        });
      })
      .catch(() => {
        // Network error – keep the locally stored wallet without changes.
      });
  }, []);

  async function connectWallet() {
    setConnecting(true);
    try {
      const addr = generateWalletAddress();
      const ok = await establishSession(addr);
      if (ok) {
        localStorage.setItem("connectedWallet", addr);
        setWallet(addr);
      } else {
        // Fallback: register via the legacy users endpoint and keep going.
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: addr }),
        }).catch(() => {});
        localStorage.setItem("connectedWallet", addr);
        setWallet(addr);
      }
    } finally {
      setConnecting(false);
    }
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">⛓️</div>
          <h1 className="text-2xl font-bold text-white mb-2">MultiChain</h1>
          <p className="text-gray-400 text-sm mb-8">
            Connect your wallet to start trading on the MultiChain platform.
          </p>
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {connecting ? "Connecting…" : "Connect Wallet"}
          </button>
          <p className="text-xs text-gray-600 mt-4">
            Mock wallet for demo purposes
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
