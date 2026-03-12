import { NextRequest, NextResponse } from "next/server";
import { analyzeToken, DexPair } from "@/lib/api";
import { getSubscribers, wasAlerted, markAlerted } from "@/lib/subscribers";
import { TokenAnalysis } from "@/types/token";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const CRON_SECRET = process.env.CRON_SECRET || "";

export const maxDuration = 60; // Allow up to 60s for scanning

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this header for cron jobs)
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "Bot not configured" }, { status: 500 });
  }

  try {
    const subscribers = await getSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ ok: true, message: "No subscribers", alerts: 0 });
    }

    // Fetch latest tokens from DexScreener
    const res = await fetch("https://api.dexscreener.com/token-profiles/latest/v1", {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "DexScreener API failed" }, { status: 502 });
    }

    const profiles = await res.json();

    // Filter to supported chains
    const supportedChains = ["base", "bsc", "solana"];
    const filtered = profiles
      .filter((p: { chainId: string }) => supportedChains.includes(p.chainId))
      .slice(0, 20);

    if (filtered.length === 0) {
      return NextResponse.json({ ok: true, message: "No new tokens", alerts: 0 });
    }

    // Get addresses and check which ones we already alerted
    const addresses = filtered.map((p: { tokenAddress: string }) => p.tokenAddress);
    const newAddresses: string[] = [];

    for (const addr of addresses) {
      const alerted = await wasAlerted(addr);
      if (!alerted) newAddresses.push(addr);
    }

    if (newAddresses.length === 0) {
      return NextResponse.json({ ok: true, message: "All tokens already checked", alerts: 0 });
    }

    // Fetch pair data
    const pairRes = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${newAddresses.slice(0, 10).join(",")}`,
      { cache: "no-store" }
    );

    if (!pairRes.ok) {
      return NextResponse.json({ error: "DexScreener pair fetch failed" }, { status: 502 });
    }

    const pairData = await pairRes.json();
    const pairs: DexPair[] = pairData.pairs || [];

    // Dedupe by base token address
    const seen = new Set<string>();
    const uniquePairs = pairs.filter((p: DexPair) => {
      const key = `${p.chainId}-${p.baseToken.address}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return supportedChains.includes(p.chainId);
    });

    // Analyze tokens
    const analyses = await Promise.allSettled(
      uniquePairs.slice(0, 10).map((pair: DexPair) => analyzeToken(pair))
    );

    const tokens = analyses
      .filter(
        (r): r is PromiseFulfilledResult<TokenAnalysis> => r.status === "fulfilled"
      )
      .map((r) => r.value);

    // Filter dangerous tokens (critical or danger level, or honeypot)
    const dangerous = tokens.filter(
      (t) => t.honeypot || t.riskLevel === "critical" || t.riskLevel === "danger"
    );

    if (dangerous.length === 0) {
      // Mark all as checked
      await markAlerted(tokens.map((t) => t.address));
      return NextResponse.json({ ok: true, message: "No dangerous tokens found", alerts: 0, scanned: tokens.length });
    }

    // Send alerts
    let alertsSent = 0;
    for (const token of dangerous) {
      const message = formatAlert(token);

      for (const chatId of subscribers) {
        try {
          await sendTelegram(chatId, message);
          alertsSent++;
        } catch (err) {
          console.error(`Failed to send alert to ${chatId}:`, err);
        }
      }
    }

    // Mark all scanned tokens as alerted
    await markAlerted(tokens.map((t) => t.address));

    return NextResponse.json({
      ok: true,
      scanned: tokens.length,
      dangerous: dangerous.length,
      alerts: alertsSent,
      subscribers: subscribers.length,
    });
  } catch (error) {
    console.error("Cron alert error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function formatAlert(t: TokenAnalysis): string {
  const chainEmoji: Record<string, string> = {
    base: "🔵",
    bsc: "🟡",
    solana: "🟣",
  };

  let msg = "🚨 *HONEYPOT ALERT — RugRadar*\n\n";

  if (t.honeypot) {
    msg += "⛔ *CONFIRMED HONEYPOT*\n\n";
  } else {
    msg += `⚠️ *HIGH RISK TOKEN (Score: ${t.riskScore}/100)*\n\n`;
  }

  msg += `*${t.name}* ($${t.symbol})\n`;
  msg += `${chainEmoji[t.chain] || "⚪"} Chain: ${t.chain.toUpperCase()}\n`;
  msg += `📊 Risk Score: *${t.riskScore}/100* — ${t.riskLevel.toUpperCase()}\n\n`;

  msg += `💲 Price: $${t.price < 0.001 ? t.price.toExponential(2) : t.price.toFixed(6)}\n`;
  msg += `💰 MCap: $${t.marketCap > 1000 ? `${(t.marketCap / 1000).toFixed(0)}k` : t.marketCap}\n`;
  msg += `💧 Liquidity: $${t.liquidity > 1000 ? `${(t.liquidity / 1000).toFixed(0)}k` : t.liquidity}\n\n`;

  if (t.risks.length > 0) {
    msg += `*🔴 Risks:*\n`;
    t.risks.slice(0, 6).forEach((r) => {
      msg += `• ${r}\n`;
    });
    msg += "\n";
  }

  msg += `📋 Address:\n\`${t.address}\`\n\n`;
  msg += `🔍 Full scan: rugradar-ai.vercel.app\n`;
  msg += `\n_Stay safe. Don't ape blindly._ 🛡️`;

  return msg;
}

async function sendTelegram(chatId: number, text: string) {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error: ${err}`);
  }
}
