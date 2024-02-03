import type { Chain, Client, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { IncompatibleClientError } from "../../errors/client.js";
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
  client: Client<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TAccount>
) => Promise<boolean> = async (client, args) => {
  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "checkGasSponsorshipEligibility"
    );
  }

  return buildUserOperation(client, args)
    .then(
      (userOperationStruct: UserOperationStruct) =>
        userOperationStruct.paymasterAndData !== "0x" &&
        userOperationStruct.paymasterAndData !== null
    )
    .catch(() => false);
};
