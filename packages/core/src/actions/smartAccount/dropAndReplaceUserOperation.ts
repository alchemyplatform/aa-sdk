import type { Chain, Client, Transport } from "viem";
import type {
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import type { SendUserOperationResult } from "../../client/types";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { MismatchingEntryPointError } from "../../errors/entrypoint.js";
import type {
  UserOperationOverrides,
  UserOperationRequest,
  UserOperationStruct,
} from "../../types";
import { bigIntMax, bigIntMultiply } from "../../utils/index.js";
import { _runMiddlewareStack } from "./internal/runMiddlewareStack.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import type { DropAndReplaceUserOperationParameters } from "./types";

export async function dropAndReplaceUserOperation<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  client: Client<TTransport, TChain, TAccount>,
  args: DropAndReplaceUserOperationParameters<TAccount>
): Promise<SendUserOperationResult<TEntryPointVersion>> {
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

  const entryPoint = account.getEntryPoint();
  if (entryPoint.isUserOpVersion(uoToDrop)) {
    throw new MismatchingEntryPointError(entryPoint.version, uoToDrop);
  }

  const uoToSubmit = (
    entryPoint.version === "0.6.0"
      ? {
          initCode: (uoToDrop as UserOperationRequest<"0.6.0">).initCode,
          sender: (uoToDrop as UserOperationRequest<"0.6.0">).sender,
          nonce: (uoToDrop as UserOperationRequest<"0.6.0">).nonce,
          callData: (uoToDrop as UserOperationRequest<"0.6.0">).callData,
          signature: (uoToDrop as UserOperationRequest<"0.6.0">).signature,
        }
      : {
          factory: (uoToDrop as UserOperationRequest<"0.7.0">).factory,
          factoryData: (uoToDrop as UserOperationRequest<"0.7.0">).factoryData,
          sender: (uoToDrop as UserOperationRequest<"0.7.0">).sender,
          nonce: (uoToDrop as UserOperationRequest<"0.7.0">).nonce,
          callData: (uoToDrop as UserOperationRequest<"0.7.0">).callData,
          signature: (uoToDrop as UserOperationRequest<"0.7.0">).signature,
        }
  ) as UserOperationStruct<TEntryPointVersion>;

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

  const _overrides = {
    ...overrides,
    maxFeePerGas: bigIntMax(
      BigInt(maxFeePerGas ?? 0n),
      bigIntMultiply(
        (uoToDrop as UserOperationRequest<TEntryPointVersion>).maxFeePerGas,
        1.1
      )
    ),
    maxPriorityFeePerGas: bigIntMax(
      BigInt(maxPriorityFeePerGas ?? 0n),
      bigIntMultiply(
        (uoToDrop as UserOperationRequest<TEntryPointVersion>)
          .maxPriorityFeePerGas,
        1.1
      )
    ),
  } as UserOperationOverrides<TEntryPointVersion>;

  const uoToSend = await _runMiddlewareStack(client, {
    uo: uoToSubmit,
    overrides: _overrides,
    account,
  });

  return _sendUserOperation(client, {
    uoStruct: uoToSend,
    account,
  });
}
