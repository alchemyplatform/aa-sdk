import { WalletClientSigner } from "@alchemy/aa-core";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";
const externalProvider = window.ethereum; // or anyother EIP-1193 provider
const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(externalProvider),
});
export const signer = new WalletClientSigner(walletClient, "json-rpc" // signerType
);
