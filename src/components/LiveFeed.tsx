"use client";

import { useState, useEffect } from "react";
import { Radio } from "lucide-react";

const feedItems = [
  { text: "New token detected: $PEPEF on Base", type: "info" as const },
  { text: "🚨 HONEYPOT: $TRUMPI on BSC — DO NOT BUY", type: "danger" as const },
  { text: "✅ $SDOGE passed all checks — Safe", type: "safe" as const },
  { text: "⚠️ $BKILL — whale concentration warning", type: "warning" as const },
  { text: "New token detected: $ELON2 on BSC", type: "info" as const },
  { text: "🚨 RUG ALERT: $ELON2 — 99% sell tax detected", type: "danger" as const },
  { text: "Scanning new pool on Raydium...", type: "info" as const },
  { text: "✅ $PEPEF LP locked for 6 months", type: "safe" as const },
];

const typeColors = {
  info: "text-gray-400",
  danger: "text-[#ff4444]",
  safe: "text-[#00ff88]",
  warning: "text-[#ffaa00]",
};

export default function LiveFeed() {
  const [items, setItems] = useState(feedItems.slice(0, 3));
  const [index, setIndex] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % feedItems.length;
        setItems((current) => [feedItems[next], ...current.slice(0, 7)]);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#131a27] border border-[#1a2332] rounded-xl p-4 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Radio className="w-4 h-4 text-[#00ff88]" />
        <span className="text-xs text-[#00ff88] font-bold tracking-wider">LIVE FEED</span>
        <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
      </div>
      <div className="space-y-1.5 max-h-40 overflow-hidden">
        {items.map((item, i) => (
          <div
            key={`${item.text}-${i}`}
            className={`text-xs font-mono ${typeColors[item.type]} ${i === 0 ? "opacity-100" : `opacity-${Math.max(20, 100 - i * 15)}`}`}
            style={{ opacity: Math.max(0.2, 1 - i * 0.15) }}
          >
            <span className="text-gray-600 mr-2">{new Date().toLocaleTimeString()}</span>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
