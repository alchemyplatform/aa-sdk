import {
  type Address,
  type Client,
  type Hex,
  type RpcUserOperation,
  custom,
  hexToBigInt,
  toHex,
  type StateOverride,
  type UserOperation,
  type EntryPointVersion,
  type NoUndefined,
} from "viem";
import {
  estimateUserOperationGas,
  formatUserOperation,
  type SmartAccount,
} from "viem/account-abstraction";
import { paymaster060 } from "./paymaster060";
import { paymaster070 } from "./paymaster070";
import { paymaster080 } from "./paymaster080";
import { bigIntMultiply } from "@alchemy/common";

interface Multiplier {
  multiplier: number;
}

type UserOperationPaymasterOverrides<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
> = TEntryPointVersion extends "0.6"
  ? {
      // paymasterData overrides to bypass paymaster middleware
      paymasterAndData: Hex;
    }
  : TEntryPointVersion extends "0.7"
    ? {
        // paymasterData overrides to bypass paymaster middleware
        // if set to '0x', all paymaster related fields are omitted from the user op request
        paymasterData: Hex;
        paymaster: Address;
        paymasterVerificationGasLimit:
          | NoUndefined<UserOperation<"0.7">["paymasterVerificationGasLimit"]>
          | Multiplier;
        paymasterPostOpGasLimit:
          | NoUndefined<UserOperation<"0.7">["paymasterPostOpGasLimit"]>
          | Multiplier;
      }
    : {};

type UserOperationOverrides<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
> = Partial<
  {
    callGasLimit:
      | UserOperation<TEntryPointVersion>["callGasLimit"]
      | Multiplier;
    maxFeePerGas:
      | UserOperation<TEntryPointVersion>["maxFeePerGas"]
      | Multiplier;
    maxPriorityFeePerGas:
      | UserOperation<TEntryPointVersion>["maxPriorityFeePerGas"]
      | Multiplier;
    preVerificationGas:
      | UserOperation<TEntryPointVersion>["preVerificationGas"]
      | Multiplier;
    verificationGasLimit:
      | UserOperation<TEntryPointVersion>["verificationGasLimit"]
      | Multiplier;

    /**
     * The same state overrides for
     * [`eth_call`](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-eth#eth-call) method.
     * An address-to-state mapping, where each entry specifies some state to be ephemerally overridden
     * prior to executing the call. State overrides allow you to customize the network state for
     * the purpose of the simulation, so this feature is useful when you need to estimate gas
     * for user operation scenarios under conditions that aren’t currently present on the live network.
     */
    stateOverride: StateOverride;
  } & UserOperationPaymasterOverrides<TEntryPointVersion>
> &
  /**
   * This can be used to override the nonce or nonce key used when calling `entryPoint.getNonce`
   * It is useful when you want to use parallel nonces for user operations
   *
   * NOTE: not all bundlers fully support this feature and it could be that your bundler will still only include
   * one user operation for your account in a bundle
   */
  Partial<
    | {
        nonceKey: bigint;
        nonce: never;
      }
    | { nonceKey: never; nonce: bigint }
  >;

export const paymasterTransport = (
  client: Client & { mode: "anvil" },
  bundlerClient: Client<any, any, SmartAccount | undefined> & {
    mode: "bundler";
  },
) =>
  custom({
    request: async (args) => {
      if (args.method === "pm_getPaymasterStubData") {
        const [, entrypoint, , context] = args.params as [
          RpcUserOperation,
          Address,
          Hex,
          { policyId?: string | string[] },
        ];

        if (!context.policyId?.length) {
          throw new Error("policyId is required for paymaster sponsorship");
        }

        try {
          const paymaster = getPaymasterForAddress(entrypoint);
          return paymaster.getPaymasterStubData();
        } catch (e) {
          console.log(e);
          throw e;
        }
      } else if (args.method === "pm_getPaymasterData") {
        const [uo, entrypoint, , context] = args.params as [
          RpcUserOperation,
          Address,
          Hex,
          { policyId?: string | string[] },
        ];

        if (!context.policyId?.length) {
          throw new Error("policyId is required for paymaster sponsorship");
        }

        try {
          const paymaster = getPaymasterForAddress(entrypoint);
          return paymaster.getPaymasterData(uo, client);
        } catch (e) {
          console.log(e);
          throw e;
        }
      } else if (args.method === "alchemy_requestGasAndPaymasterAndData") {
        try {
          // There's some bad type-casting happening here as of SDKv5, because viem and aa-sdk/core's concept of a
          // RpcUserOperation is slightly different, but so far the only issue we've needed to patch is loading
          // the dummy signature into the UO's signature. More may come up as we increase test coverage.
          const [{ userOperation, entryPoint, dummySignature, overrides }] =
            args.params as [
              {
                policyId: string;
                entryPoint: Address;
                dummySignature: Hex;
                userOperation: RpcUserOperation;
                overrides?: UserOperationOverrides;
                erc20Context?: {
                  tokenAddress: Address;
                  maxTokenAmount?: string;
                };
              },
            ];

          const paymaster = getPaymasterForAddress(entryPoint);

          let uo: RpcUserOperation = {
            ...userOperation,
            signature: userOperation.signature ?? dummySignature,
          };

          const maxFeePerGas: Hex = toHex(
            bigIntMultiply(
              hexToBigInt(
                await client.request({
                  method: "eth_gasPrice",
                }),
              ),
              1.5,
            ),
          );

          const maxPriorityFeePerGas = await bundlerClient.request<{
            Parameters: [];
            ReturnType: RpcUserOperation["maxPriorityFeePerGas"];
          }>({
            method: "rundler_maxPriorityFeePerGas",
            params: [],
          });

          const stubData = paymaster.getPaymasterStubData();

          // RpcUserOperation is a discriminated union (v0.6 vs v0.7), so we need to assert
          // when merging fields from different sources (stubData varies by version).
          uo = {
            ...uo,
            maxFeePerGas,
            maxPriorityFeePerGas,
            ...stubData,
          } as RpcUserOperation;

          const gasEstimatesRaw = await estimateUserOperationGas(
            bundlerClient,
            {
              ...formatUserOperation(uo),
              entryPointAddress: entryPoint,
            },
          );
          const gasEstimates = Object.fromEntries(
            Object.entries(gasEstimatesRaw).map(([k, v]) => [
              k,
              typeof v === "bigint" ? toHex(v) : v,
            ]),
          );

          uo = {
            ...uo,
            ...gasEstimates,
            ...(paymaster.isV07Abi
              ? {
                  paymasterPostOpGasLimit: toHex(0),
                }
              : {}),
          } as RpcUserOperation;

          const pmFields = await paymaster.getPaymasterData(uo, client);

          return {
            ...uo,
            ...pmFields,
            ...overrides,
          };
        } catch (err) {
          console.log(err);
          throw err;
        }
      }

      throw new Error("Method not found");
    },
  });

const getPaymasterForAddress = (address: Address) => {
  if (address.toLowerCase() === paymaster060.entryPointAddress.toLowerCase()) {
    return paymaster060;
  } else if (
    address.toLowerCase() === paymaster070.entryPointAddress.toLowerCase()
  ) {
    return paymaster070;
  } else if (
    address.toLowerCase() === paymaster080.entryPointAddress.toLowerCase()
  ) {
    return paymaster080;
  }
  throw new Error(`Paymaster not found for address ${address}`);
};
