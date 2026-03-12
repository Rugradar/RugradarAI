// Subscriber management for honeypot alerts
// Falls back to ALERT_CHAT_IDS env var (no external dependencies)

export async function getSubscribers(): Promise<number[]> {
  const envIds = process.env.ALERT_CHAT_IDS || "";
  return envIds
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);
}

export async function addSubscriber(chatId: number): Promise<boolean> {
  // KV not available — inform user to contact admin
  console.log(`Subscribe request from chat ${chatId} — add to ALERT_CHAT_IDS env var`);
  return false;
}

export async function removeSubscriber(chatId: number): Promise<boolean> {
  console.log(`Unsubscribe request from chat ${chatId} — remove from ALERT_CHAT_IDS env var`);
  return false;
}

export async function isSubscribed(chatId: number): Promise<boolean> {
  const subs = await getSubscribers();
  return subs.includes(chatId);
}

// Simple in-memory cache to avoid duplicate alerts within same invocation
const alertedCache = new Set<string>();

export async function wasAlerted(address: string): Promise<boolean> {
  return alertedCache.has(address);
}

export async function markAlerted(addresses: string[]): Promise<void> {
  addresses.forEach((a) => alertedCache.add(a));
}
