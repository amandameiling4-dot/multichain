"use client";

import Link from "next/link";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/trade", label: "Trade", icon: "📈" },
  { href: "/futures", label: "Futures", icon: "⚡" },
  { href: "/arbitrage", label: "Arbitrage", icon: "🤖" },
  { href: "/demo", label: "Demo", icon: "🎮" },
  { href: "/p2p", label: "P2P", icon: "🔄" },
  { href: "/borrow", label: "Borrow", icon: "💳" },
  { href: "/wallet", label: "Wallet", icon: "👛" },
  { href: "/withdraw", label: "Withdraw", icon: "📤" },
  { href: "/history", label: "History", icon: "📋" },
  { href: "/kyc", label: "KYC", icon: "🪪" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/support", label: "Support", icon: "💬" },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-gray-900 border-r border-gray-800 z-40 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800">
          <span className="text-lg font-bold text-white">⛓️ MultiChain</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white lg:hidden text-xl"
          >
            ×
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 px-5 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm"
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-800 text-xs text-gray-500">
          MultiChain v1.0
        </div>
      </aside>
    </>
  );
}
