import { NextResponse } from "next/server";

import { env } from "../../../../../env.mjs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ routes: string[] }> },
) {
  const { routes } = await params;
  const body = await req.text();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.API_KEY}`,
  };
  req.headers.forEach((value: string, key: string) => {
    // don't pass the cookie because it doesn't get used downstream
    if (key === "cookie") return;

    headers[key] = value;
  });

  const res = await fetch(env.ALCHEMY_API_URL + `/${routes.join("/")}`, {
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
