import {
  alchemy,
  createAlchemySmartAccountClient,
  sepolia,
} from "@account-kit/infra";
import { createLightAccount } from "@account-kit/smart-contracts";
// You can replace this with any signer you'd like
// We're using a LocalAccountSigner to generate a local key to sign with
import { LocalAccountSigner } from "@aa-sdk/core";
import { generatePrivateKey } from "viem/accounts";

const alchemyTransport = alchemy({
  apiKey: "YOUR_API_KEY",
});

export const client = createAlchemySmartAccountClient({
  transport: alchemyTransport,
  policyId: "YOUR_POLICY_ID",
  chain: sepolia,
  account: await createLightAccount({
    chain: sepolia,
    transport: alchemyTransport,
    signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
  }),
});
