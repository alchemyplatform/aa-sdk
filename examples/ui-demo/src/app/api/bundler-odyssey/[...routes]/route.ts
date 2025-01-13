import { NextResponse } from "next/server";

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
    `http://internal-rundler-odyssey-prod-alb-567331340.us-east-1.elb.amazonaws.com:3000/${params.routes.join(
      "/"
    )}`,
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
