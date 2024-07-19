import type {
  ClientMiddlewareConfig,
  EntryPointVersion,
  Multiplier,
  UserOperationRequest,
} from "@aa-sdk/core";
import { erc7677Middleware } from "@aa-sdk/core";

/**
 * Alchemy gas manager configuration with gas policy id and optional gas estimation options
 *
 * To create a Gas Manager Policy, go to the [gas manager](https://dashboard.alchemy.com/gas-manager?a=embedded-accounts-get-started)
 * page of the Alchemy dashboard and click the “Create new policy” button.
 */
export interface AlchemyGasManagerConfig {
  /**
   * the policy id of the gas manager you want to use.
   *
   */
  policyId: string;
}

/**
 * overrides value for [`alchemy_requestGasAndPaymasterData`](https://docs.alchemy.com/reference/alchemy-requestgasandpaymasteranddata)
 *
 * @template {EntryPointVersion} TEntryPointVersion entry point version type
 */
export type RequestGasAndPaymasterAndDataOverrides<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = Partial<
  {
    maxFeePerGas:
      | UserOperationRequest<TEntryPointVersion>["maxFeePerGas"]
      | Multiplier;
    maxPriorityFeePerGas:
      | UserOperationRequest<TEntryPointVersion>["maxPriorityFeePerGas"]
      | Multiplier;
    callGasLimit:
      | UserOperationRequest<TEntryPointVersion>["callGasLimit"]
      | Multiplier;
    verificationGasLimit:
      | UserOperationRequest<TEntryPointVersion>["verificationGasLimit"]
      | Multiplier;
    preVerificationGas:
      | UserOperationRequest<TEntryPointVersion>["preVerificationGas"]
      | Multiplier;
  } & TEntryPointVersion extends "0.7.0"
    ? {
        paymasterVerificationGasLimit:
          | UserOperationRequest<"0.7.0">["paymasterVerificationGasLimit"]
          | Multiplier;
        paymasterPostOpGasLimit:
          | UserOperationRequest<"0.7.0">["paymasterPostOpGasLimit"]
          | Multiplier;
      }
    : {}
>;

/**
 * [`alchemy-requestpaymasteranddata`](https://docs.alchemy.com/reference/alchemy-requestpaymasteranddata)
 * response type
 *
 * @template {EntryPointVersion} TEntryPointVersion entry point version type
 */
export type RequestPaymasterAndDataResponse<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = TEntryPointVersion extends "0.6.0"
  ? {
      paymasterAndData: UserOperationRequest<"0.6.0">["paymasterAndData"];
    }
  : TEntryPointVersion extends "0.7.0"
  ? Pick<UserOperationRequest<"0.7.0">, "paymaster" | "paymasterData">
  : {};

/**
 * [`alchemy_requestGasAndPaymasterData`](https://docs.alchemy.com/reference/alchemy-requestgasandpaymasteranddata)
 * response type
 *
 * @template {EntryPointVersion} TEntryPointVersion entry point version type
 */
export type RequestGasAndPaymasterAndDataResponse<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = Pick<
  UserOperationRequest,
  | "callGasLimit"
  | "preVerificationGas"
  | "verificationGasLimit"
  | "maxFeePerGas"
  | "maxPriorityFeePerGas"
> &
  RequestPaymasterAndDataResponse<TEntryPointVersion>;

/**
 * Paymaster middleware factory that uses Alchemy's Gas Manager for sponsoring transactions.
 *
 * @example
 *  ```ts
 *
 * import { alchemyGasManagerMiddleware } from "@account-kit/infra";
 * import { sepolia } from "@account-kit/infra";
 * import { http } from "viem";
 *
 * const client = createSmartAccountClient({
 *      http("rpc-url"),
 *      sepolia,
 *      alchemyErc7677Middleware( {
 *        policyId,
 *      })
 *    );
 * ```
 *
 * @param {string} policyId the policyId for Alchemy's gas manager
 * @returns {Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData">} partial client middleware configuration containing `dummyPaymasterAndData` and `paymasterAndData`
 */
export function alchemyGasManagerMiddleware(
  policyId: string
): Pick<ClientMiddlewareConfig, "dummyPaymasterAndData" | "paymasterAndData"> {
  return erc7677Middleware<{ policyId: string }>({
    context: { policyId: policyId },
  });
}
