import { NextRequest, NextResponse } from "next/server";
import { createModularAccountV2 } from "@account-kit/smart-contracts";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { createSmartAccountClient } from "@aa-sdk/core";
import { AlchemyApiKeySigner } from "@account-kit/signer";

export async function GET(_req: NextRequest) {
  const signer = new AlchemyApiKeySigner({
    connection: {
      apiKey: process.env.API_KEY!,
    },
    apiKey: {
      publicKey: "...",
      privateKey: "...",
    },
  });
  await signer.setUserOrgId("...");

  const transport = alchemy({
    apiKey: process.env.API_KEY!,
  });

  const account = await createModularAccountV2({
    signer,
    transport,
    chain: arbitrumSepolia,
  });

  const client = createSmartAccountClient({
    account,
    transport,
    chain: arbitrumSepolia,
  });

  const { hash } = await client.sendUserOperation({
    uo: {
      target: "0xaa7a8b6e3c5f37da184d41fc0a9bc4a65762b8d6",
      data: "0x",
    },
  });

  return NextResponse.json({ hash });
}
