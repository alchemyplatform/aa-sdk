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
          // There's some bad type-casting happening here as of SDKv5, because viem and aa-sdk/core's concept of a
          // UserOperationRequest is slightly different, but so far the only issue we've needed to patch is loading
          // the dummy signature into the UO's signature. More may come up as we increase test coverage.
          // TODO(v5): cast as viem RpcUserOperation instead of aa-sdk/core's UserOperationRequest.
          const [
            { userOperation, entryPoint, dummySignature, overrides, policyId },
          ] = args.params as [
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

          // Check if paymaster is deployed - if not, deploy it
          let usePaymaster = true;

          if (policyId === "test-policy") {
            // Check if paymaster is deployed
            const paymaster = isPMv7 ? paymaster070 : paymaster060;
            const paymasterAddress = paymaster.getPaymasterDetails().address;

            const code = await client.request({
              method: "eth_getCode",
              params: [paymasterAddress, "latest"],
            });

            if (code === "0x" || code === null) {
              // Deploy paymaster on-demand for tests
              try {
                await paymaster.deployPaymasterContract(client);
              } catch (error) {
                console.error(`Failed to deploy paymaster:`, error);
                usePaymaster = false;
              }
            }
          }

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

          const stubData = usePaymaster
            ? isPMv7
              ? paymaster070.getPaymasterStubData()
              : paymaster060.getPaymasterStubData()
            : { paymasterAndData: "0x" };

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

          const pmFields = usePaymaster
            ? isPMv7
              ? await paymaster070.getPaymasterData(uo, client)
              : await paymaster060.getPaymasterData(uo, client)
            : { paymasterAndData: "0x" };

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
