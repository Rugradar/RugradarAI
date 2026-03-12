import { TwitterApi } from "twitter-api-v2";

let client: TwitterApi | null = null;

function getClient(): TwitterApi | null {
  if (client) return client;

  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return null;
  }

  client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken,
    accessSecret,
  });

  return client;
}

export async function postTweet(text: string, mediaBuffer?: Buffer): Promise<{ id: string; url: string } | null> {
  const tw = getClient();
  if (!tw) {
    console.log("Twitter not configured — missing API keys");
    return null;
  }

  try {
    let mediaId: string | undefined;

    if (mediaBuffer) {
      mediaId = await tw.v1.uploadMedia(mediaBuffer, {
        mimeType: "image/png",
      });
    }

    const tweet = await tw.v2.tweet({
      text,
      ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
    });

    const tweetId = tweet.data.id;
    return {
      id: tweetId,
      url: `https://x.com/0xrugradar/status/${tweetId}`,
    };
  } catch (error) {
    console.error("Twitter post error:", error);
    return null;
  }
}

export function isTwitterConfigured(): boolean {
  return !!(
    process.env.X_API_KEY &&
    process.env.X_API_SECRET &&
    process.env.X_ACCESS_TOKEN &&
    process.env.X_ACCESS_SECRET
  );
}
