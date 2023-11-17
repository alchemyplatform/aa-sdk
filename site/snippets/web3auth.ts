import { WalletClientSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { Web3Auth } from "@web3auth/modal";
import { createWalletClient, custom } from "viem";

// see https://web3auth.io/docs/quick-start for more info
const web3auth = new Web3Auth({
  // web3auth config...
});

await web3auth.initModal();

await web3auth.connect();

if (web3auth.provider == null) {
  throw new Error("web3auth provider is available");
}

// a viem wallet client that wraps web3auth for utility methods
// NOTE: this isn't necessary since you can just use the `web3auth.rpcProvider`
// directly, but this makes things much easier
export const web3authClient = createWalletClient({
  transport: custom(web3auth.provider),
});

// a smart account signer you can use as an owner on ISmartContractAccount
export const web3authSigner: SmartAccountSigner = new WalletClientSigner(
  web3authClient,
  "web3auth" // signerType
);
