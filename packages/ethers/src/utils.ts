import type { SimpleSmartAccountOwner } from "@alchemy/aa-core";
import { Wallet } from "@ethersproject/wallet";

export const convertWalletToAccountSigner = (
  wallet: Wallet
): SimpleSmartAccountOwner => {
  return {
    getAddress: async () => Promise.resolve(wallet.address as `0x${string}`),
    signMessage: async (msg: Uint8Array | string) =>
      (await wallet.signMessage(msg)) as `0x${string}`,
  };
};
