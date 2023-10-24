import { WalletClientSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { Magic } from "magic-sdk";
import { createWalletClient, custom } from "viem";

// this is generated from the [Magic Dashboard](https://dashboard.magic.link/)
const MAGIC_API_KEY = "pk_test_...";

// instantiate Magic SDK instance
export const magic = new Magic(MAGIC_API_KEY);

// a viem wallet client that wraps magic for utility methods
// NOTE: because this is async, you will need to put this in a useEffect hook if using React
export const magicClient = createWalletClient({
  transport: custom(await magic.wallet.getProvider()),
});

// a smart account signer you can use as an owner on ISmartContractAccount
export const magicSigner: SmartAccountSigner = new WalletClientSigner(
  magicClient,
  "magic" // signerType
);

// NOTE: before you can use the above signer as an owner, you need to authenticate the user first
// for example:
await magic.wallet.connectWithUI();
// for more details see the docs: https://magic.link/docs/dedicated/overview
