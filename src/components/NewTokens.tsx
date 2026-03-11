"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, Loader2, RefreshCw } from "lucide-react";
import { TokenAnalysis, Chain } from "@/types/token";
import TokenCard from "./TokenCard";

export default function NewTokens() {
  const [tokens, setTokens] = useState<TokenAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [chain, setChain] = useState<Chain | "all">("all");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchNew = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/new-tokens?chain=${chain}`);
      const data = await res.json();
      setTokens(data.tokens || []);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("New tokens fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [chain]);

  useEffect(() => {
    fetchNew();
    const interval = setInterval(fetchNew, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchNew]);

  const chains: { key: Chain | "all"; label: string; color: string }[] = [
    { key: "all", label: "ALL", color: "text-[#00ff88] border-[#00ff88]" },
    { key: "base", label: "BASE", color: "text-[#0052ff] border-[#0052ff]" },
    { key: "bsc", label: "BSC", color: "text-[#f0b90b] border-[#f0b90b]" },
    { key: "solana", label: "SOL", color: "text-[#9945ff] border-[#9945ff]" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#ffaa00]" />
          <h2 className="text-sm font-bold text-white tracking-wider">NEW TOKENS</h2>
          <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          {lastUpdate && (
            <span className="text-[10px] text-gray-600">Updated {lastUpdate}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNew}
            disabled={loading}
            className="p-1.5 rounded-lg border border-[#1a2332] text-gray-500 hover:text-[#00ff88] hover:border-[#00ff88]/30 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex gap-1">
            {chains.map((c) => (
              <button
                key={c.key}
                onClick={() => setChain(c.key)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  chain === c.key
                    ? `${c.color} bg-[#131a27]`
                    : "text-gray-600 border-[#1a2332]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && tokens.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#00ff88] animate-spin" />
          <span className="ml-3 text-gray-500 text-sm">Scanning for new tokens...</span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tokens.map((token) => (
            <TokenCard key={`new-${token.chain}-${token.address}`} token={token} />
          ))}
        </div>
      )}

      {!loading && tokens.length === 0 && (
        <div className="text-center py-12 text-gray-600 text-sm">
          No new tokens found — checking again in 30s
        </div>
      )}
    </div>
  );
}
