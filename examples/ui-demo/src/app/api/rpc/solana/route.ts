import { NextRequest, NextResponse } from "next/server";

import { env } from "../../../../../env.mjs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value: string, key: string) => {
    // don't pass the cookie because it doesn't get used downstream
    if (key === "cookie") return;

    headers[key] = value;
  });

  const isPreview = tryParseJSON(body)?.method === "alchemy_requestFeePayer";

  const rpcUrl =
    (isPreview && env.ALCHEMY_SOLANA_SPONSOR_URL) ||
    `https://solana-devnet.g.alchemy.com/v2/${env.API_KEY}`;
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      ...headers,
    },
    body,
  });

  if (!res.ok) {
    return NextResponse.json(await res.json().catch((e) => ({})), {
      status: res.status,
    });
  }

  return NextResponse.json(await res.json());
}
function tryParseJSON(body: string): any {
  try {
    return JSON.parse(body);
  } catch (_) {
    return;
  }
}
