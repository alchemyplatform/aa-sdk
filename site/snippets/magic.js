import { WalletClientSigner } from "@alchemy/aa-core";
import { Magic } from "magic-sdk";
import { createWalletClient, custom } from "viem";
// this is generated from the [Magic Dashboard](https://dashboard.magic.link/)
const MAGIC_API_KEY = "pk_test_...";
// instantiate Magic SDK instance
export const magic = new Magic(MAGIC_API_KEY);
// a viem wallet client that wraps magic for utility methods
// NOTE: this isn't necessary since you can just use the `magic.rpcProvider`
// directly, but this makes things much easier
export const magicClient = createWalletClient({
    transport: custom(magic.rpcProvider),
});
// a smart account signer you can use as an owner on ISmartContractAccount
export const magicSigner = new WalletClientSigner(magicClient, "magic" // signerType
);
