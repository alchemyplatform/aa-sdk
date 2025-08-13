import type { Client, Chain, Account, Prettify, Address, Hex } from "viem";
import type { AlchemyTransport } from "@alchemy/common";
import type { AlchemyWalletApisRpcSchema } from "../schema.js";
import {
  formatUserOperationRequest,
  type EntryPointVersion,
  type UserOperationRequest,
} from "viem/account-abstraction";
import {
  formatGasAndPaymasterResponse,
  formatOverridesRequest,
} from "../utils/format.js";

export type RequestGasAndPaymasterAndDataRequest = [
  {
    policyId: string | string[];
    entryPoint: Address;
    erc20Context?: {
      tokenAddress: Address;
      permit?: Hex;
      maxTokenAmount?: bigint;
    };
    dummySignature: Hex;
    userOperation: UserOperationRequest;
    overrides?:
      | GasAndFeeOverridesRequest<"0.6">
      | GasAndFeeOverridesRequest<"0.7">;
  },
];

export type RequestGasAndPaymasterAndDataResponse = Prettify<
  Pick<
    UserOperationRequest,
    | "callGasLimit"
    | "preVerificationGas"
    | "verificationGasLimit"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
  > &
    (
      | Required<Pick<UserOperationRequest<"0.6">, "paymasterAndData">>
      | Required<
          Pick<
            UserOperationRequest<"0.7">,
            | "paymaster"
            | "paymasterData"
            | "paymasterVerificationGasLimit"
            | "paymasterPostOpGasLimit"
          >
        >
    )
>;

// @internal
export type Multiplier = {
  multiplier: bigint;
};

// @internal
export type GasAndFeeOverridesRequest<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
> = Partial<
  {
    callGasLimit:
      | UserOperationRequest<TEntryPointVersion>["callGasLimit"]
      | Multiplier;
    preVerificationGas:
      | UserOperationRequest<TEntryPointVersion>["preVerificationGas"]
      | Multiplier;
    verificationGasLimit:
      | UserOperationRequest<TEntryPointVersion>["verificationGasLimit"]
      | Multiplier;
    maxFeePerGas:
      | UserOperationRequest<TEntryPointVersion>["maxFeePerGas"]
      | Multiplier;
    maxPriorityFeePerGas:
      | UserOperationRequest<TEntryPointVersion>["maxPriorityFeePerGas"]
      | Multiplier;
  } & ("paymasterPostOpGasLimit" extends keyof UserOperationRequest<TEntryPointVersion>
    ? {
        paymasterPostOpGasLimit:
          | UserOperationRequest<TEntryPointVersion>["paymasterPostOpGasLimit"]
          | Multiplier;
      }
    : {})
>;

/**
 * Requests gas estimation and paymaster data from the Alchemy Gas Manager API for a user operation.
 * This function retrieves the necessary gas parameters and paymaster data needed to properly construct and submit
 * user operations to the network with gas sponsorship.
 *
 * @param {object} client - The client to add the actions to.
 * @param {object} params - The parameters for the action.
 * @returns {object} - The result of the action.
 */
export const requestGasAndPaymasterAndData = async <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  client: Client<
    AlchemyTransport<AlchemyWalletApisRpcSchema>,
    TChain,
    TAccount,
    AlchemyWalletApisRpcSchema
  >,
  params: RequestGasAndPaymasterAndDataRequest,
): Promise<RequestGasAndPaymasterAndDataResponse> => {
  const [
    {
      policyId,
      entryPoint,
      erc20Context,
      dummySignature,
      userOperation,
      overrides,
    },
  ] = params;

  const response = await client.request({
    method: "alchemy_requestGasAndPaymasterAndData",
    params: [
      {
        policyId,
        entryPoint,
        erc20Context,
        dummySignature,
        userOperation: formatUserOperationRequest(userOperation),
        overrides:
          overrides != null ? formatOverridesRequest(overrides) : undefined,
      },
    ] as const,
  });

  return formatGasAndPaymasterResponse(response);
};
