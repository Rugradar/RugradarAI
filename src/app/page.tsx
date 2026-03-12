"use client";

import { useState } from "react";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import ScanInput from "@/components/ScanInput";
import LiveFeed from "@/components/LiveFeed";
import TokenCard from "@/components/TokenCard";
import WalletScanner from "@/components/WalletScanner";
import Leaderboard from "@/components/Leaderboard";
import NewTokens from "@/components/NewTokens";
import { TokenAnalysis, ScanStats } from "@/types/token";
import { Radar, Zap, Trophy, Wallet, Search, Shield, Bot, Bell, ExternalLink } from "lucide-react";

type Tab = "scan" | "new" | "leaderboard" | "wallet";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const [scannedTokens, setScannedTokens] = useState<TokenAnalysis[]>([]);
  const [stats] = useState<ScanStats>({
    totalScanned: 12847,
    rugsDetected: 4231,
    safeTokens: 3102,
    activeChains: 3,
  });

  const handleScanResult = (token: TokenAnalysis) => {
    setScannedTokens((prev) => {
      const filtered = prev.filter(
        (t) => t.address.toLowerCase() !== token.address.toLowerCase()
      );
      return [token, ...filtered];
    });
    setActiveTab("scan");
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "new", label: "New Tokens", icon: Zap },
    { key: "scan", label: "Scan", icon: Search },
    { key: "leaderboard", label: "Leaderboard", icon: Trophy },
    { key: "wallet", label: "Wallet", icon: Wallet },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00ff88]/20 bg-[#00ff88]/5 mb-6">
            <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
            <span className="text-xs text-[#00ff88] font-bold tracking-wider">SCANNING 3 CHAINS IN REAL-TIME</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Don&apos;t Get <span className="text-[#ff4444] line-through decoration-2">Rugged</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            AI-powered security scanner for meme tokens. Paste any contract address — get instant honeypot detection, LP analysis, tax check, and risk score.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <a
              href="https://t.me/RugRadarAI_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-lg transition-colors text-sm"
            >
              <Bot className="w-4 h-4" />
              Telegram Bot
            </a>
            <a
              href="https://x.com/0xrugradar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a2332] hover:bg-[#222d3d] text-white font-bold rounded-lg border border-[#2a3442] transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Follow @0xrugradar
            </a>
          </div>
        </div>

        <StatsBar stats={stats} />
        <ScanInput onResult={handleScanResult} />
        <LiveFeed />

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-[#131a27] border border-[#1a2332] rounded-xl p-5 hover:border-[#00ff88]/20 transition-colors">
            <Shield className="w-8 h-8 text-[#00ff88] mb-3" />
            <h3 className="text-white font-bold mb-2">Honeypot Detection</h3>
            <p className="text-sm text-gray-500">Instantly detect if a token is a honeypot. Check LP locks, ownership, mintability, and hidden traps.</p>
          </div>
          <div className="bg-[#131a27] border border-[#1a2332] rounded-xl p-5 hover:border-[#00ff88]/20 transition-colors">
            <Zap className="w-8 h-8 text-[#ffaa00] mb-3" />
            <h3 className="text-white font-bold mb-2">Real-Time Monitoring</h3>
            <p className="text-sm text-gray-500">New tokens scanned automatically every 30 seconds. Never miss a launch — or a scam.</p>
          </div>
          <div className="bg-[#131a27] border border-[#1a2332] rounded-xl p-5 hover:border-[#00ff88]/20 transition-colors">
            <Bell className="w-8 h-8 text-[#0088cc] mb-3" />
            <h3 className="text-white font-bold mb-2">Telegram Alerts</h3>
            <p className="text-sm text-gray-500">Get instant alerts when dangerous tokens are detected. Scan any token directly from the bot.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#1a2332] pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-[#131a27] text-[#00ff88] border border-[#00ff88]/30"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === "scan" && scannedTokens.length > 0 && (
                <span className="bg-[#00ff88] text-[#0a0a1a] text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {scannedTokens.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "new" && <NewTokens />}

        {activeTab === "scan" && (
          <div>
            {scannedTokens.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Radar className="w-4 h-4 text-[#00ff88]" />
                  <h2 className="text-sm text-gray-500 tracking-wider">
                    SCAN RESULTS — <span className="text-white">{scannedTokens.length} tokens</span>
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {scannedTokens.map((token) => (
                    <TokenCard key={`scan-${token.chain}-${token.address}`} token={token} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-600">
                <Radar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No scans yet</p>
                <p className="text-sm mt-2">Paste a contract address above to start scanning</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && <Leaderboard />}

        {activeTab === "wallet" && <WalletScanner />}

        {/* CTA Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#00ff88]/10 to-[#0088cc]/10 border border-[#00ff88]/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Scan tokens on the go</h3>
          <p className="text-gray-400 mb-6">Use our Telegram bot — paste any contract address, get instant results.</p>
          <a
            href="https://t.me/RugRadarAI_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00ff88] text-[#0a0a1a] font-bold rounded-lg hover:bg-[#00cc6a] transition-colors"
          >
            <Bot className="w-5 h-5" />
            Open Telegram Bot
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[#1a2332]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[#00ff88] font-bold text-lg">RugRadar</span>
              <span className="text-xs text-gray-600">AI-Powered Meme Token Scanner</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="https://x.com/0xrugradar" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">𝕏 Twitter</a>
              <a href="https://t.me/RugRadarAI_bot" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram</a>
              <a href="https://github.com/Rugradar/RugradarAI" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-700">
            <p>Base • BSC • Solana | Data from DexScreener + GoPlus Security</p>
            <p className="mt-1">© 2026 RugRadar. Scan Before You Ape 🔍</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
