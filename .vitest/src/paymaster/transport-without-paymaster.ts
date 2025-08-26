import { custom, type Address, type Hex, toHex } from "viem";
import { deepHexlify, hexToBigInt } from "@aa-sdk/core";
import type {
  UserOperationRequest,
  UserOperationOverrides,
} from "@aa-sdk/core";
import { estimateUserOperationGas } from "viem/account-abstraction";
import type { Client, Transport } from "viem";
import { bigIntMultiply } from "../utils";

/**
 * Creates a custom transport for testing that intercepts alchemy_requestGasAndPaymasterAndData
 * and returns responses without paymaster data to avoid signature validation issues in tests.
 */
export const createTestTransportWithoutPaymaster = (
  { client }: { client: Client<Transport> },
  bundlerClient: any,
) => {
  return custom({
    async request(args: any) {
      if (args.method === "alchemy_requestGasAndPaymasterAndData") {
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

          // Don't include any paymaster data
          uo = {
            ...uo,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymasterAndData: "0x",
          };

          const gasEstimates = deepHexlify(
            await estimateUserOperationGas(bundlerClient, {
              request: uo,
              entryPoint,
            }),
          );

          return {
            ...uo,
            ...gasEstimates,
            ...overrides,
          };
        } catch (err) {
          console.log(err);
          throw err;
        }
      }

      // Fall back to the original client for all other methods
      return client.request(args);
    },
  });
};
