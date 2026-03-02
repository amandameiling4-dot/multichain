/**
 * GET /api/news
 * Returns the platform news/announcements feed.
 *
 * News items are stored as a JSON array in the SystemSetting table under the
 * key "news_feed". Admins manage them via PUT /api/admin/settings with
 * { key: "news_feed", value: JSON.stringify([...]) }.
 *
 * Each news item shape:
 *   { id: string; title: string; body: string; category: string; createdAt: string }
 */

import { prisma } from "@/lib/prisma";
import { corsHeaders } from "@/lib/cors";

export const dynamic = "force-dynamic";

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  category: "MARKET" | "PLATFORM" | "PROMO" | string;
  createdAt: string;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Bitcoin surges past $70,000 as ETF inflows accelerate",
    body: "Bitcoin reached a new multi-month high driven by strong institutional demand from spot ETF products.",
    category: "MARKET",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "MultiChain platform upgrade: WebSocket streaming now live",
    body: "Real-time trade data is now delivered via WebSocket for sub-100ms latency. All users benefit automatically.",
    category: "PLATFORM",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Ethereum 2.0 staking rewards increase to 5.4% APY",
    body: "Following recent network activity, ETH staking yields have risen significantly, making staking more attractive.",
    category: "MARKET",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "news_feed" },
    });

    if (setting?.value) {
      const items = JSON.parse(setting.value) as NewsItem[];
      return Response.json(items, { headers: corsHeaders });
    }
  } catch {
    // fall through to fallback
  }

  return Response.json(FALLBACK_NEWS, { headers: corsHeaders });
}
