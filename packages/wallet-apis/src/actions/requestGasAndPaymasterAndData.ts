import type { Client, Chain, Account } from "viem";
import type { AlchemyTransport } from "@alchemy/common";
import type { AlchemyWalletApisRpcSchema } from "../schema.js";
import type {
  RequestGasAndPaymasterAndDataRequest,
  RequestGasAndPaymasterAndDataResponse,
} from "./types.js";
import { formatUserOperationRequest } from "viem/account-abstraction";
import {
  formatGasAndPaymasterResponse,
  formatOverridesRequest,
} from "./utils.js";

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
