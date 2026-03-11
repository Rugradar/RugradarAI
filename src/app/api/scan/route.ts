import { NextRequest, NextResponse } from "next/server";
import { fetchTokenByAddress, analyzeToken } from "@/lib/api";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }

  try {
    const pairs = await fetchTokenByAddress(address);

    if (!pairs || pairs.length === 0) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    // Analyze the first/main pair
    const analysis = await analyzeToken(pairs[0]);

    return NextResponse.json({ token: analysis });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
