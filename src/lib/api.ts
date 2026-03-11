import { Chain, TokenAnalysis, RiskLevel } from "@/types/token";

const GOPLUS_BASE = "https://api.gopluslabs.io/api/v1";
const DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex";

// Chain IDs for GoPlus
const GOPLUS_CHAIN_IDS: Record<string, string> = {
  base: "8453",
  bsc: "56",
  solana: "solana",
};

// Fetch new token pairs from DexScreener
export async function fetchNewTokens(chain: Chain): Promise<DexPair[]> {
  const chainMap: Record<Chain, string> = {
    base: "base",
    bsc: "bsc",
    solana: "solana",
  };

  const res = await fetch(
    `${DEXSCREENER_BASE}/search?q=&chain=${chainMap[chain]}`,
    { next: { revalidate: 30 } }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.pairs?.slice(0, 10) || [];
}

// Fetch token profile from DexScreener by address
export async function fetchTokenByAddress(address: string): Promise<DexPair[]> {
  const res = await fetch(`${DEXSCREENER_BASE}/tokens/${address}`, {
    next: { revalidate: 15 },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.pairs || [];
}

// Fetch latest boosted tokens from DexScreener
export async function fetchLatestBoosted(): Promise<DexPair[]> {
  const res = await fetch("https://api.dexscreener.com/token-boosts/latest/v1", {
    next: { revalidate: 30 },
  });

  if (!res.ok) return [];
  const data = await res.json();

  // Fetch details for each boosted token
  const addresses = data
    .slice(0, 20)
    .map((t: { tokenAddress: string }) => t.tokenAddress);

  if (addresses.length === 0) return [];

  const detailRes = await fetch(
    `${DEXSCREENER_BASE}/tokens/${addresses.join(",")}`,
    { next: { revalidate: 30 } }
  );

  if (!detailRes.ok) return [];
  const detailData = await detailRes.json();
  return detailData.pairs || [];
}

// GoPlus security check for EVM chains
export async function checkSecurityEVM(
  address: string,
  chainId: string
): Promise<GoPlusResult | null> {
  try {
    const res = await fetch(
      `${GOPLUS_BASE}/token_security/${chainId}?contract_addresses=${address}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;
    const data = await res.json();

    if (data.code !== 1) return null;
    const result = data.result?.[address.toLowerCase()];
    return result || null;
  } catch {
    return null;
  }
}

// GoPlus security check for Solana
export async function checkSecuritySolana(
  address: string
): Promise<GoPlusSolanaResult | null> {
  try {
    const res = await fetch(
      `${GOPLUS_BASE}/solana/token_security?contract_addresses=${address}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;
    const data = await res.json();

    if (data.code !== 1) return null;
    return data.result?.[address] || null;
  } catch {
    return null;
  }
}

// Build full TokenAnalysis from DexScreener pair + GoPlus security
export async function analyzeToken(pair: DexPair): Promise<TokenAnalysis> {
  const chain = mapChain(pair.chainId);
  const address = pair.baseToken?.address || "";

  let security: GoPlusResult | null = null;
  let solanaSecurity: GoPlusSolanaResult | null = null;

  if (chain === "solana") {
    solanaSecurity = await checkSecuritySolana(address);
  } else {
    const chainId = GOPLUS_CHAIN_IDS[chain];
    if (chainId) {
      security = await checkSecurityEVM(address, chainId);
    }
  }

  const risks: string[] = [];
  const positives: string[] = [];

  // Parse security data
  let honeypot = false;
  let buyTax = 0;
  let sellTax = 0;
  let ownershipRenounced = false;
  let mintable = false;
  let lpLocked = false;

  if (security) {
    honeypot = security.is_honeypot === "1";
    buyTax = parseFloat(security.buy_tax || "0") * 100;
    sellTax = parseFloat(security.sell_tax || "0") * 100;
    ownershipRenounced = security.can_take_back_ownership !== "1" && security.owner_address === "";
    mintable = security.is_mintable === "1";

    if (security.lp_holders) {
      lpLocked = security.lp_holders.some(
        (lp: { is_locked: number }) => lp.is_locked === 1
      );
    }

    // Risks
    if (honeypot) risks.push("🚨 HONEYPOT DETECTED — cannot sell");
    if (security.is_honeypot === "1") risks.push("Honeypot contract");
    if (!lpLocked) risks.push("LP NOT locked");
    if (!ownershipRenounced) risks.push("Ownership NOT renounced");
    if (mintable) risks.push("Mintable — dev can print tokens");
    if (sellTax > 10) risks.push(`High sell tax: ${sellTax.toFixed(1)}%`);
    if (buyTax > 10) risks.push(`High buy tax: ${buyTax.toFixed(1)}%`);
    if (security.is_proxy === "1") risks.push("Proxy contract — can be modified");
    if (security.is_blacklisted === "1") risks.push("Has blacklist function");
    if (security.cannot_sell_all === "1") risks.push("Cannot sell all tokens");
    if (security.can_take_back_ownership === "1") risks.push("Owner can reclaim ownership");
    if (security.hidden_owner === "1") risks.push("Hidden owner detected");
    if (security.external_call === "1") risks.push("External call risk");

    // Positives
    if (!honeypot) positives.push("Not a honeypot");
    if (lpLocked) positives.push("LP locked");
    if (ownershipRenounced) positives.push("Ownership renounced");
    if (!mintable) positives.push("Not mintable");
    if (buyTax <= 5 && sellTax <= 5) positives.push(`Low tax (${buyTax.toFixed(0)}/${sellTax.toFixed(0)})`);
  } else if (solanaSecurity) {
    // Solana specific checks
    mintable = solanaSecurity.mintable?.status === "1";
    if (mintable) risks.push("Mintable — dev can print tokens");
    else positives.push("Not mintable");

    if (solanaSecurity.freezeable?.status === "1") risks.push("Freezeable — tokens can be frozen");
    else positives.push("Not freezeable");
  } else {
    risks.push("⚠️ Security data unavailable — scan manually");
  }

  // Liquidity & holder analysis from DexScreener
  const liquidity = pair.liquidity?.usd || 0;
  const holders = pair.holders || 0;
  const marketCap = pair.marketCap || pair.fdv || 0;

  if (liquidity < 5000) risks.push(`Very low liquidity ($${liquidity.toLocaleString()})`);
  else if (liquidity > 50000) positives.push(`Good liquidity ($${(liquidity / 1000).toFixed(0)}k)`);

  // Calculate risk score
  let riskScore = 0;
  if (honeypot) riskScore += 50;
  if (!lpLocked) riskScore += 15;
  if (!ownershipRenounced) riskScore += 10;
  if (mintable) riskScore += 15;
  if (sellTax > 10) riskScore += 10;
  if (buyTax > 10) riskScore += 5;
  if (liquidity < 5000) riskScore += 10;
  if (liquidity < 1000) riskScore += 10;
  if (security?.is_proxy === "1") riskScore += 5;
  if (security?.hidden_owner === "1") riskScore += 10;
  riskScore = Math.min(99, riskScore);

  let riskLevel: RiskLevel = "safe";
  if (riskScore >= 75) riskLevel = "critical";
  else if (riskScore >= 50) riskLevel = "danger";
  else if (riskScore >= 25) riskLevel = "warning";

  const age = pair.pairCreatedAt
    ? getTimeAgo(pair.pairCreatedAt)
    : "Unknown";

  return {
    address,
    name: pair.baseToken?.name || "Unknown",
    symbol: pair.baseToken?.symbol || "???",
    chain,
    price: parseFloat(pair.priceUsd || "0"),
    marketCap,
    liquidity,
    lpLocked,
    honeypot,
    buyTax,
    sellTax,
    ownershipRenounced,
    mintable,
    topHolderPercent: 0,
    holders,
    age,
    riskScore,
    riskLevel,
    risks,
    positives,
    createdAt: pair.pairCreatedAt
      ? new Date(pair.pairCreatedAt).toISOString()
      : new Date().toISOString(),
  };
}

function mapChain(chainId: string): Chain {
  const map: Record<string, Chain> = {
    base: "base",
    bsc: "bsc",
    solana: "solana",
  };
  return map[chainId] || "base";
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Types
export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceNative: string;
  priceUsd: string;
  txns: { h24: { buys: number; sells: number } };
  volume: { h24: number };
  priceChange: { h24: number };
  liquidity: { usd: number; base: number; quote: number };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  holders?: number;
}

export interface GoPlusResult {
  is_honeypot: string;
  buy_tax: string;
  sell_tax: string;
  is_mintable: string;
  can_take_back_ownership: string;
  owner_address: string;
  is_proxy: string;
  is_blacklisted: string;
  cannot_sell_all: string;
  hidden_owner: string;
  external_call: string;
  lp_holders: { address: string; is_locked: number; percent: string }[];
}

export interface GoPlusSolanaResult {
  mintable?: { status: string };
  freezeable?: { status: string };
}
