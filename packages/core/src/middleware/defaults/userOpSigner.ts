import { AccountNotFoundError } from "../../errors/account.js";
import { ChainNotFoundError } from "../../errors/client.js";
import { InvalidUserOperationError } from "../../errors/useroperation.js";
import {
  deepHexlify,
  isValidRequest,
  resolveProperties,
} from "../../utils/index.js";
import type { ClientMiddlewareFn } from "../types";

export const defaultUserOpSigner: ClientMiddlewareFn = async (
  struct,
  { client, account = client.account }
) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!client?.chain) {
    throw new ChainNotFoundError();
  }

  const resolvedStruct = await resolveProperties(struct);
  const request = deepHexlify(resolvedStruct);
  if (!isValidRequest(request)) {
    throw new InvalidUserOperationError(resolvedStruct);
  }

  return {
    ...resolvedStruct,
    signature: await account.signUserOperationHash(
      account.getEntryPoint().getUserOperationHash(request)
    ),
  };
};
