import {
  WalletClientSigner,
  sepolia,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { createWalletClient, custom } from "viem";

const externalProvider = window.ethereum; // or anyother EIP-1193 provider

const walletClient = createWalletClient({
  chain: sepolia, // can provide a different chain here
  transport: custom(externalProvider),
});

export const signer: SmartAccountSigner = new WalletClientSigner(
  walletClient,
  "json-rpc" // signerType
);
