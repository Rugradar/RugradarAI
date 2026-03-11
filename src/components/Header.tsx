"use client";

import { Shield, Radio } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-[#1a2332] bg-[#0d1117]/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="w-8 h-8 text-[#00ff88]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ff88] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ff88] rounded-full" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#00ff88] tracking-wider">RUGRADAR</h1>
            <p className="text-[10px] text-gray-500 tracking-[0.3em]">SCAN BEFORE YOU APE</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full border border-[#0052ff] text-[#0052ff] text-xs font-bold">BASE</span>
            <span className="px-3 py-1 rounded-full border border-[#f0b90b] text-[#f0b90b] text-xs font-bold">BSC</span>
            <span className="px-3 py-1 rounded-full border border-[#9945ff] text-[#9945ff] text-xs font-bold">SOL</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 text-[#00ff88]" />
            <span>LIVE</span>
            <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
}
