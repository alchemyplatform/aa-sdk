import { createLightAccountAlchemyProvider } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, type Hex } from "@alchemy/aa-core";
import { sepolia } from "viem/chains";

const chain = sepolia;
const PRIVATE_KEY = "0xYourEOAPrivateKey" as Hex;
const owner = LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY);

export const provider = createLightAccountAlchemyProvider({
  // get your Alchemy API Key at https://dashboard.alchemy.com/
  apiKey: "ALCHEMY_API_KEY",
  owner,
  chain,
});
