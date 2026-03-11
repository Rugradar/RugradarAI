"use client";

import { RiskLevel } from "@/types/token";

const config: Record<RiskLevel, { bg: string; text: string; border: string; label: string }> = {
  safe: { bg: "bg-green-900/30", text: "text-[#00ff88]", border: "border-[#00ff88]", label: "SAFE" },
  warning: { bg: "bg-yellow-900/30", text: "text-[#ffaa00]", border: "border-[#ffaa00]", label: "WARNING" },
  danger: { bg: "bg-orange-900/30", text: "text-orange-400", border: "border-orange-400", label: "DANGER" },
  critical: { bg: "bg-red-900/30", text: "text-[#ff4444]", border: "border-[#ff4444]", label: "CRITICAL" },
};

export default function RiskBadge({ level, score }: { level: RiskLevel; score: number }) {
  const c = config[level];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${c.bg} ${c.border}`}>
      <span className={`text-xs font-bold ${c.text}`}>{c.label}</span>
      <span className={`text-xs font-mono ${c.text}`}>{score}/100</span>
    </div>
  );
}
