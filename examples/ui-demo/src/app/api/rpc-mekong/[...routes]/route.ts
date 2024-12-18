import { NextResponse } from "next/server";

import { env } from "../../../../../env.mjs";

export async function POST(
  req: Request,
  { params }: { params: { routes: string[] } }
) {
  const body = await req.text();

  req.headers.forEach((value, key) => {
    // don't pass the cookie because it doesn't get used downstream
    if (key === "cookie") return;
  });

  const res = await fetch(
    "https://rpc.mekong.ethpandaops.io" + `/${params.routes.join("/")}`,
    {
      method: "POST",
      body,
    }
  );

  if (!res.ok) {
    return NextResponse.json(await res.json().catch((e) => ({})), {
      status: res.status,
    });
  }

  return NextResponse.json(await res.json());
}
