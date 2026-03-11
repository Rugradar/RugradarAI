"use client";

import { useState } from "react";
import { Wallet, Loader2, Shield } from "lucide-react";
import { TokenAnalysis } from "@/types/token";
import TokenCard from "./TokenCard";

export default function WalletScanner() {
  const [address, setAddress] = useState("");
  const [tokens, setTokens] = useState<TokenAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanned, setScanned] = useState(false);

  const handleScan = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError("");
    setScanned(false);

    try {
      const res = await fetch(`/api/wallet?address=${encodeURIComponent(address.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scan failed");
        return;
      }

      setTokens(data.tokens || []);
      setScanned(true);
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  };

  const riskSummary = () => {
    const critical = tokens.filter((t) => t.riskLevel === "critical").length;
    const danger = tokens.filter((t) => t.riskLevel === "danger").length;
    const safe = tokens.filter((t) => t.riskLevel === "safe").length;
    return { critical, danger, safe };
  };

  return (
    <div className="mb-8">
      <div className="bg-[#131a27] border border-[#1a2332] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-[#9945ff]" />
          <h2 className="text-sm font-bold text-[#9945ff] tracking-wider">WALLET SCANNER</h2>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Paste wallet address to scan all holdings..."
              className="w-full bg-[#0a0a1a] border border-[#1a2332] rounded-lg pl-12 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#9945ff]/50 transition-colors font-mono"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
            />
          </div>
          <button
            onClick={handleScan}
            disabled={loading || !address.trim()}
            className="px-6 py-3 bg-[#9945ff] text-white font-bold rounded-lg hover:bg-[#7a35d9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                SCANNING...
              </>
            ) : (
              "SCAN WALLET"
            )}
          </button>
        </div>
        {error && <p className="mt-3 text-xs text-[#ff4444]">✗ {error}</p>}

        {scanned && tokens.length > 0 && (
          <div className="mt-4 flex gap-4 text-xs">
            <span className="text-gray-500">Found {tokens.length} tokens:</span>
            <span className="text-[#ff4444]">{riskSummary().critical} critical</span>
            <span className="text-[#ffaa00]">{riskSummary().danger} danger</span>
            <span className="text-[#00ff88]">{riskSummary().safe} safe</span>
          </div>
        )}
      </div>

      {scanned && tokens.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {tokens.map((token) => (
            <TokenCard key={`wallet-${token.chain}-${token.address}`} token={token} />
          ))}
        </div>
      )}

      {scanned && tokens.length === 0 && (
        <div className="text-center py-8 text-gray-600 text-sm">
          No tokens found for this wallet
        </div>
      )}
    </div>
  );
}
