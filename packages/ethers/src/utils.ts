import type { Address, SmartAccountSigner } from "@alchemy/aa-core";
import type { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import type { SignTypedDataParameters } from "viem/accounts";

export const convertWalletToAccountSigner = (
  wallet: Wallet
): SmartAccountSigner => {
  return {
    getAddress: async () => Promise.resolve(wallet.address as `0x${string}`),
    signMessage: async (msg: Uint8Array | string) =>
      (await wallet.signMessage(msg)) as `0x${string}`,
    signTypedData: async (
      params: Omit<SignTypedDataParameters, "privateKey">
    ) => {
      return (await wallet._signTypedData(
        params.domain ?? {},
        // @ts-expect-error: these params should line up due to the spec for this function
        params.types,
        params.message
      )) as `0x${string}`;
    },
  };
};

export const convertEthersSignerToAccountSigner = (
  signer: Signer
): SmartAccountSigner => {
  return {
    getAddress: async () => signer.getAddress() as Promise<Address>,
    signMessage: async (msg: Uint8Array | string) =>
      (await signer.signMessage(msg)) as `0x${string}`,
    signTypedData: async (
      _params: Omit<SignTypedDataParameters, "privateKey">
    ) => {
      throw new Error(
        "signTypedData is not supported for ethers signers; use Wallet"
      );
    },
  };
};
