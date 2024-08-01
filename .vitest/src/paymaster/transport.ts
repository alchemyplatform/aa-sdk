import type { UserOperationRequest } from "@aa-sdk/core";
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
      }

      throw new Error("Method not found");
    },
  });
