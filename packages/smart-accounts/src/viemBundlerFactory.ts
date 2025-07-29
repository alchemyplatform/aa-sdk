import {
  createBundlerClient as viemCreateBundlerClient,
  bundlerActions,
} from "viem/account-abstraction";
import { getBlock } from "viem/actions";
import { fromHex, type Hex } from "viem";

export const DEFAULT_ENTRY_POINT_ADDRESS =
  "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789";

/**
 * Returns a viem-compatible bundler client that uses rundler_maxPriorityFeePerGas
 * for fee estimation (with fallback to eth_maxPriorityFeePerGas).
 *
 * @param {object} config - Configuration for the bundler client.
 * @param {object} config.account - The account to use for the bundler client.
 * @param {object} config.chain - The chain configuration for the bundler client.
 * @param {object} config.transport - The transport to use for the bundler client.
 * @param {string} [config.entryPointAddress] - Optional entry point address. Defaults to DEFAULT_ENTRY_POINT_ADDRESS.
 * @param {object} [config.userOperation] - Optional userOperation config to override defaults.
 * @returns {ReturnType<typeof viemCreateBundlerClient>} A bundler client with Alchemy/rundler fee estimation logic.
 */
export function AlchemyViemBundlerFactory(config: {
  account: any;
  chain: any;
  transport: any;
  entryPointAddress?: string;
  userOperation?: any;
}) {
  const entryPointAddress =
    config.entryPointAddress ?? DEFAULT_ENTRY_POINT_ADDRESS;
  const userOperation = {
    ...config.userOperation,
    entryPointAddress,
    estimateFeesPerGas: async ({ bundlerClient }: any) => {
      try {
        // Try to use rundler_maxPriorityFeePerGas if available
        const [block, maxPriorityFeePerGasEstimate] = await Promise.all([
          getBlock(bundlerClient, { blockTag: "latest" }),
          bundlerClient.request({
            method: "rundler_maxPriorityFeePerGas",
            params: [],
          } as any),
        ]);

        const baseFeePerGas = block.baseFeePerGas;
        if (!baseFeePerGas) throw new Error("baseFeePerGas is null");

        return {
          maxPriorityFeePerGas: fromHex(
            maxPriorityFeePerGasEstimate as Hex,
            "bigint",
          ),
          maxFeePerGas:
            (baseFeePerGas * 150n) / 100n +
            fromHex(maxPriorityFeePerGasEstimate as Hex, "bigint"),
        };
      } catch (error) {
        // Fallback to standard viem fee estimation if rundler method is not available
        const fees = await bundlerClient.estimateFeesPerGas();
        if (!fees.maxFeePerGas || fees.maxPriorityFeePerGas == null) {
          throw new Error(
            "Failed to estimate fees: missing maxFeePerGas or maxPriorityFeePerGas",
          );
        }
        return {
          maxFeePerGas: fees.maxFeePerGas,
          maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
        };
      }
    },
  };
  return viemCreateBundlerClient({
    ...config,
    userOperation,
  }).extend(bundlerActions);
}
