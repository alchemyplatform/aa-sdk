import { arbitrumSepolia } from "@alchemy/aa-core";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // if you want to handle other or multiple chains, you can change this line
  const rpcUrl = arbitrumSepolia.rpcUrls.alchemy.http[0];
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (apiKey == null) {
    return NextResponse.json(
      { error: "ALCHEMY_API_KEY is not set" },
      { status: 500 }
    );
  }

  const body = await req.json();

  const res = await fetch(`${rpcUrl}/${apiKey}`, {
    method: "POST",
    headers: {
      ...req.headers,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(await res.json().catch((e) => ({})), {
      status: res.status,
    });
  }

  return NextResponse.json(await res.json());
}
