import {
  type UserOperationRequest,
  type UserOperationOverrides,
} from "@aa-sdk/core";
import { type Address, type Client, type Hex, custom } from "viem";
import { paymaster060 } from "./paymaster060";
import { paymaster070 } from "./paymaster070";

export const paymasterTransport = (client: Client & { mode: "anvil" }) =>
  custom({
    request: async (args) => {
      if (args.method === "pm_getPaymasterStubData") {
        const [, entrypoint] = args.params as [
          UserOperationRequest,
          Address,
          Hex,
          Record<string, any>
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
          Record<string, any>
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
        const [{ userOperation, entryPoint, overrides }] = args.params as [
          {
            policyId: string;
            entryPoint: Address;
            dummySignature: Hex;
            userOperation: UserOperationRequest;
            overrides?: UserOperationOverrides;
          }
        ];
        const isPMv7 =
          entryPoint.toLowerCase() ===
          paymaster070.entryPointAddress.toLowerCase();

        // TODO(jh): Any way to *actually* estimate gas here?
        const gasFields = {
          maxFeePerGas: "0x9C40F18B4",
          maxPriorityFeePerGas: "0x3b9aca00",
          callGasLimit: "0x353A",
          verificationGasLimit: "0x40b64",
          preVerificationGas: "0xbd84",
          ...(isPMv7
            ? {
                paymasterVerificationGasLimit: "0x238c",
                paymasterPostOpGasLimit: "0x238c",
              }
            : {}),
        } satisfies Record<string, Hex>;

        try {
          const uoWithStubData = {
            ...userOperation,
            ...gasFields,
            ...(isPMv7
              ? paymaster070.getPaymasterStubData()
              : paymaster060.getPaymasterStubData()),
          };

          const pmFields = isPMv7
            ? await paymaster070.getPaymasterData(uoWithStubData, client)
            : await paymaster060.getPaymasterData(uoWithStubData, client);

          return {
            ...uoWithStubData,
            ...pmFields,
            ...overrides,
          };
        } catch (err) {
          console.log(err);
          throw err;
        }
      } else if (args.method === "rundler_maxPriorityFeePerGas") {
        console.log("rundler_maxPriorityFeePerGas");
        // TODO(jh): any better way to mock this?
        return "0x3b9aca00";
      }

      throw new Error("Method not found");
    },
  });
