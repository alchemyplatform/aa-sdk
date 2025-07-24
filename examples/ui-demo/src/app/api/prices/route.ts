import { NextRequest, NextResponse } from "next/server";
import { env } from "../../../../env.mjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSymbols = searchParams.get("symbols") ?? "";

    const symbols = rawSymbols
      ? rawSymbols.split(",").map((s) => s.trim())
      : ["ETH"];

    const alchemyBaseUrl = `https://api.g.alchemy.com/prices/v1/${env.API_KEY}/tokens/by-symbol`;

    const url = new URL(alchemyBaseUrl);
    symbols.forEach((symbol) => url.searchParams.append("symbols", symbol));

    const alchemyRes = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!alchemyRes.ok) {
      const errText = await alchemyRes.text();
      return NextResponse.json(
        { error: `Alchemy API error: ${errText}` },
        { status: alchemyRes.status },
      );
    }

    const payload = await alchemyRes.json();
    return NextResponse.json(payload);
  } catch (err) {
    console.error("Error in token-price route:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
