import { WalletClientSigner, type SmartAccountSigner } from "@aa-sdk/core";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

const externalProvider = window.ethereum; // or anyother EIP-1193 provider

const walletClient = createWalletClient({
  chain: sepolia, // can provide a different chain here
  transport: custom(externalProvider),
});

export const signer: SmartAccountSigner = new WalletClientSigner(
  walletClient,
  "json-rpc" // signerType
);
