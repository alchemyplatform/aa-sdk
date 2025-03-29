import type { Chain, Client, Transport } from "viem";
import type {
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import type { SendUserOperationResult } from "../../client/types";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import type {
  UserOperationOverrides,
  UserOperationRequest,
  UserOperationStruct,
} from "../../types";
import {
  bigIntMax,
  bigIntMultiply,
  resolveProperties,
} from "../../utils/index.js";
import { _runMiddlewareStack } from "./internal/runMiddlewareStack.js";
import { _sendUserOperation } from "./internal/sendUserOperation.js";
import type {
  DropAndReplaceUserOperationParameters,
  UserOperationContext,
} from "./types";
import { clientHeaderTrack } from "../../index.js";

/**
 * Drops an existing user operation and replaces it with a new one while ensuring the appropriate fees and overrides are applied.
 *
 * @example
 * ```ts
 * import {
 *  createSmartAccountClient,
 * } from "@aa-sdk/core";
 *
 * // smart account client is already extended with dropAndReplaceUserOperation
 * const client = createSmartAccountClient(...);
 * const { request } = await client.sendUserOperation(...);
 * const result = await client.dropAndReplaceUserOperation({
 *  uoToDrop: request,
 *  account, // only required if the client above is not connected to an account
 * });
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client_ The client instance with the transport, chain, and account information
 * @param {DropAndReplaceUserOperationParameters<TAccount, TContext>} args The parameters required for dropping and replacing the user operation including the account, operation to drop, overrides, and context
 * @returns {Promise<SendUserOperationResult<TEntryPointVersion>>} A promise that resolves to the result of sending the new user operation
 */
export async function dropAndReplaceUserOperation<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  client_: Client<TTransport, TChain, TAccount>,
  args: DropAndReplaceUserOperationParameters<TAccount, TContext>
): Promise<SendUserOperationResult<TEntryPointVersion>> {
  const client = clientHeaderTrack(client_, "dropAndReplaceUserOperation");
  const { account = client.account, uoToDrop, overrides, context } = args;
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

  const uoToSubmit = (
    entryPoint.version === "0.6.0"
      ? {
          initCode: (uoToDrop as UserOperationRequest<"0.6.0">).initCode,
          sender: (uoToDrop as UserOperationRequest<"0.6.0">).sender,
          nonce: (uoToDrop as UserOperationRequest<"0.6.0">).nonce,
          callData: (uoToDrop as UserOperationRequest<"0.6.0">).callData,
          signature: await account.getDummySignature(),
        }
      : {
          ...((uoToDrop as UserOperationRequest<"0.7.0">).factory &&
          (uoToDrop as UserOperationRequest<"0.7.0">).factoryData
            ? {
                factory: (uoToDrop as UserOperationRequest<"0.7.0">).factory,
                factoryData: (uoToDrop as UserOperationRequest<"0.7.0">)
                  .factoryData,
              }
            : {}),
          sender: (uoToDrop as UserOperationRequest<"0.7.0">).sender,
          nonce: (uoToDrop as UserOperationRequest<"0.7.0">).nonce,
          callData: (uoToDrop as UserOperationRequest<"0.7.0">).callData,
          signature: await account.getDummySignature(),
        }
  ) as UserOperationStruct<TEntryPointVersion>;

  // If the fee estimator is not the one estimating fees, then this won't work
  // however, we have migrated to using erc7677middleware for alchemy paymaster flows
  // and most of the other paymasters we've seen don't do fee estimation
  const { maxFeePerGas, maxPriorityFeePerGas } = await resolveProperties(
    await client.middleware.feeEstimator(uoToSubmit, { account, client })
  );

  const _overrides = {
    ...overrides,
    maxFeePerGas: bigIntMax(
      BigInt(maxFeePerGas ?? 0n),
      bigIntMultiply(uoToDrop.maxFeePerGas, 1.1)
    ),
    maxPriorityFeePerGas: bigIntMax(
      BigInt(maxPriorityFeePerGas ?? 0n),
      bigIntMultiply(uoToDrop.maxPriorityFeePerGas, 1.1)
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
    context,
    overrides: _overrides,
  });
}
