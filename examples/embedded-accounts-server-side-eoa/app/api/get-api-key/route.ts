import { upsertUser } from "@/app/db";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { TurnkeyApiTypes, TSignedRequest } from "@turnkey/http";

/**
 * Existing API keys will be reused if they have at least this much
 * time until expiration. If not, a new key will be created.
 */
const MIN_KEY_DURATION_REMAINING_MS = 3 * 24 * 60 * 60 * 1000 * 1000;

const TURNKEY_BASE_URL = "https://api.turnkey.com";
const ALCHEMY_BASE_URL = "https://api.g.alchemy.com";

export async function POST(request: Request) {
  const body: {
    whoamiStamp: TSignedRequest;
    getOrganizationStamp: TSignedRequest;
  } = await request.json().catch((err) => {
    console.error(err);
    return NextResponse.json({ json: "bad request" }, { status: 400 });
  });

  try {
    const [tkResp, alchemyResp] = await Promise.all([
      fetch(`${TURNKEY_BASE_URL}/public/v1/query/get_organization`, {
        method: "POST",
        body: body.getOrganizationStamp.body,
        headers: {
          "X-Stamp": body.getOrganizationStamp.stamp.stampHeaderValue,
          "Content-Type": "application/json",
        },
      }),
      fetch(`${ALCHEMY_BASE_URL}/signer/v1/whoami`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          stampedRequest: body.whoamiStamp,
        }),
      }),
    ]);

    if (!tkResp.ok) {
      console.error(await tkResp.text());
      throw new Error("Turnkey getOrganization request failed");
    }
    if (!alchemyResp.ok) {
      console.error(await alchemyResp.text());
      throw new Error("Alchemy whoami request failed");
    }

    const orgData: TurnkeyApiTypes["v1GetOrganizationResponse"]["organizationData"] =
      (await tkResp.json()).organizationData;

    const userData: {
      userId: string;
      orgId: string;
      address: string;
      email?: string; // Only exists if using email auth flow
    } = await alchemyResp.json();

    const existingApiKeys = orgData.users
      ?.find((u) => u.userId === userData.userId)
      ?.apiKeys.filter(
        (it) =>
          // Assuming the client is naming API keys with "server-signer" prefix.
          it.apiKeyName.startsWith("server-signer") &&
          // The type of key that this server is generating.
          it.credential.type === "CREDENTIAL_TYPE_API_KEY_P256",
      )
      .map((it) => ({
        ...it,
        // Calculate the expiresAt date based on the createdAt & expirationSeconds.
        expiresAt: new Date(
          (parseInt(it.createdAt.seconds) +
            parseInt(it.expirationSeconds ?? "0")) *
            1000,
        ),
      }))
      .sort(
        // Sort so the first API key in the array will be the longest lasting.
        (a, b) => b.expiresAt.getTime() - a.expiresAt.getTime(),
      );

    const existingKey = existingApiKeys?.[0];
    const existingKeyOk =
      existingKey &&
      existingKey.expiresAt.getTime() - Date.now() >
        MIN_KEY_DURATION_REMAINING_MS;

    if (existingKeyOk) {
      // Return the existing key.
      return NextResponse.json(
        { publicKey: existingKey.credential.publicKey, isNewKey: false },
        { status: 200 },
      );
    }

    // Generate & store a key.
    const { publicKey, privateKey } = await generateKeyPair();
    upsertUser(userData, {
      privateKey,
      publicKey,
      createdAt: new Date(),
    });

    return NextResponse.json({ publicKey, isNewKey: true }, { status: 200 });
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
