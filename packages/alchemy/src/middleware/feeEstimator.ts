import type { ClientMiddlewareFn } from "@alchemy/aa-core";
import { applyUserOpOverrideOrFeeOption } from "@alchemy/aa-core";
import type { ClientWithAlchemyMethods } from "../client/types";

export const alchemyFeeEstimator: <C extends ClientWithAlchemyMethods>(
  client: C
) => ClientMiddlewareFn =
  (client) =>
  async (struct, { overrides, feeOptions }) => {
    let [block, maxPriorityFeePerGasEstimate] = await Promise.all([
      client.getBlock({ blockTag: "latest" }),
      // it is a fair assumption that if someone is using this Alchemy Middleware, then they are using Alchemy RPC
      client.request({
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
