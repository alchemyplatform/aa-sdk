import { TurnkeyClient } from "@turnkey/http";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import { getLatestApiKey, getUser } from "@/app/db";
import { NextResponse } from "next/server";
import {
  Address,
  createWalletClient,
  Hex,
  keccak256,
  serializeTransaction,
  SignableMessage,
} from "viem";
import { alchemy, sepolia } from "@account-kit/infra";
import { toAccount } from "viem/accounts";
import { takeBytes } from "@aa-sdk/core";

const TURNKEY_BASE_URL = "https://api.turnkey.com";
const ALCHEMY_BASE_URL = "https://api.g.alchemy.com";

export async function POST(request: Request) {
  const body: { orgId: string } = await request.json().catch((err) => {
    console.error(err);
    return NextResponse.json("bad request", {
      status: 400,
    });
  });
  if (!body.orgId) {
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

    const signMessage = async (message: SignableMessage) => {
      if (typeof message !== "string") {
        throw new Error("Expected message to be a string");
      }

      // Sign with the api key stamper first.
      const stampedRequest = await tk.stampSignRawPayload({
        organizationId: user.orgId,
        timestampMs: Date.now().toString(),
        type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
        parameters: {
          signWith: user.address,
          payload: message,
          encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
          hashFunction: "HASH_FUNCTION_NO_OP",
        },
      });

      // Then submit to Alchemy.
      const alchemyResp = await fetch(
        `${ALCHEMY_BASE_URL}/signer/v1/sign-payload`,
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
      const respJson = (await alchemyResp.json()) as { signature: Hex };
      return respJson.signature;
    };

    const account = toAccount({
      address: user.address as Address,
      signMessage: async ({ message }) => {
        return signMessage(message);
      },
      signTransaction: async (transaction) => {
        const hash = keccak256(serializeTransaction(transaction));
        const sig = unpackSignRawMessageBytes(await signMessage(hash));
        return serializeTransaction(transaction, sig);
      },
      signTypedData: async () => {
        throw new Error("Not implemented");
      },
    });

    const client = createWalletClient({
      account,
      chain: sepolia,
      transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
    });

    // For proof on concept, this just sends a txn w/ no value to the user's own address.
    const txHash = await client.sendTransaction({
      to: user.address as Address,
      value: BigInt(0),
    });

    return NextResponse.json(
      {
        hash: txHash,
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

const unpackSignRawMessageBytes = (
  hex: `0x${string}`,
): {
  r: `0x${string}`;
  s: `0x${string}`;
  v: bigint;
} => {
  return {
    r: takeBytes(hex, { count: 32 }),
    s: takeBytes(hex, { count: 32, offset: 32 }),
    v: BigInt(takeBytes(hex, { count: 1, offset: 64 })),
  };
};
