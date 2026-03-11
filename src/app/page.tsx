"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import SearchBar from "@/components/SearchBar";
import LiveFeed from "@/components/LiveFeed";
import TokenCard from "@/components/TokenCard";
import { mockTokens, mockStats } from "@/lib/mock-data";
import { Chain } from "@/types/token";

export default function Home() {
  const [search, setSearch] = useState("");
  const [chain, setChain] = useState<Chain | "all">("all");

  const filtered = useMemo(() => {
    return mockTokens.filter((t) => {
      const matchesChain = chain === "all" || t.chain === chain;
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.address.toLowerCase().includes(search.toLowerCase());
      return matchesChain && matchesSearch;
    });
  }, [search, chain]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <StatsBar stats={mockStats} />
        <LiveFeed />
        <SearchBar onSearch={setSearch} onFilterChain={setChain} activeChain={chain} />
        
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm text-gray-500 tracking-wider">
            RECENTLY SCANNED — <span className="text-white">{filtered.length} tokens</span>
          </h2>
          <div className="flex gap-2 text-[10px]">
            <span className="text-[#ff4444]">● CRITICAL</span>
            <span className="text-[#ffaa00]">● WARNING</span>
            <span className="text-[#00ff88]">● SAFE</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((token) => (
            <TokenCard key={token.address} token={token} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-lg">No tokens found</p>
            <p className="text-sm mt-2">Try a different search or filter</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[#1a2332] text-center text-xs text-gray-600">
          <p className="mb-2">
            <span className="text-[#00ff88]">RugRadar</span> — AI-Powered Meme Token Scanner
          </p>
          <p>Base • BSC • Solana | Scan Before You Ape 🔍</p>
        </footer>
      </main>
    </div>
  );
}
