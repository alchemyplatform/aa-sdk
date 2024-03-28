import type { Chain, Client, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import type { SendUserOperationResult } from "../../client/types";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import type { UserOperationOverrides, UserOperationStruct } from "../../types";
import { bigIntMax, bigIntMultiply } from "../../utils/index.js";
import { _runMiddlewareStack } from "./internal/runMiddlewareStack.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import type { DropAndReplaceUserOperationParameters } from "./types";

export const dropAndReplaceUserOperation: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends Record<string, any> = Record<string, any>
>(
  client: Client<TTransport, TChain, TAccount>,
  args: DropAndReplaceUserOperationParameters<TAccount, TContext>
) => Promise<SendUserOperationResult> = async (client, args) => {
  const { account = client.account, uoToDrop, overrides } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }
  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "dropAndReplaceUserOperation",
      client
    );
  }

  const uoToSubmit = {
    initCode: uoToDrop.initCode,
    sender: uoToDrop.sender,
    nonce: uoToDrop.nonce,
    callData: uoToDrop.callData,
    signature: uoToDrop.signature,
  } as UserOperationStruct;

  // Run once to get the fee estimates
  // This can happen at any part of the middleware stack, so we want to run it all
  const { maxFeePerGas, maxPriorityFeePerGas } = await _runMiddlewareStack(
    client,
    {
      uo: uoToSubmit,
      overrides,
      account,
    }
  );

  const _overrides: UserOperationOverrides = {
    ...overrides,
    maxFeePerGas: bigIntMax(
      BigInt(maxFeePerGas ?? 0n),
      bigIntMultiply(uoToDrop.maxFeePerGas, 1.1)
    ),
    maxPriorityFeePerGas: bigIntMax(
      BigInt(maxPriorityFeePerGas ?? 0n),
      bigIntMultiply(uoToDrop.maxPriorityFeePerGas, 1.1)
    ),
  };

  const uoToSend = await _runMiddlewareStack(client, {
    uo: uoToSubmit,
    overrides: _overrides,
    account,
  });

  return _sendUserOperation(client, { uoStruct: uoToSend, account });
};
