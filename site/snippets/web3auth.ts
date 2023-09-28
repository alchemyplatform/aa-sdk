import { WalletClientSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { Web3Auth } from "@web3auth/modal";
import { createWalletClient, custom } from "viem";

const web3auth = new Web3Auth({
  // web3auth config...
});

await web3auth.initModal();

await web3auth.connect();

// a viem wallet client that wraps magic for utility methods
// NOTE: this isn't necessary since you can just use the `web3auth.rpcProvider`
// directly, but this makes things much easier
export const web3authClient = createWalletClient({
  transport: custom(web3auth.provider),
});

// a smart account signer you can use as an owner on ISmartContractAccount
export const web3authSigner: SmartAccountSigner = new WalletClientSigner(
  web3authClient
);
