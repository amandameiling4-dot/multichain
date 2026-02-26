import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/prices
 * Query params: assetId (required), interval (default "1m"), limit (default 100)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId");
  const interval = searchParams.get("interval") ?? "1m";
  const limit = Math.min(Number(searchParams.get("limit") ?? "100"), 500);

  if (!assetId) {
    return Response.json({ error: "assetId is required" }, { status: 400 });
  }

  const snapshots = await prisma.priceSnapshot.findMany({
    where: { assetId, interval },
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  return Response.json(snapshots.reverse());
}

/**
 * POST /api/prices
 * Upsert a price snapshot.
 * Body: { assetId, interval, open, high, low, close, volume, timestamp }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { assetId, interval, open, high, low, close, volume, timestamp } =
    body as {
      assetId?: string;
      interval?: string;
      open?: number;
      high?: number;
      low?: number;
      close?: number;
      volume?: number;
      timestamp?: string;
    };

  if (
    !assetId ||
    !interval ||
    open == null ||
    high == null ||
    low == null ||
    close == null ||
    volume == null ||
    !timestamp
  ) {
    return Response.json(
      { error: "All price fields are required" },
      { status: 400 }
    );
  }

  const snapshot = await prisma.priceSnapshot.upsert({
    where: {
      assetId_interval_timestamp: {
        assetId,
        interval,
        timestamp: new Date(timestamp),
      },
    },
    create: {
      assetId,
      interval,
      open,
      high,
      low,
      close,
      volume,
      timestamp: new Date(timestamp),
    },
    update: { open, high, low, close, volume },
  });

  return Response.json(snapshot, { status: 201 });
}
