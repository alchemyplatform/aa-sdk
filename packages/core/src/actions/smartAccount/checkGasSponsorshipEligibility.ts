import type { Chain, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import type { BaseSmartAccountClient } from "../../client/smartAccountClient.js";
import type { UserOperationStruct } from "../../types.js";
import { buildUserOperation } from "./buildUserOperation.js";
import type { SendUserOperationParameters } from "./types";

export const checkGasSponsorshipEligibility: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TAccount>
) => Promise<boolean> = async (client, args) => {
  return buildUserOperation(client, args)
    .then(
      (userOperationStruct: UserOperationStruct) =>
        userOperationStruct.paymasterAndData !== "0x" &&
        userOperationStruct.paymasterAndData !== null
    )
    .catch(() => false);
};
