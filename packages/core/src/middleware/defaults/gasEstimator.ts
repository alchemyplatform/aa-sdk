import { deepHexlify, resolveProperties } from "../../utils/index.js";
import { applyUserOpOverrideOrFeeOption } from "../../utils/userop.js";
import type { MiddlewareClient } from "../actions.js";
import type { ClientMiddlewareFn } from "../types.js";

export const defaultGasEstimator: <C extends MiddlewareClient>(
  client: C
) => ClientMiddlewareFn =
  (client) =>
  async (struct, { account, overrides, feeOptions }) => {
    const request = deepHexlify(await resolveProperties(struct));

    const estimates = await client.estimateUserOperationGas(
      request,
      account.getEntrypoint()
    );

    const callGasLimit = applyUserOpOverrideOrFeeOption(
      estimates.callGasLimit,
      overrides?.callGasLimit,
      feeOptions?.callGasLimit
    );
    const verificationGasLimit = applyUserOpOverrideOrFeeOption(
      estimates.verificationGasLimit,
      overrides?.verificationGasLimit,
      feeOptions?.verificationGasLimit
    );
    const preVerificationGas = applyUserOpOverrideOrFeeOption(
      estimates.preVerificationGas,
      overrides?.preVerificationGas,
      feeOptions?.preVerificationGas
    );

    struct.callGasLimit = callGasLimit;
    struct.verificationGasLimit = verificationGasLimit;
    struct.preVerificationGas = preVerificationGas;
    return struct;
  };
