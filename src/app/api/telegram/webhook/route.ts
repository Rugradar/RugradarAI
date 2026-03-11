import { NextRequest, NextResponse } from "next/server";
import { fetchTokenByAddress, analyzeToken } from "@/lib/api";
import { TokenAnalysis } from "@/types/token";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function POST(req: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "Bot not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const message = body.message;

    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    // Handle /start command
    if (text === "/start") {
      await sendMessage(chatId,
        "🔍 *RugRadar — AI Meme Token Scanner*\n\n" +
        "Send me a contract address and I'll scan it for:\n" +
        "• 🍯 Honeypot detection\n" +
        "• 🔒 LP lock status\n" +
        "• 👑 Ownership status\n" +
        "• 💰 Tax analysis\n" +
        "• 🐋 Whale concentration\n\n" +
        "Supported chains: *Base • BSC • Solana*\n\n" +
        "Just paste any token address to start! 👇"
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /help command
    if (text === "/help") {
      await sendMessage(chatId,
        "📖 *Commands:*\n\n" +
        "• Paste a contract address → instant scan\n" +
        "• /start — Welcome message\n" +
        "• /help — This message\n\n" +
        "🌐 Web app: rugradar-ai.vercel.app"
      );
      return NextResponse.json({ ok: true });
    }

    // Detect if it's a contract address
    const isEVMAddress = /^0x[a-fA-F0-9]{40}$/.test(text);
    const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(text);

    if (!isEVMAddress && !isSolanaAddress) {
      await sendMessage(chatId,
        "❓ That doesn't look like a valid contract address.\n\n" +
        "Send me a token address (EVM or Solana) and I'll scan it!"
      );
      return NextResponse.json({ ok: true });
    }

    // Send scanning message
    await sendMessage(chatId, "🔍 Scanning token...");

    // Fetch and analyze
    const pairs = await fetchTokenByAddress(text);

    if (!pairs || pairs.length === 0) {
      await sendMessage(chatId, "❌ Token not found. Make sure the address is correct and the token has a DEX pair.");
      return NextResponse.json({ ok: true });
    }

    const analysis = await analyzeToken(pairs[0]);
    const report = formatReport(analysis);
    await sendMessage(chatId, report);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

function formatReport(t: TokenAnalysis): string {
  const riskEmoji = {
    safe: "✅",
    warning: "⚠️",
    danger: "🔶",
    critical: "🚨",
  };

  const chainEmoji: Record<string, string> = {
    base: "🔵",
    bsc: "🟡",
    solana: "🟣",
  };

  let report = `${riskEmoji[t.riskLevel]} *${t.name}* ($${t.symbol})\n`;
  report += `${chainEmoji[t.chain] || "⚪"} Chain: ${t.chain.toUpperCase()}\n`;
  report += `📊 Risk Score: *${t.riskScore}/100* — ${t.riskLevel.toUpperCase()}\n\n`;

  report += `💲 Price: $${t.price < 0.001 ? t.price.toExponential(2) : t.price.toFixed(6)}\n`;
  report += `💰 MCap: $${t.marketCap > 1000 ? `${(t.marketCap / 1000).toFixed(0)}k` : t.marketCap}\n`;
  report += `💧 Liquidity: $${t.liquidity > 1000 ? `${(t.liquidity / 1000).toFixed(0)}k` : t.liquidity}\n`;
  report += `👥 Holders: ${t.holders.toLocaleString()}\n`;
  report += `⏰ Age: ${t.age}\n\n`;

  report += `*Quick Checks:*\n`;
  report += `${t.honeypot ? "🚨" : "✅"} Honeypot: ${t.honeypot ? "YES" : "No"}\n`;
  report += `${t.lpLocked ? "✅" : "❌"} LP Locked: ${t.lpLocked ? "Yes" : "NO"}\n`;
  report += `${t.ownershipRenounced ? "✅" : "❌"} Renounced: ${t.ownershipRenounced ? "Yes" : "NO"}\n`;
  report += `${t.mintable ? "❌" : "✅"} Mintable: ${t.mintable ? "YES" : "No"}\n`;
  report += `${t.buyTax <= 5 && t.sellTax <= 5 ? "✅" : "❌"} Tax: ${t.buyTax.toFixed(0)}% / ${t.sellTax.toFixed(0)}%\n\n`;

  if (t.risks.length > 0) {
    report += `*⚠️ Risks:*\n`;
    t.risks.forEach((r) => {
      report += `• ${r}\n`;
    });
    report += "\n";
  }

  if (t.positives.length > 0) {
    report += `*✅ Positives:*\n`;
    t.positives.forEach((p) => {
      report += `• ${p}\n`;
    });
  }

  report += `\n🌐 Full report: rugradar-ai.vercel.app`;

  return report;
}

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
  });
}
