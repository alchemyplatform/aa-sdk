import type { Chain, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../client/smartAccountClient";
import type { SendUserOperationResult } from "../../client/types";
import type { UserOperationOverrides, UserOperationStruct } from "../../types";
import { bigIntMax, bigIntPercent } from "../../utils/index.js";
import { _runMiddlewareStack } from "./internal/runMiddlewareStack.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import type { DropAndReplaceUserOperationParameters } from "./types";

export const dropAndReplaceUserOperation: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: DropAndReplaceUserOperationParameters<TAccount>
) => Promise<SendUserOperationResult> = async (client, args) => {
  const { account = client.account, uoToDrop, overrides } = args;
  if (!account) {
    throw new Error("No account set on client");
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
    maxFeePerGas: bigIntMax(
      BigInt(maxFeePerGas ?? 0n),
      bigIntPercent(uoToDrop.maxFeePerGas, 110n)
    ),
    maxPriorityFeePerGas: bigIntMax(
      BigInt(maxPriorityFeePerGas ?? 0n),
      bigIntPercent(uoToDrop.maxPriorityFeePerGas, 110n)
    ),
    paymasterAndData: uoToDrop.paymasterAndData,
  };

  const uoToSend = await _runMiddlewareStack(client, {
    uo: uoToSubmit,
    overrides: _overrides,
    account,
  });

  return _sendUserOperation(client, { uoStruct: uoToSend, account });
};
