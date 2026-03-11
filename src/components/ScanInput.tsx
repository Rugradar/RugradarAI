"use client";

import { useState } from "react";
import { Search, Loader2, Radar } from "lucide-react";
import { TokenAnalysis } from "@/types/token";

interface Props {
  onResult: (token: TokenAnalysis) => void;
}

export default function ScanInput({ onResult }: Props) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/scan?address=${encodeURIComponent(address.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scan failed");
        return;
      }

      onResult(data.token);
      setAddress("");
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="bg-[#131a27] border border-[#1a2332] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Radar className="w-5 h-5 text-[#00ff88]" />
          <h2 className="text-sm font-bold text-[#00ff88] tracking-wider">SCAN TOKEN</h2>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Paste contract address (Base, BSC, or Solana)..."
              className="w-full bg-[#0a0a1a] border border-[#1a2332] rounded-lg pl-12 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00ff88]/50 transition-colors font-mono"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
            />
          </div>
          <button
            onClick={handleScan}
            disabled={loading || !address.trim()}
            className="px-6 py-3 bg-[#00ff88] text-[#0a0a1a] font-bold rounded-lg hover:bg-[#00cc6a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                SCANNING...
              </>
            ) : (
              "SCAN"
            )}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-xs text-[#ff4444]">✗ {error}</p>
        )}
      </div>
    </div>
  );
}
