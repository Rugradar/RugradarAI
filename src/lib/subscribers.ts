// Subscriber management for honeypot alerts
// Uses Vercel KV if available, falls back to ALERT_CHAT_IDS env var

const KV_KEY = "rugradar:subscribers";
const ALERTED_KEY = "rugradar:alerted";

let kv: any = null;

async function getKV() {
  if (kv !== undefined && kv !== null) return kv;
  try {
    const { kv: kvClient } = await import("@vercel/kv");
    kv = kvClient;
    return kv;
  } catch {
    kv = null;
    return null;
  }
}

export async function getSubscribers(): Promise<number[]> {
  const store = await getKV();

  if (store) {
    try {
      const subs = await store.smembers(KV_KEY);
      return subs?.map(Number).filter((n: number) => !isNaN(n)) || [];
    } catch {
      // fall through to env
    }
  }

  // Fallback: env var
  const envIds = process.env.ALERT_CHAT_IDS || "";
  return envIds
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

export async function addSubscriber(chatId: number): Promise<boolean> {
  const store = await getKV();
  if (!store) return false;

  try {
    await store.sadd(KV_KEY, chatId);
    return true;
  } catch {
    return false;
  }
}

export async function removeSubscriber(chatId: number): Promise<boolean> {
  const store = await getKV();
  if (!store) return false;

  try {
    await store.srem(KV_KEY, chatId);
    return true;
  } catch {
    return false;
  }
}

export async function isSubscribed(chatId: number): Promise<boolean> {
  const subs = await getSubscribers();
  return subs.includes(chatId);
}

// Track already-alerted tokens to avoid duplicate alerts
// Stores token addresses with TTL of 1 hour
export async function wasAlerted(address: string): Promise<boolean> {
  const store = await getKV();
  if (!store) return false;

  try {
    return (await store.sismember(ALERTED_KEY, address)) === 1;
  } catch {
    return false;
  }
}

export async function markAlerted(addresses: string[]): Promise<void> {
  const store = await getKV();
  if (!store) return;

  try {
    if (addresses.length > 0) {
      await store.sadd(ALERTED_KEY, ...addresses);
      // Set TTL of 2 hours on the set to auto-cleanup
      await store.expire(ALERTED_KEY, 7200);
    }
  } catch {
    // silent
  }
}
