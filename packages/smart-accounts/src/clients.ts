import { createBundlerClient } from "viem/account-abstraction";
import type { Chain, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import {
  alchemyEstimateFeesPerGas,
  alchemyRpcSchema,
} from "./alchemyEstimateFeesPerGas.js";

/**
 * Create a viem Bundler Client pre-configured for Alchemy Bundler:
 *
 * • Injects `rundler_maxPriorityFeePerGas` fee estimation via
 *   {@link alchemyEstimateFeesPerGas}.
 * • Extends the RPC schema with {@link alchemyRpcSchema} so the new method is
 *   typed.
 *
 * @param {object} params                    – configuration object.
 * @param {SmartAccount} params.account      – Smart account instance for the client.
 * @param {Chain | undefined} params.chain   – Chain the bundler operates on.
 * @param {Transport} params.transport       – viem transport (eg. `custom(client)`).
 * @returns {ReturnType<typeof createBundlerClient>} a Bundler Client ready to use with Alchemy’s Rundler.
 */
export function createAlchemyBundlerClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
>({
  account,
  chain,
  transport,
}: {
  account: TAccount;
  chain: TChain;
  transport: TTransport;
}) {
  return createBundlerClient({
    account,
    chain,
    transport,
    rpcSchema: alchemyRpcSchema,
    userOperation: {
      estimateFeesPerGas: alchemyEstimateFeesPerGas,
    },
  });
}
