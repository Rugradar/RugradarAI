import { NextRequest, NextResponse } from "next/server";
import { analyzeToken, DexPair } from "@/lib/api";

const DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const chain = req.nextUrl.searchParams.get("chain") || "base";

  if (!address) {
    return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
  }

  try {
    // Use DexScreener to find tokens associated with this wallet
    // We'll search for recently traded tokens
    const res = await fetch(
      `${DEXSCREENER_BASE}/search?q=${address}`,
      { next: { revalidate: 30 } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch wallet data" }, { status: 500 });
    }

    const data = await res.json();
    const pairs: DexPair[] = (data.pairs || [])
      .filter((p: DexPair) => ["base", "bsc", "solana"].includes(p.chainId))
      .slice(0, 10);

    const analyses = await Promise.allSettled(
      pairs.map((pair: DexPair) => analyzeToken(pair))
    );

    const tokens = analyses
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof analyzeToken>>> => r.status === "fulfilled")
      .map((r) => r.value);

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("Wallet scan error:", error);
    return NextResponse.json({ error: "Wallet scan failed" }, { status: 500 });
  }
}
