import type { AlchemyProvider } from "../provider.js";
import type { ClientWithAlchemyMethods } from "./client.js";

export const withAlchemyGasFeeEstimator = <P extends AlchemyProvider>(
  provider: P,
  baseFeeBufferPercent: bigint,
  maxPriorityFeeBufferPercent: bigint
): P => {
  provider.withFeeDataGetter(async () => {
    const block = await provider.rpcClient.getBlock({ blockTag: "latest" });
    const baseFeePerGas = block.baseFeePerGas;
    if (baseFeePerGas == null) {
      throw new Error("baseFeePerGas is null");
    }
    const priorityFeePerGas = BigInt(
      // it's a fair assumption that if someone is using this Alchemy Middleware, then they are using Alchemy RPC
      await (provider.rpcClient as ClientWithAlchemyMethods).request({
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
