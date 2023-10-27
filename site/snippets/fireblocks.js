import { WalletClientSigner } from "@alchemy/aa-core";
import { ChainId, FireblocksWeb3Provider, } from "@fireblocks/fireblocks-web3-provider";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";
const externalProvider = new FireblocksWeb3Provider({
    // apiBaseUrl: ApiBaseUrl.Sandbox // If using a sandbox workspace
    privateKey: process.env.FIREBLOCKS_API_PRIVATE_KEY_PATH,
    apiKey: process.env.FIREBLOCKS_API_KEY,
    vaultAccountIds: process.env.FIREBLOCKS_VAULT_ACCOUNT_IDS,
    chainId: ChainId.SEPOLIA,
    logTransactionStatusChanges: true, // Verbose logging
});
const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(externalProvider),
});
export const signer = new WalletClientSigner(walletClient);
