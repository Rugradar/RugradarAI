"use client";

import { useState, useEffect } from "react";
import { Trophy, Skull, Shield, Loader2 } from "lucide-react";
import { TokenAnalysis } from "@/types/token";
import RiskBadge from "./RiskBadge";

const chainColors: Record<string, string> = {
  base: "text-[#0052ff]",
  bsc: "text-[#f0b90b]",
  solana: "text-[#9945ff]",
};

const chainLabels: Record<string, string> = {
  base: "BASE",
  bsc: "BSC",
  solana: "SOL",
};

export default function Leaderboard() {
  const [tab, setTab] = useState<"dangerous" | "safe">("dangerous");
  const [tokens, setTokens] = useState<TokenAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?sort=${tab}`);
        const data = await res.json();
        setTokens(data.tokens || []);
      } catch (error) {
        console.error("Leaderboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [tab]);

  return (
    <div className="bg-[#131a27] border border-[#1a2332] rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#ffaa00]" />
          <h2 className="text-sm font-bold text-[#ffaa00] tracking-wider">LEADERBOARD</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("dangerous")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              tab === "dangerous"
                ? "text-[#ff4444] border-[#ff4444] bg-red-900/20"
                : "text-gray-600 border-[#1a2332] hover:border-gray-600"
            }`}
          >
            <Skull className="w-3 h-3" /> Most Dangerous
          </button>
          <button
            onClick={() => setTab("safe")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              tab === "safe"
                ? "text-[#00ff88] border-[#00ff88] bg-green-900/20"
                : "text-gray-600 border-[#1a2332] hover:border-gray-600"
            }`}
          >
            <Shield className="w-3 h-3" /> Safest
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-[#ffaa00] animate-spin" />
          <span className="ml-2 text-gray-500 text-sm">Loading leaderboard...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {tokens.map((token, i) => (
            <div
              key={`lb-${token.chain}-${token.address}`}
              className="flex items-center justify-between bg-[#0a0a1a] rounded-lg px-4 py-3 hover:bg-[#0f1520] transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold w-8 ${
                  tab === "dangerous" ? "text-[#ff4444]" : "text-[#00ff88]"
                }`}>
                  #{i + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{token.name}</span>
                    <span className="text-xs text-gray-500">${token.symbol}</span>
                    <span className={`text-[10px] font-bold ${chainColors[token.chain]}`}>
                      {chainLabels[token.chain]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-600 mt-0.5">
                    <span>MCap: ${token.marketCap > 1000 ? `${(token.marketCap / 1000).toFixed(0)}k` : token.marketCap}</span>
                    <span>Liq: ${token.liquidity > 1000 ? `${(token.liquidity / 1000).toFixed(0)}k` : token.liquidity}</span>
                    <span>{token.age}</span>
                  </div>
                </div>
              </div>
              <RiskBadge level={token.riskLevel} score={token.riskScore} />
            </div>
          ))}

          {tokens.length === 0 && (
            <div className="text-center py-8 text-gray-600 text-sm">
              No data available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
