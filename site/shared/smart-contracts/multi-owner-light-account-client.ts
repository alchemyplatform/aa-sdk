import { LocalAccountSigner } from "@aa-sdk/core";
import { alchemy, sepolia } from "@account-kit/infra";
import { createMultiOwnerLightAccountAlchemyClient } from "@account-kit/smart-contracts";
import { generatePrivateKey } from "viem/accounts";

export const multiOwnerLightAccountClient =
  await createMultiOwnerLightAccountAlchemyClient({
    signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
    chain: sepolia,
    transport: alchemy({
      apiKey: "YOUR_API_KEY",
    }),
  });
