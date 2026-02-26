"use client";

import { useState, ReactNode } from "react";

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

export default function WalletGate({ children }: WalletGateProps) {
  const [wallet, setWallet] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("connectedWallet");
    return null;
  });

  function connectWallet() {
    const addr = generateWalletAddress();
    localStorage.setItem("connectedWallet", addr);
    setWallet(addr);
    // Register user in backend
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: addr }),
    }).catch(() => {});
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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Connect Wallet
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
