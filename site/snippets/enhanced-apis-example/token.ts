import {
  alchemyEnhancedApiActions,
  createModularAccountAlchemyClient,
} from "@account-kit/core";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";

const alchemy = new Alchemy({
  network: Network.ETH_SEPOLIA,
  apiKey: "YOUR_API_KEY",
});

const client = (
  await createModularAccountAlchemyClient({
    chain: sepolia,
    apiKey: "YOUR_API_KEY",
    signer: LocalAccountSigner.mnemonicToAccountSigner("OWNER_MNEMONIC"),
  })
).extend(alchemyEnhancedApiActions(alchemy));

const address = client.getAddress();

// get all tokens owned by the smart account
export const tokenBalances = client.core.getTokenBalances(address);
