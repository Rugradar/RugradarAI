"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import SearchBar from "@/components/SearchBar";
import LiveFeed from "@/components/LiveFeed";
import TokenCard from "@/components/TokenCard";
import ScanInput from "@/components/ScanInput";
import { TokenAnalysis, Chain, ScanStats } from "@/types/token";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [tokens, setTokens] = useState<TokenAnalysis[]>([]);
  const [search, setSearch] = useState("");
  const [chain, setChain] = useState<Chain | "all">("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ScanStats>({
    totalScanned: 0,
    rugsDetected: 0,
    safeTokens: 0,
    activeChains: 3,
  });

  const fetchTrending = useCallback(async () => {
    try {
      const res = await fetch("/api/trending");
      const data = await res.json();

      if (data.tokens && data.tokens.length > 0) {
        setTokens(data.tokens);
        updateStats(data.tokens);
      }
    } catch (error) {
      console.error("Failed to fetch trending:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
    // Refresh every 60 seconds
    const interval = setInterval(fetchTrending, 60000);
    return () => clearInterval(interval);
  }, [fetchTrending]);

  const updateStats = (tokenList: TokenAnalysis[]) => {
    setStats({
      totalScanned: tokenList.length,
      rugsDetected: tokenList.filter((t) => t.riskLevel === "critical" || t.riskLevel === "danger").length,
      safeTokens: tokenList.filter((t) => t.riskLevel === "safe").length,
      activeChains: new Set(tokenList.map((t) => t.chain)).size,
    });
  };

  const handleScanResult = (token: TokenAnalysis) => {
    setTokens((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((t) => t.address.toLowerCase() !== token.address.toLowerCase());
      const updated = [token, ...filtered];
      updateStats(updated);
      return updated;
    });
  };

  const filtered = tokens.filter((t) => {
    const matchesChain = chain === "all" || t.chain === chain;
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase().includes(search.toLowerCase());
    return matchesChain && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <StatsBar stats={stats} />
        <ScanInput onResult={handleScanResult} />
        <LiveFeed />
        <SearchBar onSearch={setSearch} onFilterChain={setChain} activeChain={chain} />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm text-gray-500 tracking-wider">
            {loading ? "SCANNING CHAINS..." : (
              <>TRENDING TOKENS — <span className="text-white">{filtered.length} found</span></>
            )}
          </h2>
          <div className="flex gap-2 text-[10px]">
            <span className="text-[#ff4444]">● CRITICAL</span>
            <span className="text-[#ffaa00]">● WARNING</span>
            <span className="text-[#00ff88]">● SAFE</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
            <span className="ml-3 text-gray-500">Scanning chains for new tokens...</span>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((token) => (
              <TokenCard key={`${token.chain}-${token.address}`} token={token} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-lg">No tokens found</p>
            <p className="text-sm mt-2">Try scanning a contract address above</p>
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-[#1a2332] text-center text-xs text-gray-600">
          <p className="mb-2">
            <span className="text-[#00ff88]">RugRadar</span> — AI-Powered Meme Token Scanner
          </p>
          <p>Base • BSC • Solana | Scan Before You Ape 🔍</p>
          <p className="mt-2 text-gray-700">Data from DexScreener + GoPlus Security</p>
        </footer>
      </main>
    </div>
  );
}
