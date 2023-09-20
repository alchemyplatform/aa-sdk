import type { BaseSmartContractAccount, HttpTransport } from "@alchemy/aa-core";
import type { AlchemyProvider } from "../provider.js";

export const withAlchemyGasFeeEstimator = <
  TAccount extends BaseSmartContractAccount<HttpTransport>
>(
  provider: AlchemyProvider<TAccount>,
  baseFeeBufferPercent: bigint,
  maxPriorityFeeBufferPercent: bigint
): AlchemyProvider<TAccount> => {
  provider.withFeeDataGetter(async () => {
    const block = await provider.rpcClient.getBlock({ blockTag: "latest" });
    const baseFeePerGas = block.baseFeePerGas;
    if (baseFeePerGas == null) {
      throw new Error("baseFeePerGas is null");
    }
    const priorityFeePerGas = BigInt(
      await provider.alchemyClient.request({
        method: "rundler_maxPriorityFeePerGas",
        params: [],
      })
    );

    const baseFeeIncrease =
      (baseFeePerGas * (100n + baseFeeBufferPercent)) / 100n;
    const prioFeeIncrease =
      (priorityFeePerGas * (100n + maxPriorityFeeBufferPercent)) / 100n;

    return {
      maxFeePerGas: baseFeeIncrease + prioFeeIncrease,
      maxPriorityFeePerGas: prioFeeIncrease,
    };
  });
  return provider;
};
