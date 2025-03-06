import { createPublicClient, custom, type Chain, type Hex } from "viem";
import {
  toSmartContractAccount,
  type SmartContractAccount,
} from "../account/smartContractAccount.js";
import {
  createBundlerClientFromExisting,
  type BundlerClient,
} from "../client/bundlerClient.js";
import { getEntryPoint } from "../entrypoint/index.js";
import type { DefaultEntryPointVersion } from "../entrypoint/types.js";

export const createDummySmartContractAccount = async <C extends BundlerClient>(
  client: C
): Promise<SmartContractAccount<"dummy", DefaultEntryPointVersion>> => {
  return toSmartContractAccount({
    source: "dummy",
    accountAddress: "0x1234567890123456789012345678901234567890",
    entryPoint: getEntryPoint(client.chain),
    chain: client.chain,
    transport: custom(client),
    signMessage: async () => "0xdeadbeef",
    signTypedData: async () => "0xdeadbeef",
    getAccountInitCode: async () =>
      "0x1234567890123456789012345678901234567890deadbeef",
    encodeBatchExecute: async () => "0x",
    encodeExecute: async () => "0x",
    getDummySignature: (): Hex =>
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
