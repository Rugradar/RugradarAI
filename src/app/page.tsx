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
import { Radar, Zap, Trophy, Wallet, Search } from "lucide-react";

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
        <StatsBar stats={stats} />
        <ScanInput onResult={handleScanResult} />
        <LiveFeed />

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

        <footer className="mt-16 pt-8 border-t border-[#1a2332] text-center text-xs text-gray-600">
          <p className="mb-2">
            <span className="text-[#00ff88]">RugRadar</span> — AI-Powered Meme Token Scanner
          </p>
          <p>Base • BSC • Solana | Scan Before You Ape 🔍</p>
          <p className="mt-2 text-gray-700">Data from DexScreener + GoPlus Security</p>
        </footer>
      </main>
    </div>
  );
}
