import { LocalAccountSigner } from "@aa-sdk/core";
import { sepolia } from "@account-kit/infra";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";
import { generatePrivateKey } from "viem/accounts";

export const modularAccountClient = await createModularAccountAlchemyClient({
  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
  chain: sepolia,
  apiKey: "YOUR_API_KEY",
});
