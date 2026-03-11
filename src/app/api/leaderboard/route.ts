import { NextRequest, NextResponse } from "next/server";
import { fetchLatestBoosted, analyzeToken, DexPair } from "@/lib/api";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const sort = req.nextUrl.searchParams.get("sort") || "dangerous"; // "dangerous" | "safe"

  try {
    const pairs = await fetchLatestBoosted();
    const filtered = pairs
      .filter((p: DexPair) => ["base", "bsc", "solana"].includes(p.chainId))
      .slice(0, 15);

    const analyses = await Promise.allSettled(
      filtered.map((pair: DexPair) => analyzeToken(pair))
    );

    let tokens = analyses
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof analyzeToken>>> => r.status === "fulfilled")
      .map((r) => r.value);

    // Sort by risk score
    if (sort === "dangerous") {
      tokens.sort((a, b) => b.riskScore - a.riskScore);
    } else {
      tokens.sort((a, b) => a.riskScore - b.riskScore);
    }

    return NextResponse.json({ tokens: tokens.slice(0, 10) });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ tokens: [] });
  }
}
