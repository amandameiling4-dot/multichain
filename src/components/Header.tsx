"use client";

import { useState } from "react";

interface HeaderProps {
  wallet?: string | undefined;
  onMenuToggle: () => void;
}

function truncateAddress(addr: string) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-3">About MultiChain</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          MultiChain is a real-time trading dapp offering binary options, futures,
          arbitrage, staking, and P2P trading in one unified platform. Built on
          cutting-edge blockchain technology for transparency and security.
        </p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function WhitepaperModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-3">Whitepaper</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          MultiChain utilizes a decentralized settlement layer for all trades.
          Our binary options protocol settles within seconds using on-chain price
          feeds. All user funds are secured by smart contract escrow.
        </p>
        <ul className="text-gray-400 text-sm mt-3 space-y-1 list-disc pl-4">
          <li>Zero-knowledge proof settlement</li>
          <li>Multi-chain asset support</li>
          <li>85% average payout ratio</li>
        </ul>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-3">How It Works</h2>
        <ol className="text-gray-400 text-sm space-y-2 list-decimal pl-4">
          <li>Connect your wallet to get started</li>
          <li>Deposit funds via the Wallet section</li>
          <li>Choose an asset and predict price direction</li>
          <li>Select expiry time (30s, 1m, 5m)</li>
          <li>Collect 85% payout on winning trades</li>
        </ol>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function Header({ wallet, onMenuToggle }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal] = useState<"about" | "whitepaper" | "howto" | null>(null);

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="text-gray-400 hover:text-white p-1 rounded"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-bold text-white">⛓️ MultiChain</span>
          <span className="text-xs bg-blue-600/30 text-blue-400 border border-blue-600/40 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
            LIVE
          </span>
        </div>

        {/* Right: wallet + dropdown */}
        <div className="flex items-center gap-3">
          {wallet && (
            <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full hidden sm:inline">
              {truncateAddress(wallet)}
            </span>
          )}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>Account</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-30 overflow-hidden">
                <button
                  onClick={() => { setModal("about"); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700"
                >
                  About Us
                </button>
                <button
                  onClick={() => { setModal("whitepaper"); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700"
                >
                  Whitepaper
                </button>
                <button
                  onClick={() => { setModal("howto"); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700"
                >
                  How It Works
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {modal === "about" && <AboutModal onClose={() => setModal(null)} />}
      {modal === "whitepaper" && <WhitepaperModal onClose={() => setModal(null)} />}
      {modal === "howto" && <HowItWorksModal onClose={() => setModal(null)} />}
    </>
  );
}
