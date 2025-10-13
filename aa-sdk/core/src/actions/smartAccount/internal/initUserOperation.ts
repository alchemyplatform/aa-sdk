import { type Chain, type Transport, concatHex, toHex, zeroHash } from "viem";
import {
  isSmartAccountWithSigner,
  type GetEntryPointFromAccount,
  type SmartContractAccount,
} from "../../../account/smartContractAccount.js";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient.js";
import { AccountNotFoundError } from "../../../errors/account.js";
import { ChainNotFoundError } from "../../../errors/client.js";
import type { UserOperationStruct } from "../../../types.js";
import { conditionalReturn, type Deferrable } from "../../../utils/index.js";
import type {
  BuildUserOperationParameters,
  SendUserOperationParameters,
  UserOperationContext,
} from "../types.js";

/**
 * Description internal action function of SmartAccountClient for initializing
 * a user operation for the sender account
 *
 * @template {Transport} TTransport
 * @template {Chain | undefined} TChain
 * @template {SmartContractAccount | undefined} TAccount
 * @template {UserOperationContext | undefined} TContext
 * @template {GetEntryPointFromAccount} TEntryPointVersion
 * @param {BaseSmartAccountClient<TTransport, TChain, TAccount>} client smart account client
 * @param {SendUserOperationParameters<TAccount, TContext, TEntryPointVersion> | BuildUserOperationParameters<TAccount, TContext, TEntryPointVersion>} args send user operation parameters
 * @returns {Promise<Deferrable<UserOperationStruct<TEntryPointVersion>>>} initialized user operation struct
 */
export async function _initUserOperation<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends
    GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args:
    | SendUserOperationParameters<TAccount, TContext, TEntryPointVersion>
    | BuildUserOperationParameters<TAccount, TContext, TEntryPointVersion>,
): Promise<Deferrable<UserOperationStruct<TEntryPointVersion>>> {
  const { account = client.account, uo, overrides } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!client.chain) {
    throw new ChainNotFoundError();
  }

  const entryPoint = account.getEntryPoint();

  const callData = Array.isArray(uo)
    ? account.encodeBatchExecute(uo)
    : typeof uo === "string"
      ? uo
      : account.encodeExecute(uo);

  const signature = account.getDummySignature();

  const nonce =
    overrides?.nonce ?? account.getAccountNonce(overrides?.nonceKey);

  const struct =
    entryPoint.version === "0.6.0"
      ? ({
          initCode: account.getInitCode(),
          sender: account.address,
          nonce,
          callData,
          signature,
        } as Deferrable<UserOperationStruct<TEntryPointVersion>>)
      : ({
          factory: conditionalReturn(
            account.isAccountDeployed().then((deployed) => !deployed),
            account.getFactoryAddress,
          ),
          factoryData: conditionalReturn(
            account.isAccountDeployed().then((deployed) => !deployed),
            account.getFactoryData,
          ),
          sender: account.address,
          nonce,
          callData,
          signature,
        } as Deferrable<UserOperationStruct<TEntryPointVersion>>);

  const is7702 =
    account.source === "ModularAccountV2" &&
    isSmartAccountWithSigner(account) &&
    (await account.getSigner().getAddress()).toLowerCase() ===
      account.address.toLowerCase();

  if (is7702) {
    if (entryPoint.version !== "0.7.0") {
      throw new Error("7702 is only compatible with EntryPoint v0.7.0");
    }

    const [implementationAddress, code = "0x", nonce] = await Promise.all([
      account.getImplementationAddress(),
      client.getCode({ address: account.address }),
      client.getTransactionCount({ address: account.address }),
    ]);

    const isAlreadyDelegated =
      code.toLowerCase() ===
      concatHex(["0xef0100", implementationAddress]).toLowerCase();

    if (!isAlreadyDelegated) {
      (struct as UserOperationStruct<"0.7.0">).eip7702Auth = {
        chainId: toHex(client.chain.id),
        nonce: toHex(nonce),
        address: implementationAddress,
        r: zeroHash, // aka `bytes32(0)`
        s: zeroHash,
        yParity: "0x0",
      };
    }
  }

  return struct;
}
