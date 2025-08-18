import type { Address, Hex, PartialBy } from "viem";
import type {
  EntryPointVersion,
  RpcUserOperation,
} from "viem/account-abstraction";
import type { Multiplier } from "./actions/types.js";

export type RpcGasAndFeeOverrides<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
> = Partial<
  {
    callGasLimit:
      | RpcUserOperation<TEntryPointVersion>["callGasLimit"]
      | Multiplier;
    preVerificationGas:
      | RpcUserOperation<TEntryPointVersion>["preVerificationGas"]
      | Multiplier;
    verificationGasLimit:
      | RpcUserOperation<TEntryPointVersion>["verificationGasLimit"]
      | Multiplier;
    maxFeePerGas:
      | RpcUserOperation<TEntryPointVersion>["maxFeePerGas"]
      | Multiplier;
    maxPriorityFeePerGas:
      | RpcUserOperation<TEntryPointVersion>["maxPriorityFeePerGas"]
      | Multiplier;
  } & ("paymasterPostOpGasLimit" extends keyof RpcUserOperation<TEntryPointVersion>
    ? {
        paymasterPostOpGasLimit:
          | RpcUserOperation<TEntryPointVersion>["paymasterPostOpGasLimit"]
          | Multiplier;
      }
    : {})
>;

export type AlchemyRequestGasAndPaymasterAndDataSchema = {
  Method: "alchemy_requestGasAndPaymasterAndData";
  Parameters: [
    {
      policyId: string | string[];
      entryPoint: Address;
      erc20Context?: {
        tokenAddress: Address;
        permit?: Hex;
        maxTokenAmount?: bigint; // Note: this will be correctly serialized by http transports in viem, but not websocket transports. Not sure if we need to suggest a patch upstream.
      };
      dummySignature: Hex;
      userOperation:
        | PartialBy<
            Pick<
              RpcUserOperation<"0.6">,
              | "sender"
              | "nonce"
              | "callData"
              | "initCode"
              | "callGasLimit"
              | "verificationGasLimit"
              | "maxFeePerGas"
              | "maxPriorityFeePerGas"
              | "preVerificationGas"
              | "eip7702Auth"
            >,
            | "initCode"
            | "callGasLimit"
            | "verificationGasLimit"
            | "maxFeePerGas"
            | "maxPriorityFeePerGas"
            | "preVerificationGas"
            | "eip7702Auth"
          >
        | PartialBy<
            Pick<
              RpcUserOperation<"0.7">,
              | "sender"
              | "nonce"
              | "callData"
              | "factory"
              | "factoryData"
              | "callGasLimit"
              | "verificationGasLimit"
              | "maxFeePerGas"
              | "maxPriorityFeePerGas"
              | "preVerificationGas"
              | "paymasterVerificationGasLimit"
              | "paymasterPostOpGasLimit"
              | "eip7702Auth"
            >,
            | "factory"
            | "factoryData"
            | "callGasLimit"
            | "verificationGasLimit"
            | "maxFeePerGas"
            | "maxPriorityFeePerGas"
            | "preVerificationGas"
            | "paymasterVerificationGasLimit"
            | "paymasterPostOpGasLimit"
            | "eip7702Auth"
          >;
      overrides?: RpcGasAndFeeOverrides<"0.6"> | RpcGasAndFeeOverrides<"0.7">;
      // todo(v5): add support for state overrides here.
    },
  ];
  ReturnType: Pick<
    RpcUserOperation,
    | "callGasLimit"
    | "verificationGasLimit"
    | "maxFeePerGas"
    | "maxPriorityFeePerGas"
    | "preVerificationGas"
  > &
    (
      | Required<Pick<RpcUserOperation<"0.6">, "paymasterAndData">>
      | Required<
          Pick<
            RpcUserOperation<"0.7">,
            | "paymaster"
            | "paymasterData"
            | "paymasterVerificationGasLimit"
            | "paymasterPostOpGasLimit"
          >
        >
    );
};

// Once you've defined this schema, import it into the schema.ts file found in the root alchemy package
export type AlchemyWalletApisRpcSchema = [
  AlchemyRequestGasAndPaymasterAndDataSchema,
];

export type RundlerMaxPriorityFeePerGasSchema = {
  Method: "rundler_maxPriorityFeePerGas";
  Parameters: [];
  ReturnType: RpcUserOperation["maxPriorityFeePerGas"];
};

export type RundlerRpcSchema = [RundlerMaxPriorityFeePerGasSchema];
