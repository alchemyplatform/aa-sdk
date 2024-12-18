import {
  createSmartAccountClientFromExisting,
  getEntryPoint,
  toSmartContractAccount,
  WalletClientSigner,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import {
  http,
  type SignableMessage,
  type Hash,
  type Chain,
  HDAccount,
  createWalletClient,
} from "viem";

import { mekong } from "./transportSetup";
import { AlchemyTransport } from "@account-kit/infra";

export const createSma7702Client = async (
  transport: AlchemyTransport,
  chain: Chain,
  localAccount: HDAccount
) => {
  const walletClient = createWalletClient({
    chain,
    transport,
    account: localAccount,
  });

  const account = await toSmartContractAccount({
    source: "Sma7702",
    chain: mekong,
    transport,
    entryPoint: getEntryPoint(mekong, { version: "0.7.0" }),
    getAccountInitCode: async (): Promise<Hash> => "0x",
    // an invalid signature that doesn't cause your account to revert during validation
    getDummySignature: async (): Promise<Hash> =>
      "0xff00fffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    // given a UO in the form of {target, data, value} should output the calldata for calling your contract's execution method
    encodeExecute: async (uo): Promise<Hash> => "0x....",
    signMessage: async ({ message }): Promise<Hash> => "0x...",
    signTypedData: async (typedData): Promise<Hash> => "0x000",
  });

  return createSmartAccountClientFromExisting(account);
};
