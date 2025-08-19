import { createBundlerClient } from "viem/account-abstraction";
import type { Chain, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import {
  alchemyEstimateFeesPerGas,
  alchemyRpcSchema,
} from "./custom/alchemyEstimateFeesPerGas.js";

/**
 * Create a viem Bundler Client pre-configured for Alchemy Bundler.
 *
 * Uses rundler_maxPriorityFeePerGas fee estimation via a custom function.
 * Extends the RPC schema so the new method is typed.
 * TODO(v5): Revisit the `createAlchemyBundlerClient` export - we might rename or move it in the next major.
 *
 * @example
 * ```ts
 * import { createAlchemyBundlerClient } from "@alchemy/aa-infra";
 *
 * const bundler = createAlchemyBundlerClient({
 *   account: smartAccount,
 *   chain: mainnet,
 *   transport: custom(rpcClient),
 * });
 * ```
 *
 * @param {Params} params The parameter configuration object
 * @param {SmartAccount} params.account The smart account instance for the client
 * @param {Chain | undefined} params.chain The chain the bundler operates on
 * @param {Transport} params.transport The viem transport
 * @returns {BundlerClient} A Bundler Client ready to use with Alchemy's Rundler
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
