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
import { estimateUserOperationGas } from "../../../aa-sdk/core/src/actions/bundler/estimateUserOperationGas";

export const paymasterTransport = (
  client: Client & { mode: "anvil" },
  bundlerClient: Client & { mode: "bundler" },
) =>
  custom({
    request: async (args) => {
      if (args.method === "pm_getPaymasterStubData") {
        const [, entrypoint] = args.params as [
          UserOperationRequest,
          Address,
          Hex,
          Record<string, any>,
        ];

        try {
          if (
            entrypoint.toLowerCase() ===
            paymaster060.entryPointAddress.toLowerCase()
          ) {
            return paymaster060.getPaymasterStubData();
          } else {
            return paymaster070.getPaymasterStubData();
          }
        } catch (e) {
          console.log(e);
          throw e;
        }
      } else if (args.method === "pm_getPaymasterData") {
        const [uo, entrypoint] = args.params as [
          UserOperationRequest,
          Address,
          Hex,
          Record<string, any>,
        ];

        try {
          if (
            entrypoint.toLowerCase() ===
            paymaster060.entryPointAddress.toLowerCase()
          ) {
            return paymaster060.getPaymasterData(uo, client);
          } else {
            return paymaster070.getPaymasterData(uo, client);
          }
        } catch (e) {
          console.log(e);
          throw e;
        }
      } else if (args.method === "alchemy_requestGasAndPaymasterAndData") {
        try {
          const [{ userOperation, entryPoint, dummySignature, overrides }] =
            args.params as [
              {
                policyId: string;
                entryPoint: Address;
                dummySignature: Hex;
                userOperation: UserOperationRequest;
                overrides?: UserOperationOverrides;
              },
            ];
          const isPMv7 =
            entryPoint.toLowerCase() ===
            paymaster070.entryPointAddress.toLowerCase();

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

          const stubData = isPMv7
            ? paymaster070.getPaymasterStubData()
            : paymaster060.getPaymasterStubData();

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
            ...(isPMv7
              ? {
                  paymasterPostOpGasLimit: toHex(0),
                }
              : {}),
          };

          const pmFields = isPMv7
            ? await paymaster070.getPaymasterData(uo, client)
            : await paymaster060.getPaymasterData(uo, client);

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
