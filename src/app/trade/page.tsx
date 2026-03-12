"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { ArrowRightLeft, Shield, ExternalLink } from "lucide-react";

type Chain = "solana" | "base" | "bsc";

const dexLinks: Record<Chain, { name: string; url: string; color: string }> = {
  solana: { name: "Jupiter", url: "https://jup.ag", color: "#9945ff" },
  base: { name: "Uniswap", url: "https://app.uniswap.org/?chain=base", color: "#0052ff" },
  bsc: { name: "PancakeSwap", url: "https://pancakeswap.finance", color: "#f0b90b" },
};

export default function TradePage() {
  const [activeChain, setActiveChain] = useState<Chain>("solana");
  const [tokenAddress, setTokenAddress] = useState("");

  const getSwapUrl = () => {
    if (!tokenAddress) return dexLinks[activeChain].url;
    switch (activeChain) {
      case "solana":
        return `https://jup.ag/swap/SOL-${tokenAddress}`;
      case "base":
        return `https://app.uniswap.org/swap?chain=base&outputCurrency=${tokenAddress}`;
      case "bsc":
        return `https://pancakeswap.finance/swap?outputCurrency=${tokenAddress}`;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00ff88]/20 bg-[#00ff88]/5 mb-4">
            <ArrowRightLeft className="w-4 h-4 text-[#00ff88]" />
            <span className="text-xs text-[#00ff88] font-bold tracking-wider">SCAN → TRADE</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Quick Trade</h1>
          <p className="text-gray-400">Scan a token, verify it&apos;s safe, then trade — all in one place.</p>
        </div>

        {/* Chain Selector */}
        <div className="flex justify-center gap-3 mb-8">
          {(Object.keys(dexLinks) as Chain[]).map((chain) => (
            <button
              key={chain}
              onClick={() => setActiveChain(chain)}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all border ${
                activeChain === chain
                  ? `border-[${dexLinks[chain].color}] bg-[${dexLinks[chain].color}]/10 text-white`
                  : "border-[#1a2332] text-gray-500 hover:text-gray-300"
              }`}
              style={
                activeChain === chain
                  ? { borderColor: dexLinks[chain].color, backgroundColor: `${dexLinks[chain].color}15` }
                  : {}
              }
            >
              {chain === "solana" ? "🟣 Solana" : chain === "base" ? "🔵 Base" : "🟡 BSC"}
            </button>
          ))}
        </div>

        {/* Token Address Input */}
        <div className="bg-[#131a27] border border-[#1a2332] rounded-xl p-6 mb-6">
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Token Address (optional)</label>
          <input
            type="text"
            placeholder="Paste contract address to trade specific token..."
            className="w-full bg-[#0a0a1a] border border-[#1a2332] rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00ff88]/50 transition-colors font-mono"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
        </div>

        {/* Jupiter Embed for Solana */}
        {activeChain === "solana" && (
          <div className="bg-[#131a27] border border-[#1a2332] rounded-xl overflow-hidden mb-6">
            <div className="flex items-center justify-between p-4 border-b border-[#1a2332]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🟣</span>
                <span className="text-white font-bold">Jupiter Swap</span>
                <span className="text-xs text-gray-500">Powered by Jupiter Aggregator</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#00ff88]">
                <Shield className="w-3 h-3" />
                Best price guaranteed
              </div>
            </div>
            <iframe
              src={`https://jup.ag/swap/SOL${tokenAddress ? `-${tokenAddress}` : ""}${process.env.NEXT_PUBLIC_JUP_REFERRAL ? `?referral=${process.env.NEXT_PUBLIC_JUP_REFERRAL}&feeBps=${process.env.NEXT_PUBLIC_JUP_FEE_BPS || "50"}` : ""}`}
              width="100%"
              height="600"
              style={{ border: "none", background: "#131a27" }}
              title="Jupiter Swap"
              allow="clipboard-write"
            />
          </div>
        )}

        {/* DEX Link for Base/BSC */}
        {activeChain !== "solana" && (
          <div className="bg-[#131a27] border border-[#1a2332] rounded-xl p-8 text-center mb-6">
            <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold text-white mb-2">
              Trade on {dexLinks[activeChain].name}
            </h3>
            <p className="text-gray-400 mb-6">
              {activeChain === "base"
                ? "Swap tokens on Base via Uniswap — the largest DEX."
                : "Swap tokens on BSC via PancakeSwap."}
            </p>
            <a
              href={getSwapUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors text-black"
              style={{ backgroundColor: dexLinks[activeChain].color }}
            >
              <ExternalLink className="w-4 h-4" />
              Open {dexLinks[activeChain].name}
            </a>
          </div>
        )}

        {/* Safety Warning */}
        <div className="bg-[#ff4444]/5 border border-[#ff4444]/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#ff4444] mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Always scan before trading</h4>
              <p className="text-xs text-gray-400">
                Use RugRadar to check any token before buying. We detect honeypots, LP locks, tax traps, and other risks.
                Trading meme tokens is high risk — never invest more than you can afford to lose.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
