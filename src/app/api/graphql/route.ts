/**
 * GET /api/graphql  — GraphQL Playground (simple GET landing page)
 * POST /api/graphql — Execute a GraphQL query
 *
 * Schema exposes:
 *   assets(active: Boolean): [Asset]
 *   asset(id: ID!): Asset
 *   trades(assetId: ID, side: TradeSide, limit: Int): [Trade]
 *   prices(assetId: ID!, interval: String!, limit: Int): [PriceSnapshot]
 *
 * This enables mobile (React Native) and third-party clients to fetch exactly
 * the data they need in a single round-trip rather than calling multiple REST
 * endpoints.
 */

import { NextRequest } from "next/server";
import {
  graphql,
  buildSchema,
} from "graphql";
import { prisma } from "@/lib/prisma";
import { corsHeaders, handlePreflight } from "@/lib/cors";

export const dynamic = "force-dynamic";

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = buildSchema(`
  enum TradeSide { BUY SELL }

  type Asset {
    id: ID!
    symbol: String!
    name: String!
    logoUrl: String
    isActive: Boolean!
    createdAt: String!
  }

  type Trade {
    id: ID!
    assetId: ID!
    asset: Asset!
    side: TradeSide!
    price: String!
    quantity: String!
    total: String!
    exchange: String!
    tradedAt: String!
  }

  type PriceSnapshot {
    id: ID!
    assetId: ID!
    interval: String!
    open: String!
    high: String!
    low: String!
    close: String!
    volume: String!
    timestamp: String!
  }

  type Query {
    "List assets, optionally filtered by active status."
    assets(active: Boolean): [Asset!]!
    "Fetch a single asset by ID."
    asset(id: ID!): Asset
    "Recent trades. limit defaults to 50, max 200."
    trades(assetId: ID, side: TradeSide, limit: Int): [Trade!]!
    "OHLCV price snapshots for an asset."
    prices(assetId: ID!, interval: String!, limit: Int): [PriceSnapshot!]!
  }
`);

// ─── Resolvers ────────────────────────────────────────────────────────────────

const rootValue = {
  assets: async ({ active }: { active?: boolean }) => {
    return prisma.asset.findMany({
      where: active !== undefined ? { isActive: active } : {},
      orderBy: { symbol: "asc" },
    });
  },

  asset: async ({ id }: { id: string }) => {
    return prisma.asset.findUnique({ where: { id } });
  },

  trades: async ({
    assetId,
    side,
    limit = 50,
  }: {
    assetId?: string;
    side?: "BUY" | "SELL";
    limit?: number;
  }) => {
    const take = Math.min(limit, 200);
    return prisma.trade.findMany({
      where: {
        ...(assetId ? { assetId } : {}),
        ...(side ? { side } : {}),
      },
      orderBy: { tradedAt: "desc" },
      take,
      include: { asset: true },
    });
  },

  prices: async ({
    assetId,
    interval,
    limit = 60,
  }: {
    assetId: string;
    interval: string;
    limit?: number;
  }) => {
    const take = Math.min(limit, 500);
    return prisma.priceSnapshot.findMany({
      where: { assetId, interval },
      orderBy: { timestamp: "asc" },
      take,
    });
  },
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

export function OPTIONS() {
  return handlePreflight();
}

/** Simple landing page for GET requests (useful for quick manual checks). */
export function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>MultiChain GraphQL</title>
<style>body{font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:2rem}
code{background:#1e293b;padding:2px 6px;border-radius:4px}
pre{background:#1e293b;padding:1rem;border-radius:8px;overflow:auto}
a{color:#60a5fa}</style></head>
<body>
<h1>⛓️ MultiChain GraphQL API</h1>
<p>Send a <code>POST</code> request with a JSON body to this endpoint:</p>
<pre>POST /api/graphql
Content-Type: application/json

{
  "query": "{ assets { id symbol name } }"
}</pre>
<h2>Example queries</h2>
<pre>{ assets(active: true) { id symbol name } }</pre>
<pre>{ trades(limit: 10) { id side price quantity asset { symbol } } }</pre>
<pre>{ prices(assetId: "&lt;id&gt;", interval: "1m", limit: 30) { close timestamp } }</pre>
</body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
  });
}

export async function POST(request: NextRequest) {
  let body: { query?: string; variables?: Record<string, unknown>; operationName?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json(
      { errors: [{ message: "Invalid JSON body" }] },
      { status: 400, headers: corsHeaders },
    );
  }

  const { query, variables, operationName } = body;
  if (!query || typeof query !== "string") {
    return Response.json(
      { errors: [{ message: "Missing 'query' field" }] },
      { status: 400, headers: corsHeaders },
    );
  }

  try {
    const result = await graphql({
      schema,
      source: query,
      rootValue,
      variableValues: variables,
      operationName,
    });
    return Response.json(result, { headers: corsHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json(
      { errors: [{ message }] },
      { status: 500, headers: corsHeaders },
    );
  }
}
