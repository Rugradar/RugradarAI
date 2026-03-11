export type Chain = "base" | "bsc" | "solana";

export type RiskLevel = "safe" | "warning" | "danger" | "critical";

export interface TokenAnalysis {
  address: string;
  name: string;
  symbol: string;
  chain: Chain;
  price: number;
  marketCap: number;
  liquidity: number;
  lpLocked: boolean;
  lpLockDuration?: string;
  honeypot: boolean;
  buyTax: number;
  sellTax: number;
  ownershipRenounced: boolean;
  mintable: boolean;
  topHolderPercent: number;
  holders: number;
  age: string;
  riskScore: number;
  riskLevel: RiskLevel;
  risks: string[];
  positives: string[];
  createdAt: string;
}

export interface ScanStats {
  totalScanned: number;
  rugsDetected: number;
  safeTokens: number;
  activeChains: number;
}
