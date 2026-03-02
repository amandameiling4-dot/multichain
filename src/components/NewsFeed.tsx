"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  id: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
}

const CATEGORY_STYLE: Record<string, string> = {
  MARKET: "bg-blue-900/50 text-blue-400",
  PLATFORM: "bg-purple-900/50 text-purple-400",
  PROMO: "bg-green-900/50 text-green-400",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface NewsFeedProps {
  limit?: number;
}

export default function NewsFeed({ limit = 5 }: NewsFeedProps) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data: NewsItem[]) => {
        if (Array.isArray(data)) setItems(data.slice(0, limit));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-800/60 rounded-xl h-20" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-4 text-center">No news available.</div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="bg-gray-800/40 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                CATEGORY_STYLE[item.category] ?? "bg-gray-700 text-gray-300"
              }`}
            >
              {item.category}
            </span>
            <span className="text-xs text-gray-500">{timeAgo(item.createdAt)}</span>
          </div>
          <h3 className="text-sm font-semibold text-white leading-snug mb-1">
            {item.title}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
