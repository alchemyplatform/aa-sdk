import { createAlchemySmartAccountClient, sepolia } from "@account-kit/infra";
import { createLightAccount } from "@account-kit/smart-contracts";
// You can replace this with any signer you'd like
// We're using a LocalAccountSigner to generate a local key to sign with
import { LocalAccountSigner } from "@aa-sdk/core";
import { http } from "viem";
import { generatePrivateKey } from "viem/accounts";

export const client = createAlchemySmartAccountClient({
  apiKey: "YOUR_API_KEY",
  policyId: "YOUR_POLICY_ID",
  chain: sepolia,
  account: await createLightAccount({
    chain: sepolia,
    transport: http(`${sepolia.rpcUrls.alchemy.http[0]}/YOUR_API_KEY`),
    signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
  }),
});
