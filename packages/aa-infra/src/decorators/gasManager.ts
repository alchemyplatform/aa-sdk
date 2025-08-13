import { requestGasAndPaymasterAndData } from "../actions/requestGasAndPaymasterAndData.js";
import type {
  RequestGasAndPaymasterAndDataRequest,
  RequestGasAndPaymasterAndDataResponse,
} from "../actions/types.js";
import type { AlchemyTransport } from "@alchemy/common";
import type { Client, Chain, Account } from "viem";

export type GasManagerActions = {
  requestGasAndPaymasterAndData: (
    params: RequestGasAndPaymasterAndDataRequest,
  ) => Promise<RequestGasAndPaymasterAndDataResponse>;
};

/**
 * This is a decorator that is used to add gas manager actions to a client.
 *
 * @param {object} client - The client to add the actions to.
 * @returns {object} - The client with the actions added.
 */
export const gasManagerActions: <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  client: Client<AlchemyTransport, TChain, TAccount>,
) => GasManagerActions = (client) => ({
  requestGasAndPaymasterAndData: (params) =>
    requestGasAndPaymasterAndData(client, params),
});
