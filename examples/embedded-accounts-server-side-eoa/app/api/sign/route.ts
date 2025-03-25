import { TurnkeyClient } from "@turnkey/http";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import { getLatestApiKey, getUser } from "@/app/db";
import { NextResponse } from "next/server";

const TURNKEY_BASE_URL = "https://api.turnkey.com";

export async function POST(request: Request) {
  const body: { orgId: string; payload: string } = await request
    .json()
    .catch((err) => {
      console.error(err);
      return NextResponse.json("bad request", {
        status: 400,
      });
    });
  if (!body.orgId || !body.payload) {
    return NextResponse.json("bad request", {
      status: 400,
    });
  }

  const user = getUser(body.orgId);
  if (!user) {
    return NextResponse.json("user not found", {
      status: 404,
    });
  }
  const apiKey = getLatestApiKey(body.orgId);

  try {
    const stamper = new ApiKeyStamper({
      apiPublicKey: apiKey.publicKey,
      apiPrivateKey: apiKey.privateKey,
    });
    const tk = new TurnkeyClient({ baseUrl: TURNKEY_BASE_URL }, stamper);

    // Sign with the api key stamper first.
    const stampedRequest = await tk.stampSignRawPayload({
      organizationId: user.orgId,
      timestampMs: Date.now().toString(),
      type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
      parameters: {
        signWith: user.address,
        payload: body.payload,
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction: "HASH_FUNCTION_NO_OP",
      },
    });

    // Then submit to Alchemy.
    const alchemyResp = await fetch(
      "https://api.g.alchemy.com/signer/v1/sign-payload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          stampedRequest,
        }),
      },
    );
    if (!alchemyResp.ok) {
      console.error(await alchemyResp.text());
      throw new Error("Alchemy sign request failed");
    }
    const respJson = (await alchemyResp.json()) as { signature: string };

    return NextResponse.json(
      {
        address: user.address,
        message: body.payload,
        signature: respJson.signature,
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json("error", {
      status: 500,
    });
  }
}
