import {
  alchemyEnhancedApiActions,
  createLightAccountAlchemyClient,
} from "@alchemy/aa-alchemy";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";

const alchemy = new Alchemy({
  network: Network.ETH_SEPOLIA,
  apiKey: "YOUR_API_KEY",
});

const provider = (
  await createLightAccountAlchemyClient({
    chain: sepolia,
    apiKey: "YOUR_API_KEY",
    owner: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
  })
).extend(alchemyEnhancedApiActions(alchemy));

const address = provider.getAddress();

// get all tokens owned by the smart account
export const tokenBalances = provider.core.getTokenBalances(address);
