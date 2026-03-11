"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Chain } from "@/types/token";

interface Props {
  onSearch: (query: string) => void;
  onFilterChain: (chain: Chain | "all") => void;
  activeChain: Chain | "all";
}

export default function SearchBar({ onSearch, onFilterChain, activeChain }: Props) {
  const [query, setQuery] = useState("");

  const chains: { key: Chain | "all"; label: string; color: string }[] = [
    { key: "all", label: "ALL", color: "text-[#00ff88] border-[#00ff88]" },
    { key: "base", label: "BASE", color: "text-[#0052ff] border-[#0052ff]" },
    { key: "bsc", label: "BSC", color: "text-[#f0b90b] border-[#f0b90b]" },
    { key: "solana", label: "SOL", color: "text-[#9945ff] border-[#9945ff]" },
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Paste token address or search by name..."
          className="w-full bg-[#131a27] border border-[#1a2332] rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00ff88]/50 transition-colors"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
        />
        <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 cursor-pointer hover:text-[#00ff88] transition-colors" />
      </div>
      <div className="flex gap-2">
        {chains.map((c) => (
          <button
            key={c.key}
            onClick={() => onFilterChain(c.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              activeChain === c.key
                ? `${c.color} bg-[#131a27]`
                : "text-gray-600 border-[#1a2332] hover:border-gray-600"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
