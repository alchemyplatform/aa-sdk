import type {
  UserOperationFeeOptions,
  UserOperationOverrides,
  UserOperationStruct,
} from "../../types.js";
import { deepHexlify, resolveProperties } from "../../utils/index.js";
import { applyUserOpOverrideOrFeeOption } from "../../utils/userop.js";
import type { MiddlewareClient } from "../actions.js";
import type { ClientMiddlewareFn } from "../types.js";

/**
 * Description default gas estimator middleware for `SmartAccountClient`
 * You can override this middleware with your custom gas estimator middleware
 * by passing it to the client constructor
 *
 * @param client smart account client instance to apply the middleware to
 * @returns middleware execution function used to estimate gas for user operations
 */
export const defaultGasEstimator: <C extends MiddlewareClient>(
  client: C
) => ClientMiddlewareFn =
  (client) =>
  async (struct, { account, overrides, feeOptions }) => {
    const request = deepHexlify(await resolveProperties(struct));

    const estimates = await client.estimateUserOperationGas(
      request,
      account.getEntryPoint().address,
      overrides?.stateOverride
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

    const entryPoint = account.getEntryPoint();
    if (entryPoint.version === "0.7.0") {
      const paymasterVerificationGasLimit = applyUserOpOverrideOrFeeOption(
        estimates.paymasterVerificationGasLimit,
        (overrides as UserOperationOverrides<"0.7.0">)
          ?.paymasterVerificationGasLimit,
        (feeOptions as UserOperationFeeOptions<"0.7.0">)
          ?.paymasterVerificationGasLimit
      );
      (struct as UserOperationStruct<"0.7.0">).paymasterVerificationGasLimit =
        paymasterVerificationGasLimit;
    }

    return struct;
  };
