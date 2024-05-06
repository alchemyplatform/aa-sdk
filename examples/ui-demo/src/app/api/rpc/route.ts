import { NextResponse } from "next/server";

import { env } from "@/env.mjs";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(env.ALCHEMY_RPC_URL, {
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
