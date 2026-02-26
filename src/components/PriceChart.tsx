"use client";

import { useEffect, useState } from "react";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  isActive: boolean;
}

interface PriceSnapshot {
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export default function PriceChart() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [snapshots, setSnapshots] = useState<PriceSnapshot[]>([]);
  const [interval, setInterval_] = useState("1m");

  useEffect(() => {
    fetch("/api/assets")
      .then((r) => r.json())
      .then((data: Asset[]) => {
        setAssets(data);
        if (data.length > 0) setSelectedAsset(data[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedAsset) return;
    fetch(`/api/prices?assetId=${selectedAsset.id}&interval=${interval}&limit=60`)
      .then((r) => r.json())
      .then(setSnapshots)
      .catch(console.error);
  }, [selectedAsset, interval]);

  const latestClose = snapshots.length > 0 ? Number(snapshots[snapshots.length - 1].close) : null;
  const prevClose = snapshots.length > 1 ? Number(snapshots[snapshots.length - 2].close) : null;
  const pctChange = latestClose && prevClose ? ((latestClose - prevClose) / prevClose) * 100 : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Asset & interval selectors */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedAsset?.id ?? ""}
          onChange={(e) =>
            setSelectedAsset(assets.find((a) => a.id === e.target.value) ?? null)
          }
        >
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.symbol} — {a.name}
            </option>
          ))}
        </select>

        {["1m", "5m", "1h", "1d"].map((iv) => (
          <button
            key={iv}
            onClick={() => setInterval_(iv)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              interval === iv
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {iv}
          </button>
        ))}
      </div>

      {/* Price summary */}
      {latestClose != null && (
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-white">
            ${latestClose.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          {pctChange != null && (
            <span
              className={`text-sm font-semibold ${
                pctChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {pctChange >= 0 ? "+" : ""}
              {pctChange.toFixed(2)}%
            </span>
          )}
        </div>
      )}

      {/* Simple bar chart of close prices */}
      {snapshots.length > 0 ? (
        <div className="flex items-end gap-px h-32 w-full overflow-hidden">
          {snapshots.map((s, i) => {
            const closes = snapshots.map((x) => Number(x.close));
            const min = Math.min(...closes);
            const max = Math.max(...closes);
            const range = max - min || 1;
            const heightPct = ((Number(s.close) - min) / range) * 100;
            const isLast = i === snapshots.length - 1;
            return (
              <div
                key={i}
                title={`${s.timestamp} — $${Number(s.close).toFixed(2)}`}
                style={{ height: `${Math.max(heightPct, 2)}%` }}
                className={`flex-1 rounded-sm transition-all ${
                  isLast ? "bg-blue-400" : "bg-blue-700/60 hover:bg-blue-500/80"
                }`}
              />
            );
          })}
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center text-gray-500 text-sm bg-gray-800/50 rounded">
          No price history available
        </div>
      )}
    </div>
  );
}
