import {
  AccountNotFoundError,
  IncompatibleClientError,
  deepHexlify,
  type SendUserOperationParameters,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import type { Chain, Client, Transport } from "viem";
import { isAlchemySmartAccountClient } from "../client/isAlchemySmartAccountClient.js";
import type { AlchemyRpcSchema } from "../client/types";
import type { SimulateUserOperationAssetChangesResponse } from "./types";

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
