/**
 * This example assumes your app is wrapped with the `PrivyProvider` and
 * is configured to create embedded wallets for users upon login.
 */
import { useWallets } from "@privy-io/react-auth";
import { WalletClientSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { LightSmartContractAccount } from "@alchemy/aa-accounts";
import { createWalletClient, custom } from 'viem';
import { sepolia } from "viem/chains";

// The code below makes use of Privy's React hooks. You must paste
// or use it within a React Component or Context.

// Find the user's embedded wallet
const {wallets} = useWallets();
const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));
if (!embeddedWallet) throw new Error('User does not have an embedded wallet');

// Switch the embedded wallet to your desired network
await embeddedWallet.switchChain(sepolia.id);

// Get a viem client from the embedded wallet
const eip1193provider = await embeddedWallet.getEthereumProvider();
const privyClient = createWalletClient({
    account: embeddedWallet.address,
    chain: sepolia,
    transport: custom(eip1193provider)
});

// Create a smart account signer from the embedded wallet's viem client
const privySigner: SmartAccountSigner = new WalletClientSigner(
    privyClient
);

// Create an Alchemy Provider with the smart account signer
const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY",
  sepolia,
  entryPointAddress: "0x...",
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: "0x...",
      chain: rpcClient.chain,
      owner: privySigner,
      factoryAddress: "0x...",
      rpcClient,
    })
);
