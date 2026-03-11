import { NextResponse } from "next/server";
import { fetchLatestBoosted, analyzeToken, DexPair } from "@/lib/api";

export const revalidate = 30;

export async function GET() {
  try {
    const pairs = await fetchLatestBoosted();

    if (!pairs || pairs.length === 0) {
      return NextResponse.json({ tokens: [] });
    }

    // Filter to only Base, BSC, Solana
    const filtered = pairs.filter((p: DexPair) =>
      ["base", "bsc", "solana"].includes(p.chainId)
    );

    // Analyze top 10
    const analyses = await Promise.allSettled(
      filtered.slice(0, 10).map((pair: DexPair) => analyzeToken(pair))
    );

    const tokens = analyses
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof analyzeToken>>> => r.status === "fulfilled")
      .map((r) => r.value);

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("Trending error:", error);
    return NextResponse.json({ tokens: [] });
  }
}
