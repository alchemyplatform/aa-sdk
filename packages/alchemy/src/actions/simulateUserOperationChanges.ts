import {
  AccountNotFoundError,
  deepHexlify,
  type SendUserOperationParameters,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import type { Chain, Transport } from "viem";
import type { AlchemySmartAccountClient_Base } from "../client/smartAccountClient";
import type { SimulateUserOperationAssetChangesResponse } from "./types";

export const simulateUserOperationChanges: <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: AlchemySmartAccountClient_Base<Transport, TChain, TAccount>,
  args: SendUserOperationParameters<TAccount>
) => Promise<SimulateUserOperationAssetChangesResponse> = async (
  client,
  { account = client.account, ...params }
) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  const uoStruct = deepHexlify(
    await client.buildUserOperation({
      ...params,
      account,
    })
  );

  return client.request({
    method: "alchemy_simulateUserOperationAssetChanges",
    params: [uoStruct, account.getEntrypoint()],
  });
};
