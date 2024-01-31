import { createLightAccountClient } from "@alchemy/aa-accounts";
import { LocalAccountSigner, sepolia, type Hex } from "@alchemy/aa-core";
import { http } from "viem";

const chain = sepolia;
const PRIVATE_KEY = "0xYourEOAPrivateKey" as Hex;
const owner = LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY);

export const smartAccountClient = await createLightAccountClient({
  transport: http("https://eth-sepolia.alchemyapi.io/v2/ALCHEMY_API_KEY"),
  chain,
  owner,
});
