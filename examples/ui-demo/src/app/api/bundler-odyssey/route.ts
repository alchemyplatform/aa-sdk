import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    // don't pass the cookie because it doesn't get used downstream
    if (key === "cookie") return;

    headers[key] = value;
  });

  const res = await fetch(
    "http://internal-rundler-odyssey-prod-alb-567331340.us-east-1.elb.amazonaws.com:3000",
    {
      method: "POST",
      headers: {
        ...headers,
      },
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
