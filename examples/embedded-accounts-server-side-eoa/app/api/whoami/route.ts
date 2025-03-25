import { upsertUser } from "@/app/db";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch((err) => {
    console.error(err);
    return NextResponse.json({ json: "bad request" }, { status: 400 });
  });

  try {
    const alchemyResp = await fetch(
      "https://api.g.alchemy.com/signer/v1/whoami",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          stampedRequest: body,
        }),
      },
    );
    if (!alchemyResp.ok) {
      console.error(await alchemyResp.text());
      throw new Error("Alchemy whoami request failed");
    }
    const userData = (await alchemyResp.json()) as {
      userId: string;
      orgId: string;
      address: string;
      email?: string; // Only exists if using email auth flow
    };

    // Generate & store a keypair that can be used to sign from the server.
    const { publicKey, privateKey } = await generateKeyPair();
    upsertUser(userData, {
      privateKey,
      publicKey,
      createdAt: new Date(),
    });

    return NextResponse.json({ publicKey }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ json: "error" }, { status: 500 });
  }
}

async function generateKeyPair() {
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.generateKeys();
  return {
    publicKey: ecdh.getPublicKey("hex", "compressed"),
    privateKey: ecdh.getPrivateKey("hex"),
  };
}
