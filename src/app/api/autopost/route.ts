import { NextRequest, NextResponse } from "next/server";
import { analyzeToken, DexPair } from "@/lib/api";
import { postTweet, isTwitterConfigured } from "@/lib/twitter";
import { TokenAnalysis } from "@/types/token";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Auth check
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "";
  const isAuthed = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isVercelCron && !isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isTwitterConfigured()) {
    return NextResponse.json({ error: "Twitter not configured" }, { status: 503 });
  }

  try {
    // Fetch top boosted tokens
    const boostRes = await fetch("https://api.dexscreener.com/token-boosts/top/v1", {
      cache: "no-store",
    });

    if (!boostRes.ok) {
      return NextResponse.json({ error: "DexScreener API failed" }, { status: 502 });
    }

    const boosted = await boostRes.json();
    const supportedChains = ["base", "bsc", "solana"];

    const filtered = boosted
      .filter((t: { chainId: string }) => supportedChains.includes(t.chainId))
      .slice(0, 8);

    if (filtered.length === 0) {
      return NextResponse.json({ ok: true, message: "No tokens to scan" });
    }

    // Fetch pair data
    const addresses = filtered.map((t: { tokenAddress: string }) => t.tokenAddress);
    const pairRes = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${addresses.join(",")}`,
      { cache: "no-store" }
    );

    if (!pairRes.ok) {
      return NextResponse.json({ error: "Pair fetch failed" }, { status: 502 });
    }

    const pairData = await pairRes.json();
    const pairs: DexPair[] = pairData.pairs || [];

    // Dedupe
    const seen = new Set<string>();
    const uniquePairs = pairs.filter((p: DexPair) => {
      const key = `${p.chainId}-${p.baseToken.address}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return supportedChains.includes(p.chainId);
    });

    // Analyze top 5
    const analyses = await Promise.allSettled(
      uniquePairs.slice(0, 5).map((pair: DexPair) => analyzeToken(pair))
    );

    const tokens = analyses
      .filter((r): r is PromiseFulfilledResult<TokenAnalysis> => r.status === "fulfilled")
      .map((r) => r.value);

    if (tokens.length === 0) {
      return NextResponse.json({ ok: true, message: "No tokens analyzed" });
    }

    // Build tweet text
    const tweet = buildTweet(tokens);

    // Post to X
    const result = await postTweet(tweet);

    if (!result) {
      return NextResponse.json({ error: "Failed to post tweet" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      tweetId: result.id,
      url: result.url,
      tokensScanned: tokens.length,
    });
  } catch (error) {
    console.error("Autopost error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function buildTweet(tokens: TokenAnalysis[]): string {
  const chainEmoji: Record<string, string> = {
    base: "🔵",
    bsc: "🟡",
    solana: "🟣",
  };

  let safe = 0;
  let warning = 0;
  let danger = 0;

  const lines: string[] = [];

  for (const t of tokens.slice(0, 5)) {
    let emoji = "🟢";
    if (t.riskLevel === "critical" || t.riskLevel === "danger") {
      emoji = "🔴";
      danger++;
    } else if (t.riskLevel === "warning") {
      emoji = "🟡";
      warning++;
    } else {
      safe++;
    }

    const chain = chainEmoji[t.chain] || "⚪";
    const flag = t.honeypot
      ? "HONEYPOT 🍯"
      : t.risks.length > 0
      ? t.risks[0].replace(/^[⚠️🚨❌]+\s*/, "").slice(0, 30)
      : "Clean ✅";

    lines.push(`${emoji} $${t.symbol} ${chain} ${t.riskScore}/100 — ${flag}`);
  }

  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });

  let tweet = `🔍 Trending Token Scan — ${time} UTC\n\n`;
  tweet += lines.join("\n");
  tweet += `\n\n${safe > 0 ? `🟢${safe} safe ` : ""}${warning > 0 ? `🟡${warning} warning ` : ""}${danger > 0 ? `🔴${danger} danger` : ""}`;
  tweet += `\n\nScan any token free 👇\nrugradar-ai.vercel.app`;

  return tweet;
}
