"use client";

import { useEffect, useState } from "react";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  logoUrl?: string;
}

interface Price {
  assetId: string;
  close: string;
  open: string;
}

export default function MarketOverview() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [prices, setPrices] = useState<Record<string, Price>>({});
  const [selected, setSelected] = useState<Asset | null>(null);

  useEffect(() => {
    fetch("/api/assets")
      .then((r) => r.json())
      .then((data: Asset[]) => setAssets(data))
      .catch(() => {});
    fetch("/api/prices?limit=100")
      .then((r) => r.json())
      .then((data: { prices?: Price[] } | Price[]) => {
        const list = Array.isArray(data) ? data : (data as { prices?: Price[] }).prices ?? [];
        const map: Record<string, Price> = {};
        list.forEach((p: Price) => { map[p.assetId] = p; });
        setPrices(map);
      })
      .catch(() => {});
  }, []);

  if (assets.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-4">No assets available.</div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {assets.map((asset) => {
          const price = prices[asset.id];
          const close = price ? parseFloat(price.close) : null;
          const open = price ? parseFloat(price.open) : null;
          const change = close && open ? ((close - open) / open) * 100 : null;
          const isUp = change !== null ? change >= 0 : null;

          return (
            <button
              key={asset.id}
              onClick={() => setSelected(asset)}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:border-blue-600/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{asset.symbol}</span>
                {isUp !== null && (
                  <span className={`text-xs font-medium ${isUp ? "text-green-400" : "text-red-400"}`}>
                    {isUp ? "▲" : "▼"} {Math.abs(change!).toFixed(2)}%
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400">{asset.name}</div>
              {close !== null && (
                <div className="text-sm text-white mt-1 font-mono">
                  ${close.toLocaleString()}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-1">{selected.symbol}</h3>
            <p className="text-gray-400 text-sm mb-4">{selected.name}</p>
            {prices[selected.id] && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">Close</div>
                  <div className="text-white font-mono">${parseFloat(prices[selected.id]!.close).toLocaleString()}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">Open</div>
                  <div className="text-white font-mono">${parseFloat(prices[selected.id]!.open).toLocaleString()}</div>
                </div>
              </div>
            )}
            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
