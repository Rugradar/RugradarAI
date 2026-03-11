"use client";

import { ScanStats } from "@/types/token";
import { Activity, AlertTriangle, CheckCircle, Globe } from "lucide-react";

interface Props {
  stats: ScanStats;
}

export default function StatsBar({ stats }: Props) {
  const items = [
    { label: "Tokens Scanned", value: stats.totalScanned.toLocaleString(), icon: Activity, color: "text-[#00ff88]" },
    { label: "Rugs Detected", value: stats.rugsDetected.toLocaleString(), icon: AlertTriangle, color: "text-[#ff4444]" },
    { label: "Safe Tokens", value: stats.safeTokens.toLocaleString(), icon: CheckCircle, color: "text-[#00ff88]" },
    { label: "Active Chains", value: stats.activeChains.toString(), icon: Globe, color: "text-[#0052ff]" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-[#131a27] border border-[#1a2332] rounded-lg p-4 hover:border-[#00ff8833] transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <item.icon className={`w-4 h-4 ${item.color}`} />
            <span className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</span>
          </div>
          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
