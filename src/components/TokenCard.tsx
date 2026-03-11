"use client";

import { TokenAnalysis } from "@/types/token";
import RiskBadge from "./RiskBadge";
import { AlertTriangle, CheckCircle, ExternalLink, Users, Droplets, Clock } from "lucide-react";

const chainColors: Record<string, string> = {
  base: "text-[#0052ff] border-[#0052ff]",
  bsc: "text-[#f0b90b] border-[#f0b90b]",
  solana: "text-[#9945ff] border-[#9945ff]",
};

const chainLabels: Record<string, string> = {
  base: "BASE",
  bsc: "BSC",
  solana: "SOL",
};

export default function TokenCard({ token }: { token: TokenAnalysis }) {
  const borderColor =
    token.riskLevel === "critical"
      ? "border-[#ff4444]/40 hover:border-[#ff4444]"
      : token.riskLevel === "safe"
      ? "border-[#00ff88]/20 hover:border-[#00ff88]/50"
      : "border-[#ffaa00]/20 hover:border-[#ffaa00]/50";

  return (
    <div className={`bg-[#131a27] border ${borderColor} rounded-xl p-5 transition-all duration-200 hover:bg-[#162030]`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white">{token.name}</h3>
            <span className="text-sm text-gray-500">${token.symbol}</span>
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${chainColors[token.chain]}`}>
              {chainLabels[token.chain]}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-mono">
            {token.address.slice(0, 8)}...{token.address.slice(-6)}
            <ExternalLink className="inline w-3 h-3 ml-1 opacity-50" />
          </p>
        </div>
        <RiskBadge level={token.riskLevel} score={token.riskScore} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#0a0a1a] rounded-lg p-2.5">
          <p className="text-[10px] text-gray-500 uppercase">Price</p>
          <p className="text-sm font-mono text-white">${token.price < 0.001 ? token.price.toExponential(2) : token.price.toFixed(6)}</p>
        </div>
        <div className="bg-[#0a0a1a] rounded-lg p-2.5">
          <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1"><Droplets className="w-3 h-3" />Liquidity</p>
          <p className="text-sm font-mono text-white">${token.liquidity.toLocaleString()}</p>
        </div>
        <div className="bg-[#0a0a1a] rounded-lg p-2.5">
          <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1"><Users className="w-3 h-3" />Holders</p>
          <p className="text-sm font-mono text-white">{token.holders.toLocaleString()}</p>
        </div>
        <div className="bg-[#0a0a1a] rounded-lg p-2.5">
          <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" />Age</p>
          <p className="text-sm font-mono text-white">{token.age}</p>
        </div>
      </div>

      {/* Quick Checks */}
      <div className="flex flex-wrap gap-2 mb-4">
        <QuickCheck label="Honeypot" ok={!token.honeypot} />
        <QuickCheck label="LP Locked" ok={token.lpLocked} />
        <QuickCheck label="Renounced" ok={token.ownershipRenounced} />
        <QuickCheck label="Mintable" ok={!token.mintable} />
        <QuickCheck label={`Tax ${token.buyTax}/${token.sellTax}`} ok={token.buyTax <= 5 && token.sellTax <= 5} />
        <QuickCheck label={`Top ${token.topHolderPercent}%`} ok={token.topHolderPercent < 20} />
      </div>

      {/* Risks & Positives */}
      {token.risks.length > 0 && (
        <div className="mb-3">
          {token.risks.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#ff4444] mb-1">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}
      {token.positives.length > 0 && (
        <div>
          {token.positives.map((p, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[#00ff88] mb-1">
              <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{p}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickCheck({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
        ok ? "bg-green-900/20 text-[#00ff88] border border-green-800/30" : "bg-red-900/20 text-[#ff4444] border border-red-800/30"
      }`}
    >
      {ok ? "✓" : "✗"} {label}
    </span>
  );
}
