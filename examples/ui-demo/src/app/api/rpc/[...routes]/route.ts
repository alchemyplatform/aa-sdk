import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { routes: string[] } }
) {
  const body = await req.text();

  const headers: Record<string, string> = {
    Authorization: `Bearer Company-Strict-Weaken-Few-6`,
  };
  req.headers.forEach((value: string, key: string) => {
    // don't pass the cookie because it doesn't get used downstream
    if (key === "cookie") return;

    headers[key] = value;
  });

  const res = await fetch(
    `https://api.g.alchemypreview.com/${params.routes.join("/")}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer Company-Strict-Weaken-Few-6`,
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
