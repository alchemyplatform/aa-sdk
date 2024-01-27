import type { Address, SmartAccountSigner } from "@alchemy/aa-core";
import type { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import type { TypedData, TypedDataDefinition } from "viem";

/**
 * Converts a ethersjs Wallet to a SmartAccountSigner
 * @param wallet - the Wallet to convert
 * @returns {SmartAccountSigner} - a signer that can be used to sign and send user operations
 */
export const convertWalletToAccountSigner = (
  wallet: Wallet
): SmartAccountSigner<Wallet> => {
  return {
    inner: wallet,
    signerType: "local",
    getAddress: async () => Promise.resolve(wallet.address as `0x${string}`),
    signMessage: async (msg: Uint8Array | string) =>
      (await wallet.signMessage(msg)) as `0x${string}`,
    signTypedData: async <
      const TTypedData extends TypedData | { [key: string]: unknown },
      TPrimaryType extends string = string
    >(
      params: TypedDataDefinition<TTypedData, TPrimaryType>
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

/**
 * Converts a ethers.js Signer to a SmartAccountSigner
 * @param signer - the Signer to convert
 * @returns {SmartAccountSigner} - a signer that can be used to sign and send user operations
 */
export const convertEthersSignerToAccountSigner = (
  signer: Signer
): SmartAccountSigner<Signer> => {
  return {
    inner: signer,
    signerType: "json-rpc",
    getAddress: async () => signer.getAddress() as Promise<Address>,
    signMessage: async (msg: Uint8Array | string) =>
      (await signer.signMessage(msg)) as `0x${string}`,
    signTypedData: async <
      const TTypedData extends TypedData | { [key: string]: unknown },
      TPrimaryType extends string = string
    >(
      _params: TypedDataDefinition<TTypedData, TPrimaryType>
    ) => {
      throw new Error(
        "signTypedData is not supported for ethers signers; use Wallet"
      );
    },
  };
};
