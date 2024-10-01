import { LocalAccountSigner } from "@aa-sdk/core";
import { alchemy, sepolia } from "@account-kit/infra";
import { createLightAccountAlchemyClient } from "@account-kit/smart-contracts";
import { generatePrivateKey } from "viem/accounts";

export const lightAccountClient = await createLightAccountAlchemyClient({
  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
  chain: sepolia,
  transport: alchemy({ apiKey: "YOUR_API_KEY" }),
});
