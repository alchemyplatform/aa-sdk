import {
  type UserOperationRequest,
  type UserOperationOverrides,
  bigIntMultiply,
  deepHexlify,
} from "@aa-sdk/core";
import {
  type Address,
  type Client,
  type Hex,
  custom,
  hexToBigInt,
  toHex,
} from "viem";
import { paymaster060 } from "./paymaster060";
import { paymaster070 } from "./paymaster070";
import { paymaster080 } from "./paymaster080";
import { estimateUserOperationGas } from "../../../aa-sdk/core/src/actions/bundler/estimateUserOperationGas";

export const paymasterTransport = (
  client: Client & { mode: "anvil" },
  bundlerClient: Client & { mode: "bundler" },
) =>
  custom({
    request: async (args) => {
      if (args.method === "pm_getPaymasterStubData") {
        const [, entrypoint, , context] = args.params as [
          UserOperationRequest,
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
          UserOperationRequest,
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
          // UserOperationRequest is slightly different, but so far the only issue we've needed to patch is loading
          // the dummy signature into the UO's signature. More may come up as we increase test coverage.
          // TODO(v5): cast as viem RpcUserOperation instead of aa-sdk/core's UserOperationRequest.
          const [{ userOperation, entryPoint, dummySignature, overrides }] =
            args.params as [
              {
                policyId: string;
                entryPoint: Address;
                dummySignature: Hex;
                userOperation: UserOperationRequest;
                overrides?: UserOperationOverrides;
                erc20Context?: {
                  tokenAddress: Address;
                  maxTokenAmount?: string;
                };
              },
            ];

          const paymaster = getPaymasterForAddress(entryPoint);

          let uo = {
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
            ReturnType: UserOperationRequest["maxPriorityFeePerGas"];
          }>({
            method: "rundler_maxPriorityFeePerGas",
            params: [],
          });

          const stubData = paymaster.getPaymasterStubData();

          uo = {
            ...uo,
            maxFeePerGas,
            maxPriorityFeePerGas,
            ...stubData,
          };

          const gasEstimates = deepHexlify(
            await estimateUserOperationGas(bundlerClient, {
              request: uo,
              entryPoint,
            }),
          );

          uo = {
            ...uo,
            ...gasEstimates,
            ...(paymaster.isV07Abi
              ? {
                  paymasterPostOpGasLimit: toHex(0),
                }
              : {}),
          };

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
