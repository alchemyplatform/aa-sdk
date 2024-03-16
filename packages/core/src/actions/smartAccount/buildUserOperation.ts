import type { Address, Chain, Client, Hex, Transport } from "viem";
import {
  parseFactoryAddressFromAccountInitCode,
  type SmartContractAccount,
} from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import type { EntryPointVersion } from "../../entrypoint/types.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import { MismatchingEntryPointError } from "../../errors/entrypoint.js";
import type { UserOperationStruct } from "../../types.js";
import type { Deferrable } from "../../utils/index.js";
import { _runMiddlewareStack } from "./internal/runMiddlewareStack.js";
import type { SendUserOperationParameters } from "./types";

export async function buildUserOperation<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TEntryPointVersion, TAccount>
): Promise<UserOperationStruct<TEntryPointVersion>> {
  const { account = client.account, overrides, uo } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "buildUserOperation",
      client
    );
  }

  const entryPoint = account.getEntryPoint();
  if (overrides && !entryPoint.isUserOpVersion(overrides)) {
    throw new MismatchingEntryPointError(entryPoint.version, overrides);
  }

  const getInitCode = account.getInitCode();
  const getFactoryAndData = getInitCode.then((initCode) =>
    initCode === "0x"
      ? ["0x0" as Address, "0x" as Hex]
      : parseFactoryAddressFromAccountInitCode(initCode)
  );

  const callData = Array.isArray(uo)
    ? account.encodeBatchExecute(uo)
    : typeof uo === "string"
    ? uo
    : account.encodeExecute(uo);

  const signature = account.getDummySignature();

  const nonce = account.getNonce(overrides?.nonceKey);

  const _uo =
    entryPoint.version === "0.6.0"
      ? ({
          initCode: getInitCode,
          sender: account.address,
          nonce,
          callData,
          signature,
        } as Deferrable<UserOperationStruct<"0.6.0">>)
      : ({
          factory: getFactoryAndData.then(([factory]) => factory),
          factoryData: getFactoryAndData.then(([, data]) => data),
          sender: account.address,
          nonce,
          callData,
          signature,
        } as Deferrable<UserOperationStruct<"0.7.0">>);

  return _runMiddlewareStack(client, {
    uo: _uo as Deferrable<UserOperationStruct<TEntryPointVersion>>,
    overrides,
    account,
  });
}
