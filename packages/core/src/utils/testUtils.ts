import { createPublicClient, custom, type Address, type Chain } from "viem";
import {
  toSmartContractAccount,
  type SmartContractAccount,
} from "../account/smartContractAccount.js";
import {
  createBundlerClientFromExisting,
  type BundlerClient,
} from "../client/bundlerClient.js";

export const createDummySmartContractAccount = async <C extends BundlerClient>(
  client: C,
  entrypoint: Address
): Promise<SmartContractAccount> => {
  return toSmartContractAccount({
    source: "dummy",
    accountAddress: "0x1234567890123456789012345678901234567890",
    entrypointAddress: entrypoint,
    chain: client.chain,
    transport: custom(client),
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
  return createBundlerClientFromExisting(
    createPublicClient({
      chain,
      transport: custom({
        request: async () => {},
      }),
    })
  );
};
