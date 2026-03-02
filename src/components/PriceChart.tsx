"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
} from "lightweight-charts";

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

const INTERVALS = ["1m", "5m", "1h", "1d"] as const;
type Interval = (typeof INTERVALS)[number];

export default function PriceChart() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [snapshots, setSnapshots] = useState<PriceSnapshot[]>([]);
  const [interval, setSelectedInterval] = useState<Interval>("1m");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Load assets once
  useEffect(() => {
    fetch("/api/assets")
      .then((r) => r.json())
      .then((data: Asset[]) => {
        setAssets(data);
        if (data.length > 0) setSelectedAsset(data[0]!);
      })
      .catch(console.error);
  }, []);

  // Load price snapshots whenever asset or interval changes
  useEffect(() => {
    if (!selectedAsset) return;
    fetch(
      `/api/prices?assetId=${selectedAsset.id}&interval=${interval}&limit=200`,
    )
      .then((r) => r.json())
      .then(setSnapshots)
      .catch(console.error);
  }, [selectedAsset, interval]);

  // Create the TradingView Lightweight chart once
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#111827" },
        textColor: "#9CA3AF",
      },
      grid: {
        vertLines: { color: "#1F2937" },
        horzLines: { color: "#1F2937" },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#374151" },
      timeScale: { borderColor: "#374151", timeVisible: true },
      width: chartContainerRef.current.clientWidth,
      height: 320,
    });

    const seriesInstance = chart.addSeries(CandlestickSeries, {
      upColor: "#22C55E",
      downColor: "#EF4444",
      borderUpColor: "#22C55E",
      borderDownColor: "#EF4444",
      wickUpColor: "#22C55E",
      wickDownColor: "#EF4444",
    });

    chartRef.current = chart;
    candleSeriesRef.current = seriesInstance;

    // Handle container resize
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    observer.observe(chartContainerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, []);

  // Update chart data whenever snapshots change
  useEffect(() => {
    if (!candleSeriesRef.current || snapshots.length === 0) return;

    const toUnixTime = (isoString: string): Time =>
      (new Date(isoString).getTime() / 1000) as Time;

    const data: CandlestickData[] = snapshots.map((s) => ({
      time: toUnixTime(s.timestamp),
      open: Number(s.open),
      high: Number(s.high),
      low: Number(s.low),
      close: Number(s.close),
    }));

    candleSeriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [snapshots]);

  const latestClose =
    snapshots.length > 0 ? Number(snapshots[snapshots.length - 1]!.close) : null;
  const prevClose =
    snapshots.length > 1 ? Number(snapshots[snapshots.length - 2]!.close) : null;
  const pctChange =
    latestClose && prevClose
      ? ((latestClose - prevClose) / prevClose) * 100
      : null;

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

        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => setSelectedInterval(iv)}
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
            $
            {latestClose.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
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

      {/* TradingView Lightweight Chart */}
      <div
        ref={chartContainerRef}
        className="w-full rounded-lg overflow-hidden"
        style={{ minHeight: 320 }}
      />

      {snapshots.length === 0 && (
        <div className="h-32 flex items-center justify-center text-gray-500 text-sm bg-gray-800/50 rounded">
          No price history available
        </div>
      )}
    </div>
  );
}

