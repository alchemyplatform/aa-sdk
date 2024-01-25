import {
  applyUserOpOverrideOrFeeOption,
  type PublicErc4337Client,
} from "@alchemy/aa-core";
import type { ClientMiddlewareFn } from "@alchemy/aa-core/viem";
import type { ClientWithAlchemyMethods } from "../../middleware/client";

export const alchemyFeeEstimator: <C extends PublicErc4337Client>(
  client: C
) => ClientMiddlewareFn =
  (client) =>
  async (struct, { overrides, feeOptions }) => {
    let [block, maxPriorityFeePerGasEstimate] = await Promise.all([
      client.getBlock({ blockTag: "latest" }),
      // it's a fair assumption that if someone is using this Alchemy Middleware, then they are using Alchemy RPC
      (client as ClientWithAlchemyMethods).request({
        method: "rundler_maxPriorityFeePerGas",
        params: [],
      }),
    ]);

    const baseFeePerGas = block.baseFeePerGas;
    if (baseFeePerGas == null) {
      throw new Error("baseFeePerGas is null");
    }

    const maxPriorityFeePerGas = applyUserOpOverrideOrFeeOption(
      maxPriorityFeePerGasEstimate,
      overrides?.maxPriorityFeePerGas,
      feeOptions?.maxPriorityFeePerGas
    );
    const maxFeePerGas = applyUserOpOverrideOrFeeOption(
      baseFeePerGas + BigInt(maxPriorityFeePerGas),
      overrides?.maxFeePerGas,
      feeOptions?.maxFeePerGas
    );

    return {
      ...struct,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  };
