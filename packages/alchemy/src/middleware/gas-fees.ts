import type { AlchemyProvider } from "../provider.js";
import type { ClientWithAlchemyMethods } from "./client.js";

export const withAlchemyGasFeeEstimator = (
  provider: AlchemyProvider
): AlchemyProvider => {
  provider.withFeeDataGetter(async () => {
    const result = await (
      provider.rpcClient as ClientWithAlchemyMethods
    ).request({
      method: "rundler_getLocalRequiredFees",
      params: [],
    });
    return result.recommended;
  });
  return provider;
};
