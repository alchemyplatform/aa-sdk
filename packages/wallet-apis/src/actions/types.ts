import type { Address, Hex, Prettify } from "viem";
import type {
  UserOperationRequest,
  EntryPointVersion,
} from "viem/account-abstraction";

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
