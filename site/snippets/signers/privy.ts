/**
 * This example assumes your app is wrapped with the `PrivyProvider` and
 * is configured to create embedded wallets for users upon login.
 */
import { createLightAccountAlchemyClient } from "@account-kit/core";
import {
  WalletClientSigner,
  sepolia,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";

// The code below makes use of Privy's React hooks. You must paste
// or use it within a React Component or Context.

// Find the user's embedded wallet
// eslint-disable-next-line react-hooks/rules-of-hooks
const { wallets } = useWallets();
const embeddedWallet = wallets.find(
  (wallet) => wallet.walletClientType === "privy"
);
if (!embeddedWallet) throw new Error("User does not have an embedded wallet");

// Switch the embedded wallet to your desired network
await embeddedWallet.switchChain(sepolia.id);

// Get a viem client from the embedded wallet
const eip1193provider = await embeddedWallet.getEthereumProvider();
const privyClient = createWalletClient({
  account: embeddedWallet.address as `0x${string}`,
  chain: sepolia,
  transport: custom(eip1193provider),
});

// Create a smart account signer from the embedded wallet's viem client
const privySigner: SmartAccountSigner = new WalletClientSigner(
  privyClient,
  "privy" // signerType
);

// Create an Alchemy Light Account Client with the privy signer
export const smartAccountClient = await createLightAccountAlchemyClient({
  account: {
    signer: privySigner,
  },
  chain: sepolia,
  apiKey: "YOUR_API_KEY",
});
