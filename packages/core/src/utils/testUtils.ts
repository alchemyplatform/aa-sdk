import { createPublicClient, custom, type Address, type Chain } from "viem";
import {
  toSmartContractAccount,
  type SmartContractAccount,
} from "../account/smartContractAccount.js";
import {
  createPublicErc4337FromClient,
  type PublicErc4337Client,
} from "../client/publicErc4337Client.js";

export const createDummySmartContractAccount = async <
  C extends PublicErc4337Client
>(
  client: C,
  entrypoint: Address
): Promise<SmartContractAccount> => {
  return toSmartContractAccount({
    source: "dummy",
    accountAddress: "0x1234567890123456789012345678901234567890",
    entrypointAddress: entrypoint,
    client: client,
    signMessage: async () => "0xdeadbeef",
    signTypedData: async () => "0xdeadbeef",
    getAccountInitCode: async () =>
      "0x1234567890123456789012345678901234567890deadbeef",
    encodeBatchExecute: async () => "0x",
    encodeExecute: async () => "0x",
    getDummySignature: () =>
      "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
  });
};

export const createTestClient = (chain: Chain) => {
  return createPublicErc4337FromClient(
    createPublicClient({
      chain,
      transport: custom({
        request: async () => {},
      }),
    })
  );
};
