import {
  AccountNotFoundError,
  IncompatibleClientError,
  deepHexlify,
  type SendUserOperationParameters,
  type SmartContractAccount,
} from "@aa-sdk/core";
import type { Chain, Client, Transport } from "viem";
import { isAlchemySmartAccountClient } from "../client/isAlchemySmartAccountClient.js";
import type { AlchemyRpcSchema } from "../client/types.js";
import type { SimulateUserOperationAssetChangesResponse } from "./types.js";

/**
 * Simulates user operation changes including asset changes for a specified user operation and returns the resulting state changes.
 *
 * @example
 * ```ts
 * import { simulateUserOperationChanges, createAlchemyPublicRpcClient } from "@account-kit/infra";
 *
 * const client = createAlchemyPublicRpcClient(...);
 * const response = await simulateUserOperationChanges(client, {
 *  uo: ...
 * });
 * ```
 *
 * @param {Client<Transport, TChain, TAccount, AlchemyRpcSchema>} client The client instance used to send the simulation request
 * @param {SendUserOperationParameters<TAccount>} args The parameters of the user operation including the account and other overrides
 * @returns {Promise<SimulateUserOperationAssetChangesResponse>} A promise that resolves to the response of the simulation showing the asset changes
 */
export const simulateUserOperationChanges: <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<Transport, TChain, TAccount, AlchemyRpcSchema>,
  args: SendUserOperationParameters<TAccount>
) => Promise<SimulateUserOperationAssetChangesResponse> = async (
  client,
  { account = client.account, overrides, ...params }
) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isAlchemySmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "AlchemySmartAccountClient",
      "SimulateUserOperationAssetChanges",
      client
    );
  }

  const uoStruct = deepHexlify(
    await client.buildUserOperation({
      ...params,
      account,
      overrides,
    })
  );

  return client.request({
    method: "alchemy_simulateUserOperationAssetChanges",
    params: [uoStruct, account.getEntryPoint().address],
  });
};
