import { NextRequest, NextResponse } from "next/server";
import { analyzeToken, DexPair } from "@/lib/api";

export const revalidate = 15;

export async function GET(req: NextRequest) {
  const chain = req.nextUrl.searchParams.get("chain") || "all";

  try {
    // Fetch latest token profiles from DexScreener
    const res = await fetch("https://api.dexscreener.com/token-profiles/latest/v1", {
      next: { revalidate: 15 },
    });

    if (!res.ok) {
      return NextResponse.json({ tokens: [] });
    }

    const profiles = await res.json();

    // Get addresses and filter by chain
    const chainMap: Record<string, string> = {
      base: "base",
      bsc: "bsc",
      solana: "solana",
    };

    let filtered = profiles.slice(0, 30);
    if (chain !== "all") {
      filtered = filtered.filter((p: { chainId: string }) => p.chainId === chainMap[chain]);
    } else {
      filtered = filtered.filter((p: { chainId: string }) =>
        ["base", "bsc", "solana"].includes(p.chainId)
      );
    }

    // Fetch pair data for these tokens
    const addresses = filtered
      .slice(0, 12)
      .map((p: { tokenAddress: string }) => p.tokenAddress);

    if (addresses.length === 0) {
      return NextResponse.json({ tokens: [] });
    }

    const pairRes = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${addresses.join(",")}`,
      { next: { revalidate: 15 } }
    );

    if (!pairRes.ok) {
      return NextResponse.json({ tokens: [] });
    }

    const pairData = await pairRes.json();
    const pairs: DexPair[] = pairData.pairs || [];

    // Dedupe by base token address
    const seen = new Set<string>();
    const uniquePairs = pairs.filter((p: DexPair) => {
      const key = `${p.chainId}-${p.baseToken.address}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return ["base", "bsc", "solana"].includes(p.chainId);
    });

    const analyses = await Promise.allSettled(
      uniquePairs.slice(0, 10).map((pair: DexPair) => analyzeToken(pair))
    );

    const tokens = analyses
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof analyzeToken>>> => r.status === "fulfilled")
      .map((r) => r.value);

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("New tokens error:", error);
    return NextResponse.json({ tokens: [] });
  }
}
